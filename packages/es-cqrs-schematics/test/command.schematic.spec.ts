import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedText1 = `import { Command } from '@sclable/nestjs-es-cqrs'


export class AddTestData implements Command {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
`
const generatedIndexText = `export { AddTestData } from "./add-test-data.command"
`
const generatedText1WithParams = `import { Command } from '@sclable/nestjs-es-cqrs'

import { Parameter } from './parameter'

export class AddTestData implements Command {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly param1: string,
    public readonly param2: number,
    public readonly param3: Parameter,
  ) {}
}
`
const generatedText2WithParams = `import { Command } from '@sclable/nestjs-es-cqrs'

import { UpdateParameter } from '../update-parameter'

export class RemoveTestData implements Command {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly param1: string,
    public readonly param2: number,
    public readonly param3: UpdateParameter,
  ) {}
}
`
const generatedIndexUpdatedText = `export { AddTestData } from "./add-test-data.command"
export { RemoveTestData } from "./remove-test-data.command"
`
const generatedIndexFormattedText = `export { AddTestData } from './add-test-data.command'
export { RemoveTestData } from './remove-test-data.command'
`

describe('Command Schematic', () => {
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

  const generatedIndexFile = '/src/schematic-test/commands/index.ts'
  const generatedFile1 = '/src/schematic-test/commands/add-test-data.command.ts'
  const generatedFile2 = '/src/schematic-test/commands/remove-test-data.command.ts'

  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await runner.runSchematicAsync('command', mainData, Tree.empty()).toPromise()
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
      .runSchematicAsync('command', mainDataWithParameters, Tree.empty())
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
      .runSchematicAsync('command', mainDataWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('command', updateDataWithParameters, tree)
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
  }, 10000)
})
