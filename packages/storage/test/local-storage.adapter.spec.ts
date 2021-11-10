import { Test } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'

import { StorageManager, StorageModule, StorageType } from '../src'

describe('Local storage adapter ', () => {
  let storage: StorageManager
  const TEST_BUCKET = 'test-bucket'
  const objectId = uuidv4()
  const objectData = 'Test object data'
  const uuidv4Regex = new RegExp(
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  )

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          defaultDriver: StorageType.LOCAL,
          config: {
            [StorageType.LOCAL]: {
              basePath: '.',
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
    expect(storage.disk(StorageType.LOCAL)).toBeDefined()
  })

  test('putObject', async () => {
    await expect(
      storage.disk().putObject(TEST_BUCKET, objectId, Buffer.from(objectData)),
    ).resolves.toMatch(uuidv4Regex)
  })

  test('getObject', async () => {
    const obj = await storage.disk().getObject(TEST_BUCKET, objectId)
    expect(obj).toBeInstanceOf(Buffer)
    expect(obj.toString()).toMatch(objectData)
  })
})
