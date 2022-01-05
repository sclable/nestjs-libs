import { readFileSync } from 'fs'
import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { AggregateSchema } from '../src/es-cqrs/aggregate/aggregate.schema'
import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

describe('Aggregate Schematic', () => {
  const aggregateData: AggregateSchema = {
    aggregate: 'SchematicTest',
    fileName: 'schematic-test',
    command: {
      name: 'addTestData',
      eventClass: 'TestDataAdded',
      eventData: '{}',
      parameters: [],
    },
  }
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
  const generatedFile = '/src/schematic-test/schematic-test.aggregate.ts'
  const generatedText = readFileSync(
    pathJoin(__dirname, 'schematic-test.aggregate.ts.result'),
  ).toString()
  const generatedTextWithParams = readFileSync(
    pathJoin(__dirname, 'schematic-test.aggregate.ts.param.result'),
  ).toString()
  const generatedTextUpdated = readFileSync(
    pathJoin(__dirname, 'schematic-test.aggregate.ts.update.result'),
  ).toString()
  const generatedTextFormatted = readFileSync(
    pathJoin(__dirname, 'schematic-test.aggregate.ts.format.result'),
  ).toString()
  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('standalone', async () => {
    const tree = await runner
      .runSchematicAsync('aggregate.standalone', aggregateData, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedText)
  })

  test('main', async () => {
    const tree = await runner
      .runSchematicAsync('aggregate', mainData, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedText)
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
      .runSchematicAsync('aggregate', mainDataWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextWithParams)
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
      .runSchematicAsync('aggregate', mainDataWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('aggregate', updateDataWithParameters, tree)
      .toPromise()
    expect(updatedTree.files).toHaveLength(1)
    expect(updatedTree.files).toContain(generatedFile)
    expect(updatedTree.readContent(generatedFile)).toBe(generatedTextUpdated)

    const formattedTree = new UnitTestTree(
      await runner.callRule(format(), updatedTree).toPromise(),
    )
    expect(formattedTree.readContent(generatedFile)).toBe(generatedTextFormatted)
  }, 10000)
})
