/**
 * @see https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob/?view=azure-node-latest
 */
import { Readable } from 'stream'

import { AbortController } from '@azure/abort-controller'
import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { QueueMessage, QueueServiceContract } from '@sclable/nestjs-queue'

import { StorageDriverContract } from '../contracts'
import { AzureBlobStorageAdapterOptions, FileMetaData } from '../interfaces'
import { AbstractAdapter } from './abstract.adapter'

import ReadableStream = NodeJS.ReadableStream

@Injectable()
export class AzureBlobStorageAdapter
  extends AbstractAdapter
  implements StorageDriverContract, OnModuleInit
{
  private readonly blobServiceClient: BlobServiceClient
  private readonly onUploadedCallbacks: Map<string, CallableFunction> = new Map()
  private readonly logger: Logger = new Logger(AzureBlobStorageAdapter.name)

  public constructor(
    private readonly options: AzureBlobStorageAdapterOptions,
    private readonly queueService?: QueueServiceContract,
  ) {
    super()
    this.blobServiceClient = new BlobServiceClient(
      `https://${options.accountName}.blob.core.windows.net`,
      new StorageSharedKeyCredential(options.accountName, options.accountKey),
    )
    this.logger.log('AZURE Storage Disk initialized')
  }

  public async onModuleInit(): Promise<void> {
    if (this.queueService) {
      if (!this.options.fileUploadedQueueName) {
        this.logger.error('Environment variable FILE_UPLOADED_QUEUE_NAME is not defined!')

        return
      }
      await this.queueService.addConsumer(
        this.options.fileUploadedQueueName,
        this.fileUploadedHandler,
      )
    }
  }

  public async createBucket(bucket: string): Promise<void> {
    if (this.buckets.includes(bucket)) {
      return
    }

    const containerClient = this.blobServiceClient.getContainerClient(bucket)
    if (await containerClient.exists()) {
      return
    }

    await containerClient.create()

    this.buckets.push(bucket)
  }

  public async deleteObject(bucket: string, id: string): Promise<boolean> {
    const containerClient = this.blobServiceClient.getContainerClient(bucket)
    const blobClient = containerClient.getBlobClient(id)

    const response = await blobClient.delete()

    return !response.errorCode
  }

  public async getDownloadUrl(bucket: string, id: string, filename: string): Promise<string> {
    return this.getSignedPublicUrl(bucket, id, 'r', filename)
  }

  public async getMetaData(bucket: string, id: string): Promise<FileMetaData> {
    const containerClient = this.blobServiceClient.getContainerClient(bucket)
    const blobClient = containerClient.getBlobClient(id)
    const properties = await blobClient.getProperties()

    this.logger.debug(`Metadata returned for: ${bucket}/${id}`)

    return Object.assign({}, properties.metadata as unknown as FileMetaData, {
      lastModified: properties.lastModified,
      etag: properties.etag,
    })
  }

  public async getObjectStream(bucket: string, id: string): Promise<ReadableStream> {
    const containerClient = this.blobServiceClient.getContainerClient(bucket)
    const blobClient = containerClient.getBlobClient(id)
    const stream = (await blobClient.download(0)).readableStreamBody

    if (!stream) {
      throw new Error(`Object cannot be returned for ${bucket}/${id}`)
    }

    this.logger.debug(`Object stream returned for: ${bucket}/${id}`)

    return stream
  }

  public async getObject(bucket: string, id: string): Promise<Buffer> {
    return this.streamToBuffer(await this.getObjectStream(bucket, id))
  }

  public async getUploadUrl(
    bucket: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUploaded: (record: any) => void,
  ): Promise<string> {
    await this.createBucket(bucket)

    if (this.queueService) {
      this.onUploadedCallbacks.set(
        id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (message: QueueMessage<any>) => {
          this.logger.log(`External file upload finished: ${bucket}/${id}`)
          onUploaded(message)
          this.onUploadedCallbacks.delete(id)
        },
      )
    }

    return this.getSignedPublicUrl(bucket, id, 'c')
  }

  public async putObject(
    bucket: string,
    id: string,
    content: Buffer | Readable,
  ): Promise<string> {
    await this.createBucket(bucket)

    const containerClient = this.blobServiceClient.getContainerClient(bucket)
    const blobClient = containerClient.getBlobClient(id)
    const blockBlobClient = blobClient.getBlockBlobClient()

    if (content instanceof Buffer) {
      const readable = new Readable()
      readable.push(content)
      readable.push(null)

      content = readable
    }

    const response = await blockBlobClient.uploadStream(content, 4 * 1024 * 1024, 20, {
      abortSignal: AbortController.timeout(30 * 60 * 1000),
    })

    if (response.errorCode) {
      throw new Error(
        `Object cannot be uploaded to ${bucket}/${id}, error code: ${response.errorCode}`,
      )
    }

    this.logger.debug(
      `File is uploaded successfully: ${bucket}/${id} (etag: ${response.etag})`,
    )

    return response.etag || 'undefined'
  }

  private fileUploadedHandler = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: QueueMessage<any>,
  ): void => {
    message.ack()
    const body = message.getContent()
    if (body.eventType !== 'Microsoft.Storage.BlobCreated') {
      return
    }
    const id = body.subject.split('/').pop()
    if (this.onUploadedCallbacks.has(id)) {
      const callback = this.onUploadedCallbacks.get(id)
      if (callback) {
        callback(message)
      }
    }
  }

  private getSignedPublicUrl(
    bucket: string,
    id: string,
    permissions: string,
    filename?: string,
    linkExpiryInSeconds = this.options.linkExpiryInSeconds,
  ): string {
    const expiryDate = new Date()
    const linkExpiryInMinutes = linkExpiryInSeconds * 60

    expiryDate.setMinutes(expiryDate.getMinutes() + linkExpiryInMinutes)

    const sasSignatureValues: BlobSASSignatureValues = {
      containerName: bucket,
      blobName: id,
      permissions: BlobSASPermissions.parse(permissions),
      expiresOn: expiryDate,
    }
    if (filename) {
      sasSignatureValues.contentDisposition = `attachment; filename="${filename}"`
    }

    const sasParams = generateBlobSASQueryParameters(
      sasSignatureValues,
      new StorageSharedKeyCredential(this.options.accountName, this.options.accountKey),
    )

    return `https://${
      this.options.accountName
    }.blob.core.windows.net/${bucket}/${id}?${sasParams.toString()}`
  }
}
