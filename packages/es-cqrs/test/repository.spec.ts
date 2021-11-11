jest.mock('@nestjs/cqrs')
jest.mock('../src/aggregate')
jest.mock('../src/event-store/event-registry')

import { Test, TestingModule } from '@nestjs/testing'
import 'reflect-metadata'
import { v4 as uuidv4 } from 'uuid'

import {
  Aggregate,
  DefaultEvent,
  ESCQRSModule,
  EVENT_STORE_PROVIDER,
  Event,
  EventConstructor,
  EventRegistry,
  EventSourcableAggregate,
  Repository,
} from '../src'
import { getRepositoryToken } from '../src/repository'

const aggregateId1 = uuidv4()
const userId1 = uuidv4()

class TestEvent extends DefaultEvent<Record<string, never>> {}

const event1: Event = new TestEvent(aggregateId1, 'TestAggregate', 1, new Date(), 'user', {})

const mockEventStore = {
  getEvents: jest.fn(() => Promise.resolve([event1])),
  getSnapshot: jest.fn(() => Promise.resolve({})),
  saveEvents: jest.fn(events => Promise.resolve(events)),
  saveSnapshot: jest.fn(() => Promise.resolve()),
}

const MockEventStore = jest.fn(() => mockEventStore)

const eventStore = new MockEventStore()

const eventRegistry = new EventRegistry()

@EventSourcableAggregate(TestEvent)
class TestAggregate extends Aggregate {
  public revision = 1
  public getUncommittedEvents = jest.fn(() => [event1])
  public loadFromHistory = jest.fn()

  public constructor(id = aggregateId1, userId = userId1) {
    super(id, userId)
  }

  public static events(): EventConstructor[] {
    return [TestEvent]
  }
}

const testAggregate = new TestAggregate()

const mockedVersionAggregate = Aggregate as unknown as jest.Mock<Aggregate>

describe('Repository', () => {
  let repo: Repository<TestAggregate>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ESCQRSModule.forRoot({}), ESCQRSModule.forFeature([TestAggregate])],
    })
      .overrideProvider(EVENT_STORE_PROVIDER)
      .useValue(eventStore)
      .overrideProvider(EventRegistry)
      .useValue(eventRegistry)
      .compile()
    repo = module.get<Repository<TestAggregate>>(getRepositoryToken(TestAggregate))
  })

  afterEach(() => {
    testAggregate.revision = 1
    jest.clearAllMocks()
    mockEventStore.getEvents.mockImplementation(() => Promise.resolve([event1]))
  })

  it('should be defined and register events', () => {
    expect(repo).toBeDefined()
    expect(eventRegistry.register).toBeCalledWith('TestEvent', TestEvent)
  })

  it('should persist an aggregate', async () => {
    await expect(repo.persist(testAggregate))
      .resolves.toBeUndefined()
      .then(() => {
        expect(testAggregate.commit).toHaveBeenCalled()
        expect(mockEventStore.saveSnapshot).toHaveBeenCalledWith(testAggregate)
        expect(mockEventStore.saveEvents).toHaveBeenCalledWith(testAggregate)
      })
  })

  it('should find an aggregate', async () => {
    await expect(repo.find(aggregateId1, userId1))
      .resolves.toBeDefined()
      .then(() => {
        expect(Aggregate).toHaveBeenCalled()
        expect(mockEventStore.getSnapshot).toHaveBeenCalledWith(aggregateId1)
        expect(mockEventStore.getEvents).toHaveBeenCalledWith(aggregateId1, 2)
        expect(mockedVersionAggregate.mock.instances[0].loadFromHistory).toHaveBeenCalledWith([
          event1,
        ])
      })
  })

  it('should not find a non-existent aggregate', async () => {
    mockEventStore.getEvents.mockImplementation(() => Promise.reject())
    await expect(repo.find(aggregateId1, userId1))
      .rejects.toBeUndefined()
      .then(() => {
        expect(Aggregate).toHaveBeenCalled()
        expect(mockEventStore.getSnapshot).toHaveBeenCalledWith(aggregateId1)
        expect(mockEventStore.getEvents).toHaveBeenCalled()
        expect(mockedVersionAggregate.mock.instances[0].loadFromHistory).not.toHaveBeenCalled()
      })
  })

  it('should find an aggregate without snapshot', async () => {
    await expect(repo.find(aggregateId1, userId1))
      .resolves.toBeDefined()
      .then(() => {
        expect(Aggregate).toHaveBeenCalled()
        expect(mockEventStore.getSnapshot).toHaveBeenCalledWith(aggregateId1)
        expect(mockEventStore.getEvents).toHaveBeenCalledWith(aggregateId1, 2)
        expect(mockedVersionAggregate.mock.instances[0].loadFromHistory).toHaveBeenCalledWith([
          event1,
        ])
      })
  })
})
