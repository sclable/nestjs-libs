import { Logger } from '@nestjs/common'

import { Aggregate } from '../aggregate'
import { EventRegistry } from '../event-store/event-registry'
import { EventStoreOptions } from '../event-store/event-store-options'
import { ReplayOptions } from '../event-store/replay-options'

import { Event } from './event'
import { EventSourcedAggregate } from './event-sourced-aggregate'

/** @hidden */
export const EVENT_STORE_PROVIDER = 'EventStoreProvider'

/**
 * EventStore provider interface
 *
 * The user is responsible for implementing this interface to provide an event-store. If it is ommited, the default
 * `wolkenkit-eventstore` will be used
 */
export interface EventStoreProvider {
  /** Get events for an aggregate */
  getEvents(aggregateId: string, fromRevision: number): Promise<Event[]>
  /**
   * Save events for an aggregate
   *
   * Events are accessed through `Aggregate.getUncommittedEvents()`
   */
  saveEvents(aggregate: Aggregate): Promise<void>
  /** Get the latest snapshot of an aggregate */
  getSnapshot(aggregateId: string): Promise<EventSourcedAggregate | undefined>
  /** Save a snapshot of an aggregate */
  saveSnapshot(aggregate: EventSourcedAggregate): Promise<void>
  /** Get events to replay (default is all) */
  getReplay(options?: ReplayOptions): Promise<Event[]>
  /** Get count of events to replay (default is all) */
  getReplayCount(options?: ReplayOptions): Promise<number>
  /** Init event-store */
  init(): Promise<void>
  /** Close event-store */
  close(): Promise<void>
}

/**
 * EventStore provider factory
 *
 * Implement this factory to provide a custom event-store
 */
export interface EventStoreProviderFactory {
  /**
   * Create event-store
   *
   * @param options event-store options
   * @param logger nestjs logger
   * @param eventRegistry register for event constructors
   */
  createEventStore(
    options: EventStoreOptions,
    logger: Logger,
    eventRegistry: EventRegistry,
  ): Promise<EventStoreProvider>
}
