import { Inject, Injectable, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'

import { DefaultEvent } from '../default-event'
import { EVENT_STORE_PROVIDER, EventStoreProvider } from '../interfaces'
import { RateLimitedEventBus } from '../rate-limited-event-bus'

import { EVENT_STORE_OPTIONS, EventStoreOptions } from './event-store-options'
import { ReplayOptions } from './replay-options'

const REPLAY_MAX_PAGING_SIZE = 1000

/**
 * Last event appended to replay list
 *
 * Implement a handler for this event to know when the replay actually finishes
 */
export class ReplayFinished extends DefaultEvent<Record<string, never>> {}

/**
 * This service is used to replay events from the event store
 *
 * Can be run in a separate script.
 *
 * Example: `replay.ts`
 * ```typescript
 * @EventHandler(ReplayFinished)
 * class ReplayFinishedHandler implements IEventHandler<ReplayFinished> {
 *   public handle() {
 *     console.log('Replay finished')
 *   }
 * }
 *
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRoot({...}),
 *     FeatureModule1,
 *     FeatureModule2,
 *   ],
 * })
 * class ResetAndReplayModule {}
 *
 * async function run() {
 *   const app = await NestFactory.create(ResetAndReplayModule)
 *   await app.init()
 *
 *   const replayService = app.get<ReplayService>(ReplayService)
 *
 *   await replayService.replay()
 *   await app.close()
 * }
 *
 * run()
 * ```
 */
@Injectable()
export class ReplayService {
  public constructor(
    @Inject(EVENT_STORE_PROVIDER) private readonly eventStore: EventStoreProvider,
    @Inject(RateLimitedEventBus) private readonly eventBus: RateLimitedEventBus,
    @Inject(Logger) private readonly logger: Logger,
    @Inject(EVENT_STORE_OPTIONS) private readonly options: EventStoreOptions,
  ) {}

  /**
   * @param replayOptions replay options
   * @retuns number of events replayed
   */
  public async replay(replayOptions?: ReplayOptions): Promise<number> {
    const queueById = uuidv4() // events have to have the same id so that they are run in a single queue
    let pagingSize = REPLAY_MAX_PAGING_SIZE
    if (replayOptions?.pagingSize) {
      pagingSize = replayOptions.pagingSize
    }
    const eventCount = await this.eventStore.getReplayCount(replayOptions)
    const pageCount = Math.ceil(eventCount / pagingSize)
    for (let i = 0; i < pageCount; i++) {
      if (!replayOptions) {
        replayOptions = {
          fromPosition: i * pagingSize + 1,
          toPosition: (i + 1) * pagingSize,
        }
      } else {
        replayOptions.fromPosition = (replayOptions.fromPosition || 1) + i * pagingSize
        replayOptions.toPosition = replayOptions.fromPosition + pagingSize - 1
      }
      const events = await this.eventStore.getReplay(replayOptions)

      events.forEach(event => {
        event.customOptions = { queueById }
        this.eventBus.publish(event)
      })
    }

    this.eventBus.publish(
      new ReplayFinished(uuidv4(), 'Replay', 1, new Date(), uuidv4(), {}, { queueById }),
    )
    if (this.options.logging) {
      this.logger.log(`Replayed ${eventCount} events`, 'ReplayService')
    }

    return eventCount
  }
}
