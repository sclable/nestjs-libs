import { Event, EventSourcedAggregate } from '../interfaces'

export interface EventStoreExceptionInfo {
  events?: Event[]
  revision?: number
  aggregate?: EventSourcedAggregate
  originalMessage?: string
}
/**
 * General exception for event store related errors
 */
export class EventStoreException extends Error {
  public constructor(msg: string, public readonly info: EventStoreExceptionInfo) {
    super(msg)
  }
}
