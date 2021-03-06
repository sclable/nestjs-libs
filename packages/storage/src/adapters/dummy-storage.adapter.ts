import { Readable } from 'stream'

import { Logger } from '@nestjs/common'
import { v4 as uuidV4 } from 'uuid'

import { StorageDriverContract } from '../contracts'
import { FileMetaData } from '../interfaces'

import ReadableStream = NodeJS.ReadableStream

export class DummyStorageAdapter implements StorageDriverContract {
  private readonly logger: Logger = new Logger(DummyStorageAdapter.name)
  public constructor() {
    this.logger.log('DUMMY Storage Disk initialized')
  }

  public async createBucket(bucket: string): Promise<void> {
    this.logger.log(`Bucket created: ${bucket}`)

    return
  }

  public async putObject(bucket: string, id: string): Promise<string> {
    const result = `random-etag-${uuidV4()}`

    this.logger.log(`Object created: ${bucket}/${id}, result: ${result}`)

    return result
  }

  public async getObjectStream(bucket: string, id: string): Promise<ReadableStream> {
    const result = `random-string-${uuidV4()}`

    this.logger.log(`Object returned: ${bucket}/${id}, result: ${result}`)

    const readable = new Readable()
    readable.push(result)
    readable.push(null)

    return readable
  }

  public async getObject(bucket: string, id: string): Promise<Buffer> {
    const result = `random-string-${uuidV4()}`

    this.logger.log(`Object returned: ${bucket}/${id}, result: ${result}`)

    return Buffer.from(result, 'utf8')
  }

  public async deleteObject(bucket: string, id: string): Promise<boolean> {
    this.logger.log(`Object deleted: ${bucket}/${id}`)

    return true
  }

  public async getMetaData(bucket: string, id: string): Promise<FileMetaData> {
    const result = {
      name: uuidV4(),
      size: 9999,
    }

    this.logger.log(
      `Metadata returned for: ${bucket}/${id}, result: ${JSON.stringify(result)}`,
    )

    return result
  }

  public async getDownloadUrl(bucket: string, id: string, filename: string): Promise<string> {
    const result = `http://${uuidV4()}--${filename}`

    this.logger.log(`Download URL returned for ${bucket}/${id}, result: ${result}`)

    return result
  }

  public async getUploadUrl(
    bucket: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUploaded: (record: any) => void,
  ): Promise<string> {
    const result = `http://${uuidV4()}`

    onUploaded({})

    this.logger.log(`Upload URL returned for ${bucket}/${id}, result: ${result}`)

    return result
  }
}
