import { Test } from '@nestjs/testing'

import {
  QUEUE_SERVICE,
  QueueMessage,
  QueueModule,
  QueueModuleOptions,
  QueueServiceContract,
  QueueType,
} from '../src'

let service: QueueServiceContract

describe('Dummy adapter ', () => {
  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        QueueModule.forRootAsync({
          inject: [],
          useFactory: (): QueueModuleOptions => ({
            type: QueueType.DUMMY,
            config: {
              [QueueType.DUMMY]: {
                enabled: true,
              },
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

  test('listen and write', async () => {
    const message = 'Test message'
    await expect(
      service.addConsumer('test', (_msg: QueueMessage<string>) => {
        /* no-op */
      }),
    ).resolves.toBeUndefined()

    await expect(service.sendMessage('test', message)).resolves.toBeUndefined()
  })
})
