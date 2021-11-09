import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common'

import { AzureServiceBusAdapter, InmemoryAdapter, RabbitmqAdapter } from './adapters'
import { DummyAdapter } from './adapters/dummy.adapter'
import { QUEUE_MODULE_OPTIONS, QUEUE_SERVICE } from './constants'
import { QueueServiceContract } from './contracts'
import { QueueType } from './enums'
import {
  AzureServiceBusAdapterOptions,
  QueueModuleAsyncOptions,
  QueueModuleOptions,
  RabbitmqAdapterOptions,
} from './interfaces'

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QueueModule {
  public static forRootAsync(asyncOptions: QueueModuleAsyncOptions): DynamicModule {
    const queueServiceProvider: Provider = {
      inject: [QUEUE_MODULE_OPTIONS],
      provide: QUEUE_SERVICE,
      useFactory: (
        options: QueueModuleOptions,
        logger: Logger = new Logger(QueueModule.name),
      ) => {
        let qs: QueueServiceContract

        if (!options.config[options.type]) {
          throw Error(`${options.type.toUpperCase()} Queue Adapter is not configured`)
        }

        switch (options.type) {
          case QueueType.DUMMY: {
            if (!options.config[QueueType.DUMMY]?.enabled) {
              throw Error('Dummy Queue Adapter is disabled, enable it to use')
            }
            qs = new DummyAdapter()
            break
          }

          case QueueType.INMEMORY: {
            qs = new InmemoryAdapter()
            break
          }

          case QueueType.RABBITMQ: {
            qs = new RabbitmqAdapter(
              options.config[QueueType.RABBITMQ] as RabbitmqAdapterOptions,
            )
            break
          }

          case QueueType.AZURE_SERVICE_BUS: {
            qs = new AzureServiceBusAdapter(
              options.config[QueueType.AZURE_SERVICE_BUS] as AzureServiceBusAdapterOptions,
            )
            break
          }

          default: {
            QueueModule.assertNever(options.type)
          }
        }

        logger.log(`QueueService ${options.type.toUpperCase()} initialized`, QueueModule.name)

        return qs
      },
    }

    return {
      module: QueueModule,
      exports: [queueServiceProvider],
      providers: [queueServiceProvider, Logger, this.createAsyncOptionsProvider(asyncOptions)],
    }
  }

  private static createAsyncOptionsProvider(asyncOptions: QueueModuleAsyncOptions): Provider {
    return {
      inject: asyncOptions.inject || [],
      provide: QUEUE_MODULE_OPTIONS,
      useFactory: asyncOptions.useFactory,
    }
  }

  private static assertNever(object: never): never {
    throw new Error(`All cases must be handled here: ${object}`)
  }
}
