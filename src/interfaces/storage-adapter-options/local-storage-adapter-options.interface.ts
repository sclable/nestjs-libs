import { StorageAdapterOptions } from './storage-adapter-options.interface'

export interface LocalStorageAdapterOptions extends StorageAdapterOptions {
  basePath: string
}
