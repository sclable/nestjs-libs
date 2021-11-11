import { EventConstructor } from '../interfaces'
import { EVENTS_ON_AGGREGATE_METADATA } from './constants'

export function EventSourcableAggregate(...events: EventConstructor[]): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => Reflect.defineMetadata(EVENTS_ON_AGGREGATE_METADATA, events, target)
}
