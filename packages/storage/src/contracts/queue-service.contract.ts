import { QueueMessageContract } from './queue-message.contract'

export interface QueueServiceContract {
  /**
   * Add message to the queue
   */
  sendMessage<PayloadType>(queueName: string, payload: PayloadType): Promise<void>
  /**
   * Add listener for the message queue
   */
  addConsumer<PayloadType>(
    queueName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consumer: (msg: QueueMessageContract<PayloadType>) => any,
  ): Promise<void>
}
