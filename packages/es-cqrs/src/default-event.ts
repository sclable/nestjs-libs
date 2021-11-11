import { CustomEventOptions, Event } from './interfaces'

/**
 * Default [[Event]] implementation
 *
 * Usage:
 * ```
 * interface EventData {
 *   param1: string,
 *   param2: number,
 * }
 *
 * export class SomeEvent extends DefaultEvent<EventData> {}
 * ```
 */
export class DefaultEvent<T> implements Event {
  public constructor(
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    public readonly revision: number,
    public readonly createdAt: Date,
    public readonly userId: string,
    public readonly data: T,
    public readonly customOptions?: CustomEventOptions,
  ) {}
}
