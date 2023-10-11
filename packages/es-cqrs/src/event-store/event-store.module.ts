import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  Provider,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'

import { CqrsModule } from '../cqrs.module'
import {
  AsyncProvider,
  EVENT_STORE_PROVIDER,
  EventStoreProvider,
  createAsyncProviders,
} from '../interfaces'

import { EventRegistry } from './event-registry'
import { EVENT_STORE_OPTIONS, EventStoreOptions } from './event-store-options'
import { ReplayService } from './replay.service'

/** @hidden */
@Global()
@Module({})
export class EventStoreModule implements OnModuleDestroy {
  public constructor(
    @Inject(ModuleRef) private readonly moduleRef: ModuleRef,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  public static forRoot(
    options: EventStoreOptions,
    eventStoreProvider: AsyncProvider<EventStoreProvider>,
  ): DynamicModule {
    const optionsProvider: Provider<EventStoreOptions> = {
      provide: EVENT_STORE_OPTIONS,
      useValue: options,
    }

    const asyncProviders = createAsyncProviders(eventStoreProvider, EVENT_STORE_PROVIDER)

    return {
      exports: [optionsProvider, EventRegistry, ReplayService, ...asyncProviders],
      imports: [CqrsModule],
      module: EventStoreModule,
      providers: [optionsProvider, ReplayService, EventRegistry, Logger, ...asyncProviders],
    }
  }

  public static forRootAsync(
    options: AsyncProvider<EventStoreOptions>,
    eventStoreProvider: AsyncProvider<EventStoreProvider>,
  ): DynamicModule {
    const asyncProviders = createAsyncProviders(options, EVENT_STORE_OPTIONS)
    asyncProviders.push(...createAsyncProviders(eventStoreProvider, EVENT_STORE_PROVIDER))

    return {
      exports: [EventRegistry, ReplayService, ...asyncProviders],
      imports: [CqrsModule, ...(options.imports ? options.imports : [])],
      module: EventStoreModule,
      providers: [ReplayService, EventRegistry, Logger, ...asyncProviders],
    }
  }

  public async onModuleDestroy(): Promise<void> {
    const eventStore = this.moduleRef.get<EventStoreProvider>(EVENT_STORE_PROVIDER)
    await eventStore.close()
    this.logger.log('Eventstore closed', 'EventStoreModule')
  }
}
