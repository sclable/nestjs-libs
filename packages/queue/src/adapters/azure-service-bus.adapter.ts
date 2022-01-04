/**
 * @see https://docs.microsoft.com/en-us/javascript/api/@azure/service-bus/?view=azure-node-latest
 */
import { ProcessErrorArgs, ServiceBusClient, ServiceBusReceivedMessage } from '@azure/service-bus'
import { Injectable, Logger } from '@nestjs/common'

import { QueueServiceContract } from '../contracts'
import { AzureServiceBusAdapterOptions } from '../interfaces/adapter-options'
import { AzureServiceBusMessage, QueueMessage } from '../messages'

@Injectable()
export class AzureServiceBusAdapter implements QueueServiceContract {
  private serviceBusClient: ServiceBusClient
  private readonly logger: Logger = new Logger(AzureServiceBusAdapter.name)

  public constructor(options: AzureServiceBusAdapterOptions) {
    this.serviceBusClient = new ServiceBusClient(
      options.connectionString,
    )
  }

  public async addConsumer<PayloadType>(
    queueName: string,
    consumer: (msg: QueueMessage<PayloadType>) => Promise<void> | void,
  ): Promise<void> {
    const receiver = this.serviceBusClient.createReceiver(queueName)

    const errorHandler = (error: Error): void => {
      this.logger.error(
        `Error occurred while receiving or processing messages on queue ${queueName.toUpperCase()}.${
          error.message
        }`,
      )
    }

    const messageHandler = async (message: ServiceBusReceivedMessage): Promise<void> => {
      consumer(new AzureServiceBusMessage<PayloadType>(message, receiver, this.logger))
    }

    receiver.subscribe({
      processMessage: messageHandler,
      processError: async (args: ProcessErrorArgs) => errorHandler(args.error),
    })
    this.logger.log(`Consumer added to queue: ${queueName}`)
  }

  public async sendMessage<PayloadType>(
    queueName: string,
    payload: PayloadType,
  ): Promise<void> {
    return this.serviceBusClient
      .createSender(queueName)
      .sendMessages({body: payload})
  }
}
