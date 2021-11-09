/**
 * @see https://docs.microsoft.com/en-us/javascript/api/@azure/service-bus/?view=azure-node-latest
 */
import { ReceiveMode, ServiceBusClient, ServiceBusMessage } from '@azure/service-bus'
import { Injectable, Logger } from '@nestjs/common'

import { QueueServiceContract } from '../contracts'
import { AzureServiceBusAdapterOptions } from '../interfaces/adapter-options'
import { AzureServiceBusMessage, QueueMessage } from '../messages'

@Injectable()
export class AzureServiceBusAdapter implements QueueServiceContract {
  private serviceBusClient: ServiceBusClient
  private readonly logger: Logger = new Logger(AzureServiceBusAdapter.name)

  public constructor(options: AzureServiceBusAdapterOptions) {
    this.serviceBusClient = ServiceBusClient.createFromConnectionString(
      options.connectionString,
    )
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
