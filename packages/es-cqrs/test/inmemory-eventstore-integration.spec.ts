import { Test, TestingModule } from '@nestjs/testing'
import pLimit from 'p-limit'
import { Subject } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'

import {
  Aggregate,
  Command,
  CommandBus,
  CommandHandler,
  DefaultEvent,
  ESCQRSModule,
  EVENT_STORE_OPTIONS,
  EVENT_STORE_PROVIDER,
  EventHandler,
  EventSourcableAggregate,
  EventStoreOptions,
  EventStoreProvider,
  ICommandHandler,
  IEventHandler,
  InjectRepository,
  InmemoryEventStore,
  Repository,
} from '../src'
import { getRepositoryToken } from '../src/repository'

interface TestEventData {
  methodId: string
  num: number
}

class TestEvent extends DefaultEvent<TestEventData> {}

class TestAggregateCreated extends DefaultEvent<Record<string, unknown>> {}

@EventSourcableAggregate(TestAggregateCreated, TestEvent)
class TestAggregate extends Aggregate {
  public methodId?: string
  public num?: number

  public static create(id: string, userId: string): TestAggregate {
    const self = new TestAggregate(id, userId)
    self.applyEvent(TestAggregateCreated, {})

    return self
  }

  public onTestAggregateCreated(_: TestAggregateCreated): void {
    /* no-op */
  }

  public testMethod(methodId: string, num: number): void {
    this.applyEvent(TestEvent, { methodId, num })
  }

  public onTestEvent(event: TestEvent): void {
    this.methodId = event.data.methodId
    this.num = event.data.num
  }
}

