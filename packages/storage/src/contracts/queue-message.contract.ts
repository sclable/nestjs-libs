/**
 * Contract used to describe a message from the queue
 */
export interface QueueMessageContract<PayloadType> {
  /**
   * Get message content
   */
  getContent(): PayloadType
  /**
   * Acknowledge message receival
   */
  ack(): void
  /**
   * Reject message
   *
   * @param queue option to put the message back to the queue for other receivers to handle it
   */
  reject(queue: boolean): void
}
