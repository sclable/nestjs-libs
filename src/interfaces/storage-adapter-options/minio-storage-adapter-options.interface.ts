import { ClientOptions } from 'minio'

import { StorageAdapterOptions } from './storage-adapter-options.interface'

export interface MinioStorageAdapterOptions extends StorageAdapterOptions, ClientOptions {
  linkExpiryInSeconds: number
}
