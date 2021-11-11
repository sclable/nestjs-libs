const mockedLimit = jest.fn().mockImplementation((cb: () => void) => cb())
const mockedPLimit = jest.fn().mockImplementation(() => mockedLimit)
jest.mock('p-limit', () => mockedPLimit)

import { Test, TestingModule } from '@nestjs/testing'

import {
  CustomEventOptions,
  DefaultEvent,
  Event,
  EventHandler,
  IEventHandler,
  InmemoryEventStoreProvider,
} from '../src'
import { EventStoreModule } from '../src/event-store'
import { RateLimitedEventBus } from '../src/rate-limited-event-bus'

const TEST_AGGREGATE_NAME = 'TestAggregate'

class TestEvent1 extends DefaultEvent<Record<string, never>> {}

class TestEnd extends DefaultEvent<Record<string, never>> {}

class TestCustomEvent1 extends DefaultEvent<Record<string, unknown>> {}

class TestCustomEvent2 implements Event {
  public readonly customOptions: CustomEventOptions
  public constructor(
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    public readonly revision: number,
    public readonly createdAt: Date,
    public readonly userId: string,
    public readonly data: { id: string },
  ) {
    this.customOptions = { queueById: data.id }
  }
}

@EventHandler(TestEvent1)
class TestEvent1Handler implements IEventHandler<TestEvent1> {
  public handle(_: TestEvent1): void {
    /* no-op */
  }
}

@EventHandler(TestCustomEvent1, TestCustomEvent2)
class CombinedEventHandler implements IEventHandler<TestCustomEvent1 | TestCustomEvent2> {
  public handle(_: TestCustomEvent1 | TestCustomEvent2): void {
    /* no-op */
  }
}

@EventHandler(TestEnd)
class TestEndHandler implements IEventHandler<TestEnd> {
  public handle(_: TestEnd): void {
    /* no-op */
  }
}

describe('RateLimitedEventBus', () => {
  const mockedHandler = new TestEvent1Handler()
  mockedHandler.handle = jest.fn()
  const mockedCombinedHandler = new CombinedEventHandler()
  mockedCombinedHandler.handle = jest.fn()
  const testEndHandler = new TestEndHandler()

  let eventBus: RateLimitedEventBus

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventStoreModule.forRoot({}, InmemoryEventStoreProvider)],
      providers: [TestEvent1Handler, CombinedEventHandler, TestEndHandler],
    })
      .overrideProvider(TestEvent1Handler)
      .useValue(mockedHandler)
      .overrideProvider(CombinedEventHandler)
      .useValue(mockedCombinedHandler)
      .overrideProvider(TestEndHandler)
      .useValue(testEndHandler)
      .compile()
    eventBus = module.get<RateLimitedEventBus>(RateLimitedEventBus)
  })

  it('should be defined', () => {
    expect(eventBus).toBeDefined()
  })

  it('should register and use handler', done => {
    eventBus.register([TestEvent1Handler, CombinedEventHandler, TestEndHandler])
    eventBus.publish(new TestEvent1('id', TEST_AGGREGATE_NAME, 1, new Date(), 'user', {}))
    eventBus.publish(new TestEvent1('id', TEST_AGGREGATE_NAME, 2, new Date(), 'user', {}))
    eventBus.publish(new TestEvent1('id', TEST_AGGREGATE_NAME, 3, new Date(), 'user', {}))
    eventBus.publish(
      new TestCustomEvent1(
        'id',
        TEST_AGGREGATE_NAME,
        4,
        new Date(),
        'user',
        {},
        { skipQueue: true },
      ),
    )
    eventBus.publish(
      new TestCustomEvent1(
        'id',
        TEST_AGGREGATE_NAME,
        5,
        new Date(),
        'user',
        {},
        { skipQueue: true },
      ),
    )
    eventBus.publish(
      new TestCustomEvent2('id', TEST_AGGREGATE_NAME, 6, new Date(), 'user', {
        id: 'customId',
      }),
    )
    testEndHandler.handle = (): void => {
      expect(mockedPLimit).toBeCalledTimes(2) // for id, and customId
      expect(mockedLimit).toBeCalledTimes(5) // 3+end for id, and 1 for customId
      expect(mockedHandler.handle).toBeCalledTimes(3)
      expect(mockedCombinedHandler.handle).toBeCalledTimes(3)
      done()
    }
    eventBus.publish(new TestEnd('id', TEST_AGGREGATE_NAME, 7, new Date(), 'user', {}))
  })
})
