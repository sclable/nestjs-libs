import { QueueServiceContract } from '@sclable/nestjs-queue'

import { StorageType } from '../enums'
import {
  AzureBlobStorageAdapterOptions,
  DummyStorageAdapterOptions,
  LocalStorageAdapterOptions,
  MinioStorageAdapterOptions,
} from './storage-adapter-options'

export interface StorageModuleOptions {
  /**
   * Default storage driver
   * Used for access without specifying storage driver
   */
  defaultDriver: StorageType
  /** Optional queue service provider for storage events */
  queueService?: QueueServiceContract
  /** Driver configurations */
  config: {
    [StorageType.DUMMY]?: DummyStorageAdapterOptions
    [StorageType.LOCAL]?: LocalStorageAdapterOptions
    [StorageType.MINIO]?: MinioStorageAdapterOptions
    [StorageType.AZURE]?: AzureBlobStorageAdapterOptions
  }
}
