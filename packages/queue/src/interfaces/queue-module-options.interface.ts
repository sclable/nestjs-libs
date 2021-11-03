import { QueueType } from '../enums'
import {
  AzureServiceBusAdapterOptions,
  DummyAdapterOptions,
  RabbitmqAdapterOptions,
} from './adapter-options'

export interface QueueModuleOptions {
  type: QueueType
  config: {
    [QueueType.DUMMY]?: DummyAdapterOptions
    [QueueType.INMEMORY]?: Record<string, unknown>
    [QueueType.RABBITMQ]?: RabbitmqAdapterOptions
    [QueueType.AZURE_SERVICE_BUS]?: AzureServiceBusAdapterOptions
  }
}

export interface QueueModuleAsyncOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => QueueModuleOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject: any[]
}
