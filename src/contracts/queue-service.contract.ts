import { QueueMessageContract } from './queue-message.contract'

export interface QueueServiceContract {
  sendMessage<PayloadType>(queueName: string, payload: PayloadType): Promise<void>
  addConsumer<PayloadType>(
    queueName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consumer: (msg: QueueMessageContract<PayloadType>) => any,
  ): Promise<void>
}
