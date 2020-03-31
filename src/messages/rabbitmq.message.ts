import { Message as AmqpMessage } from 'amqp-ts'

import { QueueMessage } from './queue.message'

export class RabbitmqMessage<PayloadType> extends AmqpMessage
  implements QueueMessage<PayloadType> {
  public getContent(): PayloadType {
    return super.getContent() as PayloadType
  }
}
