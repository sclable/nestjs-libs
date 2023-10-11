import { Aggregate } from '../aggregate'
import { AsyncProvider, Event, EventSourcedAggregate, EventStoreProvider } from '../interfaces'

import { EVENT_STORE_OPTIONS, EventStoreOptions } from './event-store-options'
import { ReplayOptions } from './replay-options'

const replayFilter = (options: ReplayOptions) => (event: Event, idx: number) => {
  let filter = true
  if (options.fromPosition || options.toPosition) {
    filter =
      filter &&
      idx >= (options.fromPosition || 1) &&
      idx <= (options.toPosition || 2 ** 31 - 1)
  }
  if (options.fromDate || options.toDate) {
    filter =
      filter &&
      event.createdAt >= (options.fromDate || new Date('1900-01-01')) &&
      event.createdAt <= (options.toDate || new Date())
  }
  if (options.fromRevision || options.toRevision) {
    filter =
      filter &&
      event.revision >= (options.fromRevision || 1) &&
      event.revision <= (options.toRevision || 2 ** 31 - 1)
  }
  if (options.aggregateId) {
    filter = filter && event.aggregateId === options.aggregateId
  }
  if (options.aggregateType) {
    filter = filter && event.aggregateType === options.aggregateType
  }
  if (options.eventName) {
    filter = filter && Object.getPrototypeOf(event).constructor.name === options.eventName
  }

  return filter
}

/**
 * Default inmemory event-store implementation
 *
 * Simplified version of inmemory wolkenkit-eventstore to demonstrate implementing a custom event-store
 */
export class InmemoryEventStore implements EventStoreProvider {
  private db: { events: Event[]; snapshots: EventSourcedAggregate[] }
  public constructor(private readonly options: EventStoreOptions) {
    this.db = {
      events: [],
      snapshots: [],
    }
  }
  public async getEvents(aggregateId: string, fromRevision: number): Promise<Event[]> {
    return this.db.events.filter(
      event => event.aggregateId === aggregateId && event.revision >= fromRevision,
    )
  }
  public async saveEvents(aggregate: Aggregate): Promise<void> {
    const events = aggregate.getUncommittedEvents()
    this.db.events.push(...events)
  }
  public async getSnapshot(aggregateId: string): Promise<EventSourcedAggregate | undefined> {
    const snaps = this.db.snapshots.filter(snap => snap.id === aggregateId)
    const latestRevision = Math.max(...snaps.map(snap => snap.revision))

    return snaps.find(snap => snap.revision === latestRevision)
  }
  public async saveSnapshot(aggregate: EventSourcedAggregate): Promise<void> {
    if (
      !this.options.snapshotInterval ||
      aggregate.revision % this.options.snapshotInterval !== 1
    ) {
      return
    }
    this.db.snapshots.push(aggregate)
  }
  public async getReplay(options?: ReplayOptions): Promise<Event[]> {
    if (!options) {
      return this.db.events
    }

    return this.db.events.filter(replayFilter(options))
  }
  public async getReplayCount(options?: ReplayOptions): Promise<number> {
    if (!options) {
      return this.db.events.length
    }

    return this.db.events.filter(replayFilter(options)).length
  }
  public async init(): Promise<void> {
    /* no-op */
  }
  public async close(): Promise<void> {
    /* no-op */
  }
}

export const InmemoryEventStoreProvider: AsyncProvider<EventStoreProvider> = {
  inject: [EVENT_STORE_OPTIONS],
  useFactory: options => new InmemoryEventStore(options),
}
