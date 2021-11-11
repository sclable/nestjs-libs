import { IEvent as INestEvent } from '@nestjs/cqrs'

import { CustomEventOptions } from './custom-event-options'

/**
 * Event interface
 *
 * In order for the event-store to replay your events implement the `Event` interface and create a constructor according
 * to [[EventConstructor]], or for conveniency extend the [[DefaultEvent]] class:
 * ```
 * constructor(
 *   public readonly aggregateId: string,
 *   public readonly aggregateType: string,
 *   public readonly revision: number,
 *   public readonly createdAt: Date,
 *   public readonly userId: string,
 *   public readonly data: {[key: string]: any}
 * )
 * ```
 * It is recommended to define `data` as an interface with the event
 *
 * Example:
 * ```
 * import { Event } from '@sclable/es-cqrs'
 *
 * interface EventData {
 *   accountName: string,
 *   email: string,
 *   birthday: Date,
 * }
 *
 * export class AccountCreatedEvent implements Event {
 *   public constructor(
 *     public readonly aggregateId: string,
 *     public readonly aggregateType: string,
 *     public readonly revision: number,
 *     public readonly createdAt: Date,
 *     public readonly userId: string,
 *     public readonly data: EventData,
 *   ) {}
 * }
 * ```
 * To use [[CustomEventOptions]] define that as the forth parameter
 *
 * Example:
 * ```
 * @EventForModule('MyModule')
 * export class AccountCreatedEvent implements Event {
 *   public constructor(
 *     public readonly aggregateId: string,
 *     public readonly aggregateType: string,
 *     public readonly revision: number,
 *     public readonly createdAt: Date,
 *     public readonly userId: string,
 *     public readonly data: EventData,
 *     public readonly custom: CustomEventOptions,
 *   ) {}
 * }
 * ```
 *
 * Or use it as a computed parameter
 *
 * Example:
 * ```
 * @EventForModule('MyModule')
 * export class AccountCreatedEvent implements Event {
 *   public constructor(
 *     public readonly aggregateId: string,
 *     public readonly aggregateType: string,
 *     public readonly revision: number,
 *     public readonly createdAt: Date,
 *     public readonly userId: string,
 *     public readonly data: EventData,
 *     public readonly custom: CustomEventOptions = { queueById: data.customId }
 *   ) {}
 * }
 * ```
 *
 * To handle these events implement the `IEventHandler` interface.
 *
 * Example:
 *
 * ```
 * import { EventHandler, IEventHandler } from '@sclable/es-cqrs'
 * import { AccountCreatedEvent } from './events'
 *
 * @EventHandler(AccountCreatedEvent)
 * export class AccountCreatedEventHandler implements IEventHandler<AccountCreatedEvent> {
 *   async handle(event: AccountCreatedEvent) {
 *     // do something (e.g. change DB, change view, emit to other type of listeners)
 *   }
 * }
 * ```
 */
export interface Event extends INestEvent {
  aggregateId: string
  aggregateType: string
  revision: number
  createdAt: Date
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  customOptions?: CustomEventOptions
}

/**
 * Constructor signature used to reconstruct an [[Event]] instance from the event store
 */
export type EventConstructor = new (
  aggregateId: string,
  aggregateType: string,
  revision: number,
  createdAt: Date,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  customOptions?: CustomEventOptions,
) => Event
