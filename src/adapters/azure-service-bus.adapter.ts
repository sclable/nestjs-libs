/**
 * @see https://docs.microsoft.com/en-us/javascript/api/@azure/service-bus/?view=azure-node-latest
 */
import { ReceiveMode, ServiceBusClient, ServiceBusMessage } from '@azure/service-bus'
import { Injectable, Logger } from '@nestjs/common'

import { AzureServiceBusMessage, QueueMessage } from '../messages'
import { AzureServiceBusAdapterOptions } from '../interfaces/adapter-options'
import { QueueServiceContract } from '../contracts'

@Injectable()
export class AzureServiceBusAdapter implements QueueServiceContract {
  private serviceBusClient: ServiceBusClient

  public constructor(options: AzureServiceBusAdapterOptions, private readonly logger: Logger) {
    this.serviceBusClient = ServiceBusClient.createFromConnectionString(
      options.connectionString,
    )
    this.logger.setContext(AzureServiceBusAdapter.name)
  }

  public async addConsumer<PayloadType>(
    queueName: string,
    consumer: (msg: QueueMessage<PayloadType>) => Promise<void> | void,
  ): Promise<void> {
    const queueClient = this.serviceBusClient.createQueueClient(queueName)
    const receiver = queueClient.createReceiver(ReceiveMode.peekLock)

    const errorHandler = (error: Error): void => {
      this.logger.error(
        `Error occurred while receiving or processing messages on queue ${queueName.toUpperCase()}.${
          error.message
        }`,
      )
    }

    const messageHandler = async (message: ServiceBusMessage): Promise<void> => {
      consumer(new AzureServiceBusMessage<PayloadType>(message, this.logger))
    }

    receiver.registerMessageHandler(messageHandler, errorHandler)
    this.logger.log(`Consumer added to queue: ${queueName}`)
  }

  public async sendMessage<PayloadType>(
    queueName: string,
    payload: PayloadType,
  ): Promise<void> {
    return this.serviceBusClient
      .createQueueClient(queueName)
      .createSender()
      .send({ body: payload })
  }
}
