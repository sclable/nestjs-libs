import { AggregateRoot } from '@nestjs/cqrs'

import { Event, EventConstructor, EventSourcedAggregate } from './interfaces'

/**
 * Aggregate class that has an id and a revision number
 *
 * Use the [[EventSourcableAggregate]] decorator so that the ES-CQRS module can register possible events.
 * [[EventRegistry]].
 *
 * Implement event handlers inside with the name `on${EventClassName}` to change the aggregates upon events.
 *
 * Creation events should get a revision of `1`. Modifier events should get an incremented value from the aggregate's
 * current revision. To make this easier call `this.uppedRevision()` for both.
 *
 * Example:
 * ```typescript
 * import { Aggregate, Event } from '@sclable/es-cqrs'
 * import { AccountCreatedEvent, AccountNameChangedEvent } from './events'
 * import { v4 as uuidv4 } from 'uuid'
 *
 * @EventSourcableAggregate(AccountCreatedEvent, AccountNameChangedEvent)
 * export class AccountAggregate extends Aggregate {
 *   accountName: string
 *
 *   public static create(id: string, userId: string) {
 *     const self = new AccountAggregate(id, userId)
 *     self.apply(new AccountCreatedEvent(id, self.uppedRevision()))
 *
 *     return self
 *   }
 *
 *   public changeName(accountName: string) {
 *     this.apply(new AccountNameChangedEvent(this.id, this.uppedRevision(), {accountName}))
 *   }
 *
 *   public onAccountCreatedEvent(event: AccountCreatedEvent) {
 *     this.accountName = 'default'
 *   }
 *
 *   public onAccountNameChangedEvent(event: AccountNameChangedEvent) {
 *     this.accountName = event.data.name
 *   }
 * }
 * ```
 *
 */
export class Aggregate extends AggregateRoot<Event> implements EventSourcedAggregate {
  public revision: number = 0

  public constructor(public readonly id: string, public readonly userId: string) {
    super()
  }

  public getUncommittedEvents(): Event[] {
    return super.getUncommittedEvents() as Event[]
  }

  public apply(event: Event, isFromHistory = false): void {
    super.apply(event, isFromHistory)
    this.revision = event.revision
  }

  /**
   * @return an incremented revision for events
   */
  public uppedRevision(): number {
    return this.revision + 1
  }

  /**
   * Apply event helper
   *
   * Takes care of upping the revision and saving the user ID
   *
   * @param event event class
   * @param data event data
   * @typeparam T event data type
   */
  protected applyEvent<T>(event: EventConstructor, data: T): void {
    this.apply(
      new event(
        this.id,
        Object.getPrototypeOf(this).constructor.name,
        this.uppedRevision(),
        new Date(),
        this.userId,
        data,
      ),
    )
  }
}

export type AggregateConstructor<T extends Aggregate> = new (id: string, userId: string) => T