describe('InmemoryEventStore-Integration', () => {
  describe('Repository', () => {
    let repository: Repository<TestAggregate>
    let eventStore: EventStoreProvider
    const aggregateId = uuidv4()
    const userId = uuidv4()
    const num = 1234

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ESCQRSModule.forRoot(
            {
              debug: true,
              logging: true,
              snapshotInterval: 5,
            },
            {
              inject: [EVENT_STORE_OPTIONS],
              useFactory: (options: EventStoreOptions) => new InmemoryEventStore(options),
            },
          ),
          ESCQRSModule.forFeature([TestAggregate]),
        ],
      }).compile()

      repository = module.get<Repository<TestAggregate>>(getRepositoryToken(TestAggregate))
      eventStore = module.get<EventStoreProvider>(EVENT_STORE_PROVIDER)
    })

    it('should create aggregate', async () => {
      const aggregate = TestAggregate.create(aggregateId, userId)
      await repository.persist(aggregate)

      await expect(eventStore.getEvents(aggregateId, 1)).resolves.toContainEqual(
        expect.objectContaining({ aggregateId, userId }),
      )
      await expect(eventStore.getSnapshot(aggregateId)).resolves.toEqual(
        expect.objectContaining({
          id: aggregateId,
          revision: 1,
        }),
      )
    })

    it('should find aggregate', async () => {
      const aggregate = await repository.find(aggregateId, userId)
      expect(aggregate).toEqual(
        expect.objectContaining({
          id: aggregateId,
          revision: 1,
        }),
      )
      expect(aggregate).toBeInstanceOf(TestAggregate)
    })

    it('should save event with user on aggregate', async () => {
      const methodId = uuidv4()
      const aggregate = await repository.find(aggregateId, userId)
      aggregate.testMethod(methodId, num)
      await repository.persist(aggregate)

      await expect(eventStore.getEvents(aggregateId, 2)).resolves.toContainEqual(
        expect.objectContaining({ aggregateId, userId, data: { methodId, num } }),
      )
      await expect(eventStore.getSnapshot(aggregateId)).resolves.toEqual(
        expect.objectContaining({
          id: aggregateId,
          revision: 1,
        }),
      )

      const resultAggregate = await repository.find(aggregateId, userId)
      expect(resultAggregate).toEqual(
        expect.objectContaining({
          id: aggregateId,
          revision: 2,
          methodId,
          num,
        }),
      )
      expect(resultAggregate).toBeInstanceOf(TestAggregate)
    })

    it('should create new snapshot after some (default: 5) events', async () => {
      const nums = [0, 1, 2, 3]
      const limiter = pLimit(1)
      const methodIds = await Promise.all(
        nums.map(num =>
          limiter(async () => {
            const methodId = uuidv4()
            const aggregate = await repository.find(aggregateId, userId)
            aggregate.testMethod(methodId, num)
            await repository.persist(aggregate)

            return methodId
          }),
        ),
      )

      await expect(eventStore.getSnapshot(aggregateId)).resolves.toEqual(
        expect.objectContaining({
          id: aggregateId,
          revision: 6,
          methodId: methodIds[3],
          num: nums[3],
        }),
      )
    })
  })

  describe('CommandBus and EventBus', () => {
    let repository: Repository<TestAggregate>
    let commandBus: CommandBus
    const aggregateId = uuidv4()
    const userId = uuidv4()
    const methodId = uuidv4()
    const num = 1234
    const readSideStore: TestAggregate[] = []
    const readSideStoreSubject: Subject<void> = new Subject()

    class CreateAggregateCommand implements Command {
      public constructor(public readonly id: string, public readonly userId: string) {}
    }

    class TestCommand implements Command {
      public constructor(
        public readonly id: string,
        public readonly num: number,
        public readonly userId: string,
      ) {}
    }

    @CommandHandler(CreateAggregateCommand)
    class CreateAggregateCommandHandler implements ICommandHandler<CreateAggregateCommand> {
      public constructor(
        @InjectRepository(TestAggregate)
        private readonly repository: Repository<TestAggregate>,
      ) {}
      public async execute(cmd: CreateAggregateCommand): Promise<void> {
        const aggregate = TestAggregate.create(cmd.id, cmd.userId)
        await this.repository.persist(aggregate)
      }
    }

    @CommandHandler(TestCommand)
    class TestCommandHandler implements ICommandHandler<TestCommand> {
      public constructor(
        @InjectRepository(TestAggregate)
        private readonly repository: Repository<TestAggregate>,
      ) {}
      public async execute(cmd: TestCommand): Promise<void> {
        const aggregate = await this.repository.find(cmd.id, cmd.userId)
        aggregate.testMethod(methodId, num)
        await this.repository.persist(aggregate)
      }
    }

    @EventHandler(TestAggregateCreated)
    class TestAggregateCreatedHandler implements IEventHandler<TestAggregateCreated> {
      public handle(event: TestAggregateCreated): void {
        readSideStore.push(new TestAggregate(event.aggregateId, event.userId))
      }
    }

    @EventHandler(TestEvent)
    class TestEventHandler implements IEventHandler<TestEvent> {
      public handle(event: TestEvent): void {
        const entity = readSideStore.find(rss => rss.id === event.aggregateId)
        if (entity) {
          entity.methodId = event.data.methodId
          entity.num = event.data.num
        }
        readSideStoreSubject.next()
        readSideStoreSubject.complete()
      }
    }

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ESCQRSModule.forRoot(
            {},
            {
              inject: [EVENT_STORE_OPTIONS],
              useFactory: (options: EventStoreOptions) => new InmemoryEventStore(options),
            },
          ),
          ESCQRSModule.forFeature([TestAggregate]),
        ],
        providers: [
          CreateAggregateCommandHandler,
          TestCommandHandler,
          TestAggregateCreatedHandler,
          TestEventHandler,
        ],
      }).compile()
      await module.init()

      repository = module.get<Repository<TestAggregate>>(getRepositoryToken(TestAggregate))
      commandBus = module.get<CommandBus>(CommandBus)
    })

    it('should execute command and trigger event handlers', done => {
      readSideStoreSubject.subscribe(() => {
        expect(readSideStore).toContainEqual(
          expect.objectContaining({
            id: aggregateId,
            methodId,
            num,
          }),
        )
        done()
      })

      // need to use classic promise chaining because we can't mix promise and DoneCallback in jest anymore
      commandBus
        .execute(new CreateAggregateCommand(aggregateId, userId))
        .then(() => commandBus.execute(new TestCommand(aggregateId, num, userId)))
        .then(() => repository.find(aggregateId, userId))
        .then(resultAggregate => {
          expect(resultAggregate).toBeInstanceOf(TestAggregate)
          expect(resultAggregate).toEqual(
            expect.objectContaining({
              id: aggregateId,
              revision: 2,
              methodId,
              num,
            }),
          )
        })
    })
  })
})
