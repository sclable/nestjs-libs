import { Readable } from 'stream'

import ReadableStream = NodeJS.ReadableStream
import { FileMetaData } from '../interfaces'

export interface StorageDriverContract {
  createBucket(bucket: string): Promise<void>
  putObject(
    bucket: string,
    id: string,
    content: Buffer | Readable,
    metadata?: FileMetaData,
  ): Promise<string>
  getObject(bucket: string, id: string): Promise<Buffer>
  getObjectStream(bucket: string, id: string): Promise<ReadableStream>
  deleteObject(bucket: string, id: string): Promise<boolean>
  getMetaData(bucket: string, id: string): Promise<FileMetaData | null>
  getDownloadUrl(bucket: string, id: string, filename: string): Promise<string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUploadUrl(bucket: string, id: string, onUploaded: (record: any) => void): Promise<string>
}
