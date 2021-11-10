import { Inject, Injectable, Optional } from '@nestjs/common'
import { QueueServiceContract } from '@sclable/nestjs-queue'

import { AzureBlobStorageAdapter, DummyStorageAdapter, MinioStorageAdapter } from './adapters'
import { LocalStorageAdapter } from './adapters/local-storage.adapter'
import { QUEUE_SERVICE, STORAGE_MODULE_OPTIONS } from './constants'
import { StorageDriverContract } from './contracts'
import { StorageType } from './enums'
import {
  AzureBlobStorageAdapterOptions,
  LocalStorageAdapterOptions,
  MinioStorageAdapterOptions,
  StorageModuleOptions,
} from './interfaces'

/**
 * Storage Manager Service
 *
 * Inject it for
 */

@Injectable()
export class StorageManager {
  private readonly disks: Map<StorageType, StorageDriverContract> = new Map<
    StorageType,
    StorageDriverContract
  >()

  public constructor(
    @Inject(STORAGE_MODULE_OPTIONS)
    private readonly storageModuleOptions: StorageModuleOptions,
    @Optional() @Inject(QUEUE_SERVICE) private readonly queueService: QueueServiceContract,
  ) {}

  private static assertNever(object: never): never {
    throw new Error(`All cases must be handled here: ${object}`)
  }

  public disk(driver?: StorageType): StorageDriverContract {
    driver = driver || this.storageModuleOptions.defaultDriver

    if (!this.disks.has(driver)) {
      this.initDisk(driver)
    }

    const disk = this.disks.get(driver)
    if (!disk) {
      throw new Error(`${driver.toString} Storage Disk is not ready to use`)
    }

    return disk
  }

  private initDisk(driver: StorageType): void {
    if (!this.storageModuleOptions.config[driver]) {
      throw Error(
        `${driver.toUpperCase()} Storage Driver is not configured, disk cannot be created`,
      )
    }

    switch (driver) {
      case StorageType.DUMMY: {
        if (!this.storageModuleOptions.config[StorageType.DUMMY]?.enabled) {
          throw Error('Dummy Storage Disk is disabled, but accessed.')
        }
        this.disks.set(StorageType.DUMMY, new DummyStorageAdapter())
        break
      }

      case StorageType.LOCAL: {
        this.disks.set(
          StorageType.LOCAL,
          new LocalStorageAdapter(
            this.storageModuleOptions.config[StorageType.LOCAL] as LocalStorageAdapterOptions,
          ),
        )
        break
      }

      case StorageType.MINIO: {
        this.disks.set(
          StorageType.MINIO,
          new MinioStorageAdapter(
            this.storageModuleOptions.config[StorageType.MINIO] as MinioStorageAdapterOptions,
          ),
        )
        break
      }

      case StorageType.AZURE: {
        this.disks.set(
          StorageType.AZURE,
          new AzureBlobStorageAdapter(
            this.storageModuleOptions.config[
              StorageType.AZURE
            ] as AzureBlobStorageAdapterOptions,
            this.queueService,
          ),
        )
        break
      }

      default: {
        StorageManager.assertNever(driver)
      }
    }
  }
}
