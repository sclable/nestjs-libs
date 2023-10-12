import { Injectable } from '@nestjs/common'

import { EventConstructor } from '../interfaces'
import { EventStoreException } from './event-store.exception'

/**
 * @hidden
 * The EventRegisty stores constructors for events to reconstruct them when they come back from the [[EventStoreProvider]]
 */
@Injectable()
export class EventRegistry {
  private map: Map<string, EventConstructor> = new Map<string, EventConstructor>()

  public get(name: string): EventConstructor {
    const result = this.map.get(name)
    if (result === undefined) {
      throw new EventStoreException(`Unknown event type ${name}`, {})
    }

    return result
  }

  public register(name: string, event: EventConstructor): void {
    this.map.set(name, event)
  }
}
