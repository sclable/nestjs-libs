import { Test } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'

import { StorageManager, StorageModule, StorageType } from '../src'

describe('Dummy adapter ', () => {
  let storage: StorageManager
  const TEST_BUCKET = 'test-bucket'
  const objectId = uuidv4()

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          defaultDriver: StorageType.DUMMY,
          config: {
            [StorageType.DUMMY]: {
              enabled: true,
            },
          },
        }),
      ],
    }).compile()

    storage = testModule.get(StorageManager)
  })

  test('default storage defined', () => {
    expect(storage).toBeDefined()
    expect(storage.disk()).toBeDefined()
    expect(storage.disk(StorageType.DUMMY)).toBeDefined()
  })

  test('putObject', async () => {
    await expect(
      storage.disk().putObject(TEST_BUCKET, objectId, Buffer.from('data')),
    ).resolves.toMatch(/random-etag-.*/)
  })

  test('getObject', async () => {
    const obj = await storage.disk().getObject(TEST_BUCKET, objectId)
    expect(obj).toBeInstanceOf(Buffer)
    expect(obj.toString()).toMatch(/random-string-.*/)
  })
})
