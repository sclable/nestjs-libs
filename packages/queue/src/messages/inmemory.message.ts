import { QueueMessage } from './queue.message'

export class InmemoryMessage<T> implements QueueMessage<T> {
  public constructor(private readonly msg: T) {}
  public getContent(): T {
    return this.msg
  }
  public ack(): void {
    /* no-op */
  }
  public reject(): void {
    /* no-op */
  }
}
