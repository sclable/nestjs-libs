import { QueueMessage } from '../messages'

export interface QueueServiceContract {
  sendMessage<PayloadType>(queueName: string, payload: PayloadType): Promise<void>
  addConsumer<PayloadType>(
    queueName: string,
    consumer: (msg: QueueMessage<PayloadType>) => Promise<void> | void,
  ): Promise<void>
}
