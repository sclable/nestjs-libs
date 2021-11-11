import { Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'

import {
  DefaultEvent,
  ESCQRSModule,
  Event,
  EventStoreOptions,
  EventStoreProvider,
  ReplayOptions,
  ReplayService,
} from '../../src'
import { RateLimitedEventBus as EventBus } from '../../src/rate-limited-event-bus'
class MockedLogger extends Logger {}

const events: Event[] = []
const mockedLogger = new MockedLogger()
mockedLogger.log = jest.fn()
const eventStoreOptions: EventStoreOptions = {}
const mockEventStore: EventStoreProvider = {
  getEvents: () => Promise.resolve([]),
  getSnapshot: () => Promise.resolve({ id: '', revision: 1, userId: '' }),
  saveEvents: () => Promise.resolve(),
  saveSnapshot: () => Promise.resolve(),
  getReplay: jest.fn(async (op?: ReplayOptions) => {
    return op ? events.slice((op.fromPosition || 1) - 1, op.toPosition || 2 ** 32 - 1) : events
  }),
  getReplayCount: jest.fn(async () => events.length),
  init: () => Promise.resolve(),
  close: () => Promise.resolve(),
}

let service: ReplayService
let eventBus: EventBus

const MODULE_NAME = 'TestModule'

class TestEvent1 extends DefaultEvent<Record<string, never>> {}

describe('ReplayService', () => {
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ESCQRSModule.forRoot({})],
    }).compile()
    eventBus = module.get<EventBus>(EventBus)
    eventBus.publish = jest.fn()
    service = new ReplayService(mockEventStore, eventBus, mockedLogger, eventStoreOptions)
  })

  afterEach(() => {
    events.splice(0, events.length)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should only replay "ReplayFinished" event', async () => {
    await expect(service.replay()).resolves.toBe(0)
    expect(mockEventStore.getReplayCount).toBeCalled()
    expect(eventBus.publish).toBeCalled()
  })

  it('should publish events', async () => {
    const event = new TestEvent1(uuidv4(), 'TestAggregate1', 1, new Date(), '', {})
    events.push(event)
    await expect(service.replay()).resolves.toBe(1)
    expect(mockEventStore.getReplay).toBeCalled()
    expect(eventBus.publish).toBeCalledWith(event)
  })

  it('should apply paging if too many events match the filter', async () => {
    const aggregateId = uuidv4()
    for (let i = 0; i < 10; i++) {
      events.push(new TestEvent1(aggregateId, 'TestAggregate1', i + 1, new Date(), '', {}))
    }
    await expect(service.replay({ pagingSize: 5 })).resolves.toBe(10)
    expect(mockEventStore.getReplay).toBeCalledTimes(2)
    expect(eventBus.publish).toBeCalledTimes(11)
  })
})

test('ReplayService - logging', async () => {
  eventStoreOptions.logging = true
  const loggingService = new ReplayService(
    mockEventStore,
    eventBus,
    mockedLogger,
    eventStoreOptions,
  )

  expect(loggingService).toBeDefined()
  await expect(service.replay()).resolves.toBe(0)
  expect(mockedLogger.log).toBeCalled()
})
