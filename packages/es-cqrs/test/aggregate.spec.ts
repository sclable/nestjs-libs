import { v4 as uuidv4 } from 'uuid'

import { Aggregate, DefaultEvent, EventConstructor, EventSourcableAggregate } from '../src'
import { EVENTS_ON_AGGREGATE_METADATA } from '../src/decorators'

class TestEvent extends DefaultEvent<Record<string, never>> {}

const aggregateId1 = uuidv4()
const userId1 = uuidv4()
const revision1 = 1
const date1 = new Date()
const event1 = new TestEvent(aggregateId1, 'TestAggregate', revision1, date1, '', {})

@EventSourcableAggregate(TestEvent)
class TestAggregate extends Aggregate {
  public onTestEvent = jest.fn()
  public publish = jest.fn()
}

class UnsourcedTestAggregate extends Aggregate {}

const aggregate = new TestAggregate(aggregateId1, userId1)

describe('Aggregate', () => {
  it('should be defined', () => {
    expect(aggregate).toBeDefined()
  })

  it('should not get any uncommitted events', () => {
    expect(aggregate.getUncommittedEvents().length).toEqual(0)
  })

  it('should store and handle applied events', () => {
    aggregate.apply(event1)
    expect(aggregate.getUncommittedEvents()).toEqual([event1])
    expect(aggregate.onTestEvent).toBeCalledWith(event1)
  })

  it('should publish and remove commited events', () => {
    aggregate.commit()
    expect(aggregate.getUncommittedEvents().length).toEqual(0)
    expect(aggregate.publish).toBeCalledWith(event1)
  })

  it('give an upped revision', () => {
    expect(aggregate.uppedRevision()).toEqual(revision1 + 1)
  })

  it('should return list of possible events', () => {
    const testEvents: EventConstructor[] = Reflect.getMetadata(
      EVENTS_ON_AGGREGATE_METADATA,
      TestAggregate,
    )
    expect(testEvents.length).toEqual(1)
    expect(new testEvents[0](aggregateId1, 'TestAggregate', revision1, date1, '', {})).toEqual(
      event1,
    )
  })

  it('should not have events if decorator is missing', () => {
    expect(
      Reflect.getMetadata(EVENTS_ON_AGGREGATE_METADATA, UnsourcedTestAggregate),
    ).toBeUndefined()
  })
})
