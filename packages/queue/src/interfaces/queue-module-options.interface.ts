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
