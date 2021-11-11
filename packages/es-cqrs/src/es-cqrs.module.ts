import { DynamicModule, Module, Provider } from '@nestjs/common'
import { EventPublisher } from '@nestjs/cqrs'

import { Aggregate, AggregateConstructor } from './aggregate'
import { CqrsModule } from './cqrs.module'
import {
  EventRegistry,
  EventStoreModule,
  EventStoreOptions,
  InmemoryEventStoreProvider,
} from './event-store'
import { AsyncProvider, EVENT_STORE_PROVIDER, Event, EventStoreProvider } from './interfaces'
import { RateLimitedEventBus } from './rate-limited-event-bus'
import { Repository, getRepositoryToken } from './repository'

/**
 * The main module
 *
 * In the root module import `ESCQRSModule.forRoot()`. By default the module will create an event store in memory
 * so provide database configuration as the second parameter for this module.
 *
 * Example: `app.module.ts`
 * ```typescript
 * import { ESCQRSModule, EventStoreOptions } from '@sclable/es-cqrs'
 *
 * const eventStoreOptions: EventStoreOptions = {
 *   type: 'postgres',
 *   initOptions: {
 *     url: 'postgres://app:app@localhost/app',
 *     namespace: 'db_name',
 *   }
 * }
 *
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRoot(eventStoreOptions),
 *     MyModule,
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * The module accepts options asyncronously as well from an options provider
 *
 * Example: `app.module.ts`
 * ```typescript
 * import { ESCQRSModule, EventStoreOptions } from '@sclable/es-cqrs'
 *
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRootAsync({
 *       inject: [GlobalOptionsProvider]
 *       useFactory: async (globalOptions: GlobalOptionsProvider) => {
 *         return await globalOptions.getEventStoreOptions()
 *       }
 *     }),
 *     MyModule,
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * or an options factory
 *
 * Example: `app.module.ts`
 * ```typescript
 * import { ESCQRSModule, EventStoreOptions } from '@sclable/es-cqrs'
 *
 * class OptionsFactory implements EventStoreOptionsFactory {
 *   public async createEventStoreOptions() {
 *     return {type: 'inmemory', logging: true}
 *   }
 * }
 *
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRootAsync({
 *       useClass: OptionsFactory
 *     }),
 *     MyModule,
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * Import this module in a feature module to get access to the aggregate repositories. Gather the aggregates in an array of
 * `AggregateConstructor[]`.
 *
 * Example: `aggregates/index.ts`
 * ```typescript
 * import { AccountAggregate } from './account.aggregate'
 * import { UserAggregate } from './user.aggregate'
 * import { Aggregate, AggregateConstructor } from '@sclable/es-cqrs'
 *
 * export const aggregates: AggregateConstructor[] = [AccountAggregate, UserAggregate]
 *
 * export { AccountAggregate } from './account.aggregate'
 * export { UserAggregate } from './user.aggregate'
 * ```
 *
 * In order to handle commands and events add the handlers as providers to your feature module
 *
 * Example: `my.module.ts`
 * ```typescript
 * import { Module } from '@nestjs/common'
 * import { ReplayService, ESCQRSModule } from '@sclable/es-cqrs'
 * import { aggregates } from './aggregates'
 * import { commandHandlers } from './command-handlers'
 * import { eventHandlers } from './event-handlers'
 *
 * @Module({
 *   imports: [
 *     ESCQRSModule.forFeature(aggregates)
 *   ],
 *   providers: [...commandHandlers, ...eventHandlers]
 * })
 * export class MyModule {}
 * ```
 */
@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ESCQRSModule {
  public static forRoot(
    options: EventStoreOptions,
    eventStoreProvider: AsyncProvider<EventStoreProvider> = InmemoryEventStoreProvider,
  ): DynamicModule {
    return {
      imports: [CqrsModule, EventStoreModule.forRoot(options, eventStoreProvider)],
      module: ESCQRSModule,
    }
  }

  public static forRootAsync(
    options: AsyncProvider<EventStoreOptions>,
    eventStoreProvider: AsyncProvider<EventStoreProvider> = InmemoryEventStoreProvider,
  ): DynamicModule {
    return {
      imports: [CqrsModule, EventStoreModule.forRootAsync(options, eventStoreProvider)],
      module: ESCQRSModule,
    }
  }

  public static forFeature<T extends Aggregate>(
    aggregates: AggregateConstructor<T>[],
  ): DynamicModule {
    const repositories: Provider[] = aggregates.map(agg => ({
      inject: [RateLimitedEventBus, EVENT_STORE_PROVIDER, EventRegistry],
      provide: getRepositoryToken(agg),
      useFactory: (
        eventBus: RateLimitedEventBus,
        eventStore: EventStoreProvider,
        eventRegistry: EventRegistry,
      ) => {
        return new Repository<T>(
          agg,
          new EventPublisher<Event>(eventBus),
          eventStore,
          eventRegistry,
        )
      },
    }))

    return {
      exports: [CqrsModule, ...repositories],
      imports: [CqrsModule],
      module: ESCQRSModule,
      providers: [...repositories],
    }
  }
}
