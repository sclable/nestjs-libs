import { StorageAdapterOptions } from './storage-adapter-options.interface'

export interface AzureBlobStorageAdapterOptions extends StorageAdapterOptions {
  accountName: string
  accountKey: string
  linkExpiryInSeconds: number
  fileUploadedQueueName?: string
}
