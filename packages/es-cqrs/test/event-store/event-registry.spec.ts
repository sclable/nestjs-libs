import { v4 as uuidv4 } from 'uuid'

import { DefaultEvent, EventConstructor, EventRegistry } from '../../src'

const aggregateId1 = uuidv4()
const revision1 = 1

interface TestEventData {
  some: string
}

class TestEvent extends DefaultEvent<TestEventData> {}

const eventRegistry = new EventRegistry()
const eventData: TestEventData = { some: 'value' }
const eventDate = new Date()
const event = new TestEvent(aggregateId1, 'TestAggregate', revision1, eventDate, '', eventData)

describe('EventRegistry', () => {
  it('should be defined', () => {
    expect(eventRegistry).toBeDefined()
  })

  it('should register and have an event constructor', () => {
    eventRegistry.register('TestEvent', TestEvent)
    const eventConstuctor = eventRegistry.get('TestEvent')
    expect(eventConstuctor).toBeDefined()
    expect(
      new eventConstuctor(aggregateId1, 'TestAggregate', revision1, eventDate, '', eventData),
    ).toEqual(event)
  })

  it('should throw if event not found', () => {
    const testError = (): EventConstructor => eventRegistry.get('NonExistentEvent')
    expect(testError).toThrow('Unknown event type NonExistentEvent')
  })
})
