import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedCreateText = `import { Command } from '@sclable/nestjs-es-cqrs'


export class CreateSchematicTest implements Command {
  constructor(
    public readonly userId: string,
  ) {}
}
`

const generatedCreateIndexText = `export { CreateSchematicTest } from "./create-schematic-test.command"
`

const generatedCreateWithParametersText = `import { Command } from '@sclable/nestjs-es-cqrs'

import { Parameter } from './parameter'

export class CreateSchematicTest implements Command {
  constructor(
    public readonly param1: string,
    public readonly param2: number,
    public readonly param3: Parameter,
    public readonly userId: string,
  ) {}
}
`

const generatedAddText = `import { Command } from '@sclable/nestjs-es-cqrs'


export class AddTestData implements Command {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
`
const generatedIndexText = `export { AddTestData } from "./add-test-data.command"
`

const generatedAddWithParametersText = `import { Command } from '@sclable/nestjs-es-cqrs'

import { Parameter } from './parameter'

export class AddTestData implements Command {
  constructor(
    public readonly id: string,
    public readonly param1: string,
    public readonly param2: number,
    public readonly param3: Parameter,
    public readonly userId: string,
  ) {}
}
`
const generatedRemoveWithParametersText = `import { Command } from '@sclable/nestjs-es-cqrs'

import { UpdateParameter } from '../update-parameter'

export class RemoveTestData implements Command {
  constructor(
    public readonly id: string,
    public readonly param1: string,
    public readonly param2: number,
    public readonly param3: UpdateParameter,
    public readonly userId: string,
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
  const createOperation: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'create',
    subject: 'SchematicTest',
  }
  const addOperation: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'add',
    subject: 'testData',
  }
  const removeOperation: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'remove',
    subject: 'testData',
  }

  const generatedIndexFile = '/src/schematic-test/commands/index.ts'
  const generatedCreateFile = '/src/schematic-test/commands/create-schematic-test.command.ts'
  const generatedAddFile = '/src/schematic-test/commands/add-test-data.command.ts'
  const generatedRemoveFile = '/src/schematic-test/commands/remove-test-data.command.ts'

  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('create operation', async () => {
    const tree = await runner
      .runSchematicAsync('command', createOperation, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedCreateFile, generatedIndexFile])
    expect(tree.readContent(generatedCreateFile)).toBe(generatedCreateText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedCreateIndexText)
  })

  test('create operation with parameters', async () => {
    const createOperationWithParameters = {
      ...createOperation,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const tree = await runner
      .runSchematicAsync('command', createOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedCreateFile, generatedIndexFile])
    expect(tree.readContent(generatedCreateFile)).toBe(generatedCreateWithParametersText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedCreateIndexText)
  })

  test('add operation', async () => {
    const tree = await runner
      .runSchematicAsync('command', addOperation, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedAddFile, generatedIndexFile])
    expect(tree.readContent(generatedAddFile)).toBe(generatedAddText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexText)
  })

  test('add operation with parameters', async () => {
    const addOperationWithParameters = {
      ...addOperation,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const tree = await runner
      .runSchematicAsync('command', addOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedAddFile, generatedIndexFile])
    expect(tree.readContent(generatedAddFile)).toBe(generatedAddWithParametersText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexText)
  })

  test('multiple commands and formatting', async () => {
    const addOperationWithParameters = {
      ...addOperation,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const removeOperationWithParameters = {
      ...removeOperation,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'UpdateParameter', importPath: '../update-parameter' },
      ],
    }
    const tree = await runner
      .runSchematicAsync('command', addOperationWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('command', removeOperationWithParameters, tree)
      .toPromise()
    expect(updatedTree.files).toHaveLength(3)
    expect(tree.files).toEqual([generatedAddFile, generatedIndexFile, generatedRemoveFile])
    expect(updatedTree.readContent(generatedAddFile)).toBe(generatedAddWithParametersText)
    expect(updatedTree.readContent(generatedRemoveFile)).toBe(
      generatedRemoveWithParametersText,
    )
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexUpdatedText)

    const formattedTree = new UnitTestTree(
      await runner.callRule(format(), updatedTree).toPromise(),
    )
    expect(formattedTree.readContent(generatedAddFile)).toBe(generatedAddWithParametersText)
    expect(formattedTree.readContent(generatedRemoveFile)).toBe(
      generatedRemoveWithParametersText,
    )
    expect(tree.readContent(generatedIndexFile)).toBe(generatedIndexFormattedText)
  }, 45000)
})
