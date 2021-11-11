import { Injectable } from '@nestjs/common'
import { EventBus, IEvent, IEventHandler } from '@nestjs/cqrs'
import pLimit, { Limit } from 'p-limit'

import { Event } from './interfaces'

/**
 * Rate-limited event bus that will put event handlers in a promise chain to avoid concurrency issues on the read side.
 *
 * This is mainly because insert and update events can come one after another in a rapid succession (especially during
 * replay) and the insert does not finish before the updates, and nothing is updated in the end.
 *
 * The rate-limiting is based on the aggregate ID.
 *
 * *Note*: If an event-handler throws an error, the rest of them will work fine.
 */
@Injectable()
export class RateLimitedEventBus extends EventBus {
  private limits: { [key: string]: Limit } = {}

  public bind(handler: IEventHandler<IEvent>, name: string): void {
    const stream$ = name ? this.ofEventName(name) : this.subject$
    stream$.subscribe(event => {
      const sourcedEvent = event as Event
      if (sourcedEvent.customOptions && sourcedEvent.customOptions.skipQueue) {
        handler.handle(event)

        return
      }
      const id =
        sourcedEvent.customOptions && sourcedEvent.customOptions.queueById
          ? sourcedEvent.customOptions.queueById
          : sourcedEvent.aggregateId

      if (!this.limits[id]) {
        this.limits[id] = pLimit(1)
      }

      this.limits[id](() => handler.handle(event))
    })
  }
}
