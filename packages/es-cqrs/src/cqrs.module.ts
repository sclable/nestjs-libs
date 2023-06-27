import { Inject, Module, OnModuleInit } from '@nestjs/common'
import { CommandBus, UnhandledExceptionBus } from '@nestjs/cqrs'

import { ExplorerService } from './explorer.service'
import { RateLimitedEventBus } from './rate-limited-event-bus'

@Module({
  exports: [CommandBus, RateLimitedEventBus],
  providers: [CommandBus, ExplorerService, RateLimitedEventBus, UnhandledExceptionBus],
})
export class CqrsModule implements OnModuleInit {
  public constructor(
    @Inject(ExplorerService) private readonly explorerService: ExplorerService,
    @Inject(RateLimitedEventBus)
    private readonly eventBus: RateLimitedEventBus,
    @Inject(CommandBus) private readonly commandBus: CommandBus,
  ) {}

  public onModuleInit(): void {
    const { events, commands } = this.explorerService.explore()

    this.eventBus.register(events)
    this.commandBus.register(commands)
  }
}
