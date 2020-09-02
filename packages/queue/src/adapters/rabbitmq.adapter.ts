import { Injectable, Logger } from '@nestjs/common'
import { Connection, Message } from 'amqp-ts'

import { QueueMessage } from '../messages'
import { RabbitmqAdapterOptions } from '../interfaces/adapter-options'
import { QueueServiceContract } from '../contracts'

@Injectable()
export class RabbitmqAdapter implements QueueServiceContract {
  private connection: Connection

  public constructor(options: RabbitmqAdapterOptions, private readonly logger: Logger) {
    this.connection = new Connection(
      `amqp://${options.username}:${options.password}@${options.hostname}:${options.port}`,
    )
    this.logger.setContext(RabbitmqAdapter.name)
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
