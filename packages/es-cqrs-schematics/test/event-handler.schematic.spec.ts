import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'
import { firstValueFrom } from 'rxjs'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'

import { SchematicTestRunner } from './schematic-test-runner'

const generatedText1 = `import { EventHandler, IEventHandler } from '@sclable/nestjs-es-cqrs'

import { TestDataAdded } from '../events'

@EventHandler(TestDataAdded)
export class TestDataAddedHandler implements IEventHandler<TestDataAdded> {
  public async handle(_event: TestDataAdded) {
    /* no-op */
  }
}
`
const generatedIndexText = `import { TestDataAddedHandler } from "./test-data-added.handler"

export const eventHandlers = [TestDataAddedHandler]
`
const generatedText1WithParams = `import { EventHandler, IEventHandler } from '@sclable/nestjs-es-cqrs'

import { TestDataAdded } from '../events'

@EventHandler(TestDataAdded)
export class TestDataAddedHandler implements IEventHandler<TestDataAdded> {
  public async handle(_event: TestDataAdded) {
    /* no-op */
  }
}
`
const generatedText2WithParams = `import { EventHandler, IEventHandler } from '@sclable/nestjs-es-cqrs'

import { TestDataRemoved } from '../events'

@EventHandler(TestDataRemoved)
export class TestDataRemovedHandler implements IEventHandler<TestDataRemoved> {
  public async handle(_event: TestDataRemoved) {
    /* no-op */
  }
}
`
const generatedIndexUpdatedText = `import { TestDataAddedHandler } from "./test-data-added.handler"
import { TestDataRemovedHandler } from "./test-data-removed.handler"

export const eventHandlers = [
  TestDataAddedHandler,
  TestDataRemovedHandler
]
`
const generatedIndexFormattedText = `import { TestDataAddedHandler } from './test-data-added.handler'
import { TestDataRemovedHandler } from './test-data-removed.handler'

export const eventHandlers = [TestDataAddedHandler, TestDataRemovedHandler]
`

describe('Event Handler Schematic', () => {
  const mainData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'add',
    subject: 'testData',
  }
  const updateData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'remove',
    subject: 'testData',
  }

  const generatedIndexFile = '/src/schematic-test/event-handlers/index.ts'
  const generatedFile1 = '/src/schematic-test/event-handlers/test-data-added.handler.ts'
  const generatedFile2 = '/src/schematic-test/event-handlers/test-data-removed.handler.ts'

  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await firstValueFrom(
      runner.runSchematicAsync('event-handler', mainData, Tree.empty()),
    )
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedFile1, generatedIndexFile])
    expect(tree.readContent(generatedFile1)).toBe(generatedText1)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexText)
  })

  test('main with parameters', async () => {
    const mainDataWithParameters = {
      ...mainData,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const tree = await firstValueFrom(
      runner.runSchematicAsync('event-handler', mainDataWithParameters, Tree.empty()),
    )
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedFile1, generatedIndexFile])
    expect(tree.readContent(generatedFile1)).toBe(generatedText1WithParams)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexText)
  })

  test('main updated and formatted', async () => {
    const mainDataWithParameters = {
      ...mainData,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const updateDataWithParameters = {
      ...updateData,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'UpdateParameter', importPath: '../update-parameter' },
      ],
    }
    const tree = await firstValueFrom(
      runner.runSchematicAsync('event-handler', mainDataWithParameters, Tree.empty()),
    )
    const updatedTree = await firstValueFrom(
      runner.runSchematicAsync('event-handler', updateDataWithParameters, tree),
    )
    expect(updatedTree.files).toHaveLength(3)
    expect(tree.files).toEqual([generatedFile1, generatedIndexFile, generatedFile2])
    expect(updatedTree.readContent(generatedFile1)).toBe(generatedText1WithParams)
    expect(updatedTree.readContent(generatedFile2)).toBe(generatedText2WithParams)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexUpdatedText)

    const formattedTree = new UnitTestTree(
      await firstValueFrom(runner.callRule(format(), updatedTree)),
    )
    expect(formattedTree.readContent(generatedFile1)).toBe(generatedText1WithParams)
    expect(formattedTree.readContent(generatedFile2)).toBe(generatedText2WithParams)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexFormattedText)
  }, 45000)
})
