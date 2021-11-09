import { Injectable, Logger } from '@nestjs/common'
import { Subject } from 'rxjs'

import { QueueServiceContract } from '../contracts'
import { InmemoryMessage } from '../messages'

@Injectable()
export class InmemoryAdapter implements QueueServiceContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queues: Record<string, Subject<InmemoryMessage<any>>> = {}
  private readonly logger: Logger = new Logger(InmemoryAdapter.name)

  public async sendMessage<PayloadType>(
    queueName: string,
    payload: PayloadType,
  ): Promise<void> {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Subject<InmemoryMessage<PayloadType>>()
    }
    this.queues[queueName].next(new InmemoryMessage(payload))
  }

  public async addConsumer<PayloadType>(
    queueName: string,
    consumer: (msg: InmemoryMessage<PayloadType>) => Promise<void> | void,
  ): Promise<void> {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Subject<InmemoryMessage<PayloadType>>()
    }
    this.queues[queueName].subscribe(consumer)
  }
}
