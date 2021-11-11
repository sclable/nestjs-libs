import { EventStoreException, EventStoreExceptionInfo } from './event-store.exception'

/**
 * Exception for missing aggregate
 */
export class RevisionConflictException extends EventStoreException {
  public constructor(info: EventStoreExceptionInfo) {
    super('Revision conflict detected', info)
  }
}
