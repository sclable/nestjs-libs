import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedText1 = `import { DefaultEvent } from '@sclable/nestjs-es-cqrs'


export class TestDataAdded extends DefaultEvent<{}> {}
`
const generatedIndexText = `import { TestDataAdded } from "./test-data-added.event"

export const SchematicTestEvents = [TestDataAdded]

export { TestDataAdded }
`
const generatedText1WithParams = `import { DefaultEvent } from '@sclable/nestjs-es-cqrs'

import { Parameter } from './parameter'

interface EventData {
  param1: string
  param2: number
  param3: Parameter
}

export class TestDataAdded extends DefaultEvent<EventData> {}
`
const generatedText2WithParams = `import { DefaultEvent } from '@sclable/nestjs-es-cqrs'

import { UpdateParameter } from '../update-parameter'

interface EventData {
  param1: string
  param2: number
  param3: UpdateParameter
}

export class TestDataRemoved extends DefaultEvent<EventData> {}
`
const generatedIndexUpdatedText = `import { TestDataAdded } from "./test-data-added.event"
import { TestDataRemoved } from "./test-data-removed.event"

export const SchematicTestEvents = [
  TestDataAdded,
  TestDataRemoved
]

export { TestDataAdded, TestDataRemoved }
`
const generatedIndexFormattedText = `import { TestDataAdded } from './test-data-added.event'
import { TestDataRemoved } from './test-data-removed.event'

export const SchematicTestEvents = [TestDataAdded, TestDataRemoved]

export { TestDataAdded, TestDataRemoved }
`

describe('Event Schematic', () => {
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

  const generatedIndexFile = '/src/schematic-test/events/index.ts'
  const generatedFile1 = '/src/schematic-test/events/test-data-added.event.ts'
  const generatedFile2 = '/src/schematic-test/events/test-data-removed.event.ts'

  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await runner.runSchematicAsync('event', mainData, Tree.empty()).toPromise()
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
    const tree = await runner
      .runSchematicAsync('event', mainDataWithParameters, Tree.empty())
      .toPromise()
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
    const tree = await runner
      .runSchematicAsync('event', mainDataWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('event', updateDataWithParameters, tree)
      .toPromise()
    expect(updatedTree.files).toHaveLength(3)
    expect(tree.files).toEqual([generatedFile1, generatedIndexFile, generatedFile2])
    expect(updatedTree.readContent(generatedFile1)).toBe(generatedText1WithParams)
    expect(updatedTree.readContent(generatedFile2)).toBe(generatedText2WithParams)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexUpdatedText)

    const formattedTree = new UnitTestTree(
      await runner.callRule(format(), updatedTree).toPromise(),
    )
    expect(formattedTree.readContent(generatedFile1)).toBe(generatedText1WithParams)
    expect(formattedTree.readContent(generatedFile2)).toBe(generatedText2WithParams)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexFormattedText)
  }, 15000)
})
