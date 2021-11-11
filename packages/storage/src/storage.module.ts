import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { AsyncProvider, createAsyncProviders } from '@sclable/nestjs-async-provider'
import { QUEUE_SERVICE, QueueServiceContract } from '@sclable/nestjs-queue'

import { STORAGE_MODULE_OPTIONS } from './constants'
import { StorageModuleOptions } from './interfaces'
import { StorageManager } from './storage.manager'

/**
 * The main module
 * In the root module import `StorageModule.forRootAsync()`. The module only accepts async configuration options
 * so provide a factory for getting the configuration.
 *
 * Example: `app.module.ts`
 * ```typescript
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
  public static forRoot(options: StorageModuleOptions): DynamicModule {
    const optionsProvider: Provider<StorageModuleOptions> = {
      provide: STORAGE_MODULE_OPTIONS,
      useValue: options,
    }

    return {
      module: StorageModule,
      providers: [StorageManager, optionsProvider, this.createQueueServiceProvider()],
    }
  }

  public static forRootAsync(
    asyncOptions: AsyncProvider<StorageModuleOptions>,
  ): DynamicModule {
    const asyncProviders = createAsyncProviders(asyncOptions, STORAGE_MODULE_OPTIONS)

    return {
      module: StorageModule,
      providers: [StorageManager, this.createQueueServiceProvider(), ...asyncProviders],
      exports: [StorageManager, ...asyncProviders],
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
