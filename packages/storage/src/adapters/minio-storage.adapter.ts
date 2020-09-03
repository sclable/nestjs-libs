/**
 * @see https://docs.minio.io/docs/javascript-client-api-reference.html
 */
import { Readable } from 'stream'

import { Injectable, Logger } from '@nestjs/common'
import { Client } from 'minio'

import { StorageDriverContract } from '../contracts'
import { FileMetaData, MinioStorageAdapterOptions } from '../interfaces'
import { AbstractAdapter } from './abstract.adapter'

import ReadableStream = NodeJS.ReadableStream

@Injectable()
export class MinioStorageAdapter extends AbstractAdapter implements StorageDriverContract {
  private readonly minioClient: Client

  public constructor(
    protected readonly options: MinioStorageAdapterOptions,
    protected readonly logger: Logger,
  ) {
    super()
    this.minioClient = new Client(this.options)
    this.logger.setContext(MinioStorageAdapter.name)
    this.logger.log('MINIO Storage Disk initialized')
  }

  public async createBucket(bucket: string): Promise<void> {
    if (this.buckets.includes(bucket)) {
      return
    }
    const bucketExists = await this.minioClient.bucketExists(bucket)
    if (bucketExists) {
      this.buckets.push(bucket)

      return
    }
    await this.minioClient.makeBucket(bucket, 'us-east-1') // region can be anything (valid) here
    this.buckets.push(bucket)
  }

  public async putObject(
    bucket: string,
    id: string,
    content: Buffer | Readable,
    metadata?: FileMetaData,
  ): Promise<string> {
    await this.createBucket(bucket)

    if (metadata && metadata.name) {
      metadata.name = encodeURI(metadata.name)
    }
    const size = metadata && metadata.size ? metadata.size : undefined
    let result: string
    try {
      result = await this.minioClient.putObject(bucket, id, content, size, metadata)
      this.logger.debug(`File is uploaded successfully: ${bucket}/${id} (etag: ${result})`)
    } catch (error) {
      this.logger.error(`Error during file upload ${bucket}/${id}`)
      throw new Error(`File upload failed ${error.toString()}`)
    }

    return result
  }

  public async getMetaData(bucket: string, id: string): Promise<FileMetaData> {
    const metadata = await this.minioClient.statObject(bucket, id)

    this.logger.debug(`Metadata returned for: ${bucket}/${id}`)

    return Object.assign({}, metadata.metaData as FileMetaData, {
      lastModified: metadata.lastModified,
      etag: metadata.etag,
    })
  }

  public async getObjectStream(bucket: string, id: string): Promise<ReadableStream> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const stream = new Readable({ read() {} })

    this.minioClient
      .getObject(bucket, id)
      .then(dataStream => {
        dataStream.on('data', chunk => {
          stream.push(chunk)
        })
        dataStream.on('end', () => {
          stream.push(null)
        })
        dataStream.on('error', error => {
          throw Error('Error during downloading the file. ' + error)
        })

        this.logger.debug(`Object stream returned for: ${bucket}/${id}`)
      })
      .catch(error => {
        throw Error('Error during downloading the file. ' + error)
      })

    return stream
  }

  public async getObject(bucket: string, id: string): Promise<Buffer> {
    return this.streamToBuffer(await this.getObjectStream(bucket, id))
  }

  public async deleteObject(bucket: string, id: string): Promise<boolean> {
    return new Promise(resolve => {
      this.minioClient.removeObject(bucket, id, error => {
        resolve(!!error)
      })
    })
  }

  public async getDownloadUrl(
    bucket: string,
    id: string,
    filename: string,
    expiry = this.options.linkExpiryInSeconds,
  ): Promise<string> {
    return this.minioClient.presignedGetObject(bucket, id, expiry, {
      'response-content-disposition': `attachment; filename="${filename}"`,
    })
  }

  public async getUploadUrl(
    bucket: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUploaded: (record: any) => void,
    expiry = this.options.linkExpiryInSeconds,
  ): Promise<string> {
    await this.createBucket(bucket)

    const uploadUrl = this.minioClient.presignedPutObject(bucket, id, expiry)

    const listener = this.minioClient.listenBucketNotification(bucket, id, '', [
      's3:ObjectCreated:*',
    ])
    listener.on('notification', record => {
      this.logger.debug(`External file upload finished: ${bucket}/${id}`)
      onUploaded(record)
      listener.removeAllListeners()
    })

    return uploadUrl
  }
}
