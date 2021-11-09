import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common'

import { QUEUE_SERVICE, STORAGE_MODULE_OPTIONS } from './constants'
import { QueueServiceContract } from './contracts'
import { StorageModuleAsyncOptions, StorageModuleOptions } from './interfaces'
import { StorageManager } from './storage.manager'

/**
 * The main module
 * In the root module import `StorageModule.forRootAsync()`. The module only accepts async configuration options
 * so provide a factory for getting the configuration.
 *
 * Example: `app.module.ts`
 * ```
 * import { Module } from '@nestjs/common'
 * import { ConfigService } from '@nestjs/config'
 * import { StorageModule, StorageModuleOptions, StorageType } from '@sclable/nestjs-storage'
 *
 * @Module({
 *   imports: [
 *     // ...
 *     StorageModule.forRootAsync({
 *       useFactory: (config: ConfigService) => ({
 *         ...config.get<StorageModuleOptions>('storage', {
 *           defaultDriver: StorageType.DUMMY,
 *           config: {},
 *         }),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *     // ...
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
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
