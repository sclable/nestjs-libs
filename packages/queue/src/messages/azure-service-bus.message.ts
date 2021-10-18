import { ServiceBusMessage } from '@azure/service-bus'
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
    private readonly original: ServiceBusMessage,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AzureServiceBusMessage.name)
  }

  public getContent(): PayloadType {
    return this.original.body as PayloadType
  }

  public ack(): void {
    this.original.complete().catch(error => {
      this.logger.error(`AzureServiceBusMessage.ack() failed: ${JSON.stringify(error)}`)
    })
  }

  public reject(requeue: boolean): void {
    if (requeue) {
      this.original.abandon().catch(error => {
        this.logger.error(`AzureServiceBusMessage.reject() failed: ${JSON.stringify(error)}`)
      })
    } else {
      this.original.deadLetter().catch(error => {
        this.logger.error(`AzureServiceBusMessage.reject() failed: ${JSON.stringify(error)}`)
      })
    }
  }
}
