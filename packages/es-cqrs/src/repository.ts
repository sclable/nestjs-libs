import { Injectable } from '@nestjs/common'
import { EventPublisher } from '@nestjs/cqrs'

import { Aggregate, AggregateConstructor } from './aggregate'
import { EVENTS_ON_AGGREGATE_METADATA } from './decorators'
import { EventRegistry } from './event-store'
import { EventConstructor, EventStoreProvider } from './interfaces'

/** @hidden */
export function getRepositoryToken<T extends Aggregate>(
  aggregate: AggregateConstructor<T>,
): string {
  return `${aggregate.name}ESCQRSAggregateRepository`
}

/**
 * An aggregate repository is a storage handler for aggregates. It recreates an aggregate every time from the event
 * store, but to speed things up, it first tries to load up a snapshot of the aggregate. It is also responsible for
 * persisting the aggregate by saving its events.
 *
 * @typeparam T an [[Aggregate]]
 */
@Injectable()
export class Repository<T extends Aggregate> {
  /** @hidden */
  public constructor(
    private readonly aggregateType: AggregateConstructor<T>,
    private readonly publisher: EventPublisher,
    private readonly eventStore: EventStoreProvider,
    eventRegistry: EventRegistry,
  ) {
    const events = Reflect.getMetadata(EVENTS_ON_AGGREGATE_METADATA, this.aggregateType) || []
    events.forEach((event: EventConstructor) => eventRegistry.register(event.name, event))
  }

  /**
   * Recreate an aggregate from the events
   *
   * @param id aggregate id
   * @param userId user id for subsequent operations, can be omitted for reading
   * @returns an aggregate
   */
  public async find(id: string, userId?: string): Promise<T> {
    const aggregate: T = new this.aggregateType(id, userId ?? 'no-user-specified')
    Object.assign(aggregate, await this.eventStore.getSnapshot(id))
    aggregate.loadFromHistory(await this.eventStore.getEvents(id, aggregate.revision + 1))

    return aggregate
  }

  /**
   * Persist an aggregate by saving its events
   */
  public async persist(aggregate: T): Promise<void> {
    await this.eventStore.saveEvents(aggregate)

    this.publisher.mergeObjectContext(aggregate)
    aggregate.commit()

    await this.eventStore.saveSnapshot(aggregate)
  }
}
