export interface QueueMessageContract<PayloadType> {
  getContent(): PayloadType
  ack(): void
  reject(queue: boolean): void
}
