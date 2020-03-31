export interface QueueMessage<PayloadType> {
  getContent(): PayloadType
  ack(): void
  reject(queue: boolean): void
}
