import { Test } from '@nestjs/testing'

import {
  QUEUE_SERVICE,
  QueueMessage,
  QueueModule,
  QueueModuleOptions,
  QueueServiceContract,
  QueueType,
} from '../src'

describe('Inmemory adapter ', () => {
  let service: QueueServiceContract

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        QueueModule.forRootAsync({
          inject: [],
          useFactory: (): QueueModuleOptions => ({
            type: QueueType.INMEMORY,
            config: {
              [QueueType.INMEMORY]: {},
            },
          }),
        }),
      ],
    }).compile()

    service = testModule.get(QUEUE_SERVICE)
  })

  test('service defined', () => {
    expect(service).toBeDefined()
  })

  test('listen and write', done => {
    const message = 'Test message'
    service.addConsumer('test', (msg: QueueMessage<string>) => {
      expect(msg.getContent()).toBe(message)
      done()
    })

    service.sendMessage('test', message)
  })
})
