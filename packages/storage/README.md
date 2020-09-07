# NestJS Storage Library

## Features
At this time the library has the following adapters implemented:
* dummy (does nothing)
* local (uses local file system)
* minio (uses minio service)
* azure-blob-storage (uses azure blob storage)

## Setting up

### Install
```bash
npm install --save @sclable/nestjs-storage
```

### Import StorageModule to your application
```javascript
// app/src/app.module.ts

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  StorageModule as StorageModuleLibrary,
  StorageModuleOptions,
  StorageType,
} from '@sclable/nestjs-auth'

@Module({
  imports: [
    // ...
    StorageModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<StorageModuleOptions>('storage', {
          defaultDriver: StorageType.DUMMY,
          config: {},
        }),
      }),
      inject: [ConfigService],
    }),
    // ...
  ],
})
export class AppModule {}
```
In case you need to use the `azure-blob-storage` adapter and you need to rely on storage callback events then you need to attach a queue service as well.
```javascript
// app/src/app.module.ts

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  StorageModule as StorageModuleLibrary,
  StorageModuleOptions,
  StorageType,
} from '@sclable/nestjs-auth'
import { QUEUE_SERVICE, QueueServiceContract } from '@sclable/nestjs-queue'

@Module({
  imports: [
    // ...
    StorageModule.forRootAsync({
      useFactory: (config: ConfigService, queueService: QueueServiceContract) => ({
        ...config.get<StorageModuleOptions>('storage', {
          defaultDriver: StorageType.DUMMY,
          config: {},
        }),
        queueService,
      }),
      inject: [ConfigService, QUEUE_SERVICE],
    }),
    // ...
  ],
})
export class AppModule {}
```

### Create configuration file
In the application's configuration folder there must be a file which configures the storage library. You can simply copy `src/examples/storage.config.ts` and make some changes if needed.
```javascript
import path from 'path'

import { registerAs } from '@nestjs/config'
import { StorageModuleOptions, StorageType } from '@sclable/nestjs-storage'

export default registerAs(
  'storage',
  (): StorageModuleOptions => ({
    defaultDriver: (process.env.STORAGE_DEFAULT_DRIVER || StorageType.DUMMY) as StorageType,
    config: {
      [StorageType.DUMMY]: {
        enabled: true,
      },
      [StorageType.LOCAL]: {
        basePath: path.join(
          __dirname,
          '../../../..',
          process.env.STORAGE_LOCAL_BASE_PATH || 'storage/build',
        ),
      },
      [StorageType.MINIO]: {
        endPoint: process.env.STORAGE_MINIO_ENDPOINT || 'localhost',
        port: +(process.env.STORAGE_MINIO_PORT || 9000),
        useSSL: process.env.STORAGE_MINIO_SSL === 'true',
        accessKey: process.env.STORAGE_MINIO_ACCESS_KEY || 'minio',
        secretKey: process.env.STORAGE_MINIO_SECRET_KEY || 'minio123',
        linkExpiryInSeconds: +(process.env.STORAGE_LINK_EXPIRY_IN_SECONDS || 60),
      },
      [StorageType.AZURE]: {
        accountName:
          process.env.STORAGE_AZURE_ACCOUNT_NAME || 'define STORAGE_AZURE_ACCOUNT_NAME',
        accountKey:
          process.env.STORAGE_AZURE_ACCOUNT_KEY || 'define STORAGE_AZURE_ACCOUNT_KEY',
        linkExpiryInSeconds: +(process.env.STORAGE_LINK_EXPIRY_IN_SECONDS || 60),
        fileUploadedQueueName:
          process.env.STORAGE_AZURE_FILE_UPLOADED_QUEUE_NAME ||
          'define STORAGE_AZURE_FILE_UPLOADED_QUEUE_NAME',
      },
    },
  }),
)

```
### Add configuration to your .env file
```dotenv
## STORAGE_DEFAULT_DRIVER=[dummy|local|minio|azure]
STORAGE_DEFAULT_DRIVER=minio
STORAGE_LINK_EXPIRY_IN_SECONDS=60
## STORAGE_LOCAL_BASE_PATH is relative to application root
STORAGE_LOCAL_BASE_PATH=storage/build
STORAGE_MINIO_ENDPOINT=localhost
STORAGE_MINIO_PORT=9000
STORAGE_MINIO_SSL=false
STORAGE_MINIO_ACCESS_KEY=minio
STORAGE_MINIO_SECRET_KEY=minio123
STORAGE_AZURE_ACCOUNT_NAME=
STORAGE_AZURE_ACCOUNT_KEY=
STORAGE_AZURE_FILE_UPLOADED_QUEUE_NAME=
```

## Usage
StorageManager. Import, inject and use.
```javascript
import { StorageManager } from '@sclable/nestjs-storage'

@Injectable()
export class SomeService {
  public constructor(
    @Inject(StorageManager)
    private readonly storageManager: StorageManager,
  ) {}

  public async getSomeFile(bucket: string, id: string): Promise<Buffer> {
    return this.storageManager.disk().getObject(bucket, id);
  }
}
```

### Getting a disk
Returns a storage disk, basically an implemented adapter. Without any parameters it returns the default storage adapter (defined in the config) or providing a `StorageType` any adapters can be retrieved. This means across the whole application you can use several different adapters parallely.
```javascript
public disk(driver?: StorageType): StorageDriverContract {...}
```

### Interacting with the disk
`StorageDriverContract` defines what one can do with a disk.
```javascript
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
  getUploadUrl(bucket: string, id: string, onUploaded: (record: any) => void): Promise<string>
```

