import { Injectable, Logger } from '@nestjs/common'
import { Connection, Message } from 'amqp-ts'

import { QueueServiceContract } from '../contracts'
import { RabbitmqAdapterOptions } from '../interfaces/adapter-options'
import { QueueMessage } from '../messages'

@Injectable()
export class RabbitmqAdapter implements QueueServiceContract {
  private connection: Connection
  private readonly logger: Logger = new Logger(RabbitmqAdapter.name)

  public constructor(options: RabbitmqAdapterOptions) {
    this.connection = new Connection(
      `amqp://${options.username}:${options.password}@${options.hostname}:${options.port}`,
    )
  }

  public async sendMessage<PayloadType>(
    queueName: string,
    payload: PayloadType,
  ): Promise<void> {
    return this.connection.declareQueue(queueName).send(new Message(payload))
  }

  public async addConsumer<PayloadType>(
    queueName: string,
    consumer: (msg: QueueMessage<PayloadType>) => Promise<void> | void,
  ): Promise<void> {
    this.connection
      .declareQueue(queueName)
      .activateConsumer(consumer)
      .then(() => {
        this.logger.log(`Consumer added to queue: ${queueName}`)
      })
      .catch((error: Error) => {
        this.logger.error(
          `Consumer cannot be added to queue: ${queueName}, error: ${error.message}`,
        )
      })
  }
}
