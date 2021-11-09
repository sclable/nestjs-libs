import { Logger } from '@nestjs/common'

import { QueueServiceContract } from '../contracts'

export class DummyAdapter implements QueueServiceContract {
  private readonly logger: Logger = new Logger(DummyAdapter.name)

  public async addConsumer(queueName: string): Promise<void> {
    this.logger.log(`Consumer added to queue: ${queueName}`)
  }

  public async sendMessage<PayloadType>(
    queueName: string,
    payload: PayloadType,
  ): Promise<void> {
    this.logger.log(
      `Message sent to queue: ${queueName} with payload: ${JSON.stringify(payload)}`,
    )
  }
}
