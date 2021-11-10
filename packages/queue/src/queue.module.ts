import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common'
import { AsyncProvider, createAsyncProviders } from '@sclable/nestjs-async-provider'

import { AzureServiceBusAdapter, InmemoryAdapter, RabbitmqAdapter } from './adapters'
import { DummyAdapter } from './adapters/dummy.adapter'
import { QUEUE_MODULE_OPTIONS, QUEUE_SERVICE } from './constants'
import { QueueServiceContract } from './contracts'
import { QueueType } from './enums'
import {
  AzureServiceBusAdapterOptions,
  QueueModuleOptions,
  RabbitmqAdapterOptions,
} from './interfaces'

@Global()
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QueueModule {
  public static forRoot(options: QueueModuleOptions): DynamicModule {
    const optionsProvider: Provider<QueueModuleOptions> = {
      provide: QUEUE_MODULE_OPTIONS,
      useValue: options,
    }

    const asyncProviders = createAsyncProviders(
      {
        inject: [QUEUE_MODULE_OPTIONS],
        useFactory: createQueueService,
      },
      QUEUE_SERVICE,
    )

    return {
      module: QueueModule,
      exports: [optionsProvider, ...asyncProviders],
      providers: [optionsProvider, ...asyncProviders],
    }
  }

  public static forRootAsync(asyncOptions: AsyncProvider<QueueModuleOptions>): DynamicModule {
    const asyncProviders = createAsyncProviders(asyncOptions, QUEUE_MODULE_OPTIONS)
    asyncProviders.push(
      ...createAsyncProviders(
        {
          inject: [QUEUE_MODULE_OPTIONS],
          useFactory: createQueueService,
        },
        QUEUE_SERVICE,
      ),
    )

    return {
      module: QueueModule,
      exports: [...asyncProviders],
      providers: [...asyncProviders],
    }
  }
}

function assertNever(object: never): never {
  throw new Error(`All cases must be handled here: ${object}`)
}

function createQueueService(
  options: QueueModuleOptions,
  logger: Logger = new Logger(QueueModule.name),
): QueueServiceContract {
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
      qs = new RabbitmqAdapter(options.config[QueueType.RABBITMQ] as RabbitmqAdapterOptions)
      break
    }

    case QueueType.AZURE_SERVICE_BUS: {
      qs = new AzureServiceBusAdapter(
        options.config[QueueType.AZURE_SERVICE_BUS] as AzureServiceBusAdapterOptions,
      )
      break
    }

    default: {
      assertNever(options.type)
    }
  }

  logger.log(`QueueService ${options.type.toUpperCase()} initialized`, QueueModule.name)

  return qs
}
