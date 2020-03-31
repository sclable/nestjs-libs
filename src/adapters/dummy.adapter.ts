import { Logger } from '@nestjs/common'

import { QueueServiceContract } from '../contracts'

export class DummyAdapter implements QueueServiceContract {
  public constructor(private readonly logger: Logger) {
    this.logger.setContext(DummyAdapter.name)
  }

  public async addConsumer<PayloadType>(queueName: string): Promise<void> {
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
