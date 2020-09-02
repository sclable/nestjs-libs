import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common'

import { QUEUE_SERVICE, STORAGE_MODULE_OPTIONS } from './constants'
import { QueueServiceContract } from './contracts'
import { StorageModuleAsyncOptions, StorageModuleOptions } from './interfaces'
import { StorageManager } from './storage.manager'

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class StorageModule {
  public static forRootAsync(asyncOptions: StorageModuleAsyncOptions): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        Logger,
        StorageManager,
        this.createQueueServiceProvider(),
        this.createAsyncOptionsProvider(asyncOptions),
      ],
      exports: [StorageManager, this.createAsyncOptionsProvider(asyncOptions)],
    }
  }

  private static createAsyncOptionsProvider(
    asyncOptions: StorageModuleAsyncOptions,
  ): Provider<StorageModuleOptions> {
    return {
      inject: asyncOptions.inject || [],
      provide: STORAGE_MODULE_OPTIONS,
      useFactory: asyncOptions.useFactory,
    }
  }

  private static createQueueServiceProvider(): Provider<QueueServiceContract | undefined> {
    return {
      inject: [STORAGE_MODULE_OPTIONS],
      provide: QUEUE_SERVICE,
      useFactory: (options: StorageModuleOptions) => options.queueService,
    }
  }
}
