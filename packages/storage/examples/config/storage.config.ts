// Remove linting comments in real application!
import path from 'path'

// @ts-ignore
import { registerAs } from '@nestjs/config'
import { StorageModuleOptions, StorageType } from '@sclable/nestjs-storage'

// eslint-disable-next-line import/no-default-export
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
