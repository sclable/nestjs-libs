import { Injectable } from '@nestjs/common'
import { EventBus, IEventHandler } from '@nestjs/cqrs'
import pLimit, { LimitFunction } from 'p-limit'

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
export class RateLimitedEventBus extends EventBus<Event> {
  private limits: { [key: string]: LimitFunction } = {}

  public bind(handler: IEventHandler<Event>, id: string): void {
    const stream$ = id ? this.ofEventId(id) : this.subject$
    stream$.subscribe(event => {
      if (event.customOptions && event.customOptions.skipQueue) {
        handler.handle(event)

        return
      }
      const id =
        event.customOptions && event.customOptions.queueById
          ? event.customOptions.queueById
          : event.aggregateId

      if (!this.limits[id]) {
        this.limits[id] = pLimit(1)
      }

      this.limits[id](() => handler.handle(event))
    })
  }
}
