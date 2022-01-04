import { ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus'
import { Logger } from '@nestjs/common'

import { QueueMessage } from './queue.message'

export interface AzureServiceBusMessagePayload {
  eventType?: string
  subject?: string
}

export class AzureServiceBusMessage<PayloadType extends AzureServiceBusMessagePayload>
  implements QueueMessage<PayloadType>
{
  public constructor(
    private readonly original: ServiceBusReceivedMessage,
    private readonly receiver: ServiceBusReceiver,
    private readonly logger: Logger,
  ) {}

  public getContent(): PayloadType {
    return this.original.body as PayloadType
  }

  public ack(): void {
    this.receiver.completeMessage(this.original).catch(error => {
      this.logger.error(`AzureServiceBusMessage.ack() failed: ${JSON.stringify(error)}`)
    })
  }

  public reject(requeue: boolean): void {
    if (requeue) {
      this.receiver.abandonMessage(this.original).catch(error => {
        this.logger.error(`AzureServiceBusMessage.reject() failed: ${JSON.stringify(error)}`)
      })
    } else {
      this.receiver.deadLetterMessage(this.original).catch(error => {
        this.logger.error(`AzureServiceBusMessage.reject() failed: ${JSON.stringify(error)}`)
      })
    }
  }
}
