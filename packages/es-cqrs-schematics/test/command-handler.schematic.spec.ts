import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedCreateText = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { CreateSchematicTest } from '../commands'
import { SchematicTest } from '../schematic-test.aggregate'

@CommandHandler(CreateSchematicTest)
export class CreateSchematicTestHandler implements ICommandHandler<CreateSchematicTest> {
  constructor(@InjectRepository(SchematicTest) private readonly schematicTestRepository: Repository<SchematicTest>) {}

  public async execute(cmd: CreateSchematicTest): Promise<string> {
    const schematicTest = SchematicTest.createSchematicTest(cmd.userId)
    await this.schematicTestRepository.persist(schematicTest)
    return schematicTest.id
  }
}
`

const generatedCreateIndexText = `import { CreateSchematicTestHandler } from "./create-schematic-test.handler"

export const commandHandlers = [CreateSchematicTestHandler]
`

const generatedCreateWithParametersText = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { CreateSchematicTest } from '../commands'
import { SchematicTest } from '../schematic-test.aggregate'

@CommandHandler(CreateSchematicTest)
export class CreateSchematicTestHandler implements ICommandHandler<CreateSchematicTest> {
  constructor(@InjectRepository(SchematicTest) private readonly schematicTestRepository: Repository<SchematicTest>) {}

  public async execute(cmd: CreateSchematicTest): Promise<string> {
    const schematicTest = SchematicTest.createSchematicTest(cmd.param1, cmd.param2, cmd.param3, cmd.userId)
    await this.schematicTestRepository.persist(schematicTest)
    return schematicTest.id
  }
}
`

const generatedAddText = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { AddTestData } from '../commands'
import { SchematicTest } from '../schematic-test.aggregate'

@CommandHandler(AddTestData)
export class AddTestDataHandler implements ICommandHandler<AddTestData> {
  constructor(@InjectRepository(SchematicTest) private readonly schematicTestRepository: Repository<SchematicTest>) {}

  public async execute(cmd: AddTestData): Promise<void> {
    const schematicTest = await this.schematicTestRepository.find(cmd.id, cmd.userId)
    schematicTest.addTestData()
    await this.schematicTestRepository.persist(schematicTest)
  }
}
`

const generatedAddIndexText = `import { AddTestDataHandler } from "./add-test-data.handler"

export const commandHandlers = [AddTestDataHandler]
`

const generatedAddWithParametersText = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { AddTestData } from '../commands'
import { SchematicTest } from '../schematic-test.aggregate'

@CommandHandler(AddTestData)
export class AddTestDataHandler implements ICommandHandler<AddTestData> {
  constructor(@InjectRepository(SchematicTest) private readonly schematicTestRepository: Repository<SchematicTest>) {}

  public async execute(cmd: AddTestData): Promise<void> {
    const schematicTest = await this.schematicTestRepository.find(cmd.id, cmd.userId)
    schematicTest.addTestData(cmd.param1, cmd.param2, cmd.param3)
    await this.schematicTestRepository.persist(schematicTest)
  }
}
`
const generatedRemoveWithParametersText = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { RemoveTestData } from '../commands'
import { SchematicTest } from '../schematic-test.aggregate'

@CommandHandler(RemoveTestData)
export class RemoveTestDataHandler implements ICommandHandler<RemoveTestData> {
  constructor(@InjectRepository(SchematicTest) private readonly schematicTestRepository: Repository<SchematicTest>) {}

  public async execute(cmd: RemoveTestData): Promise<void> {
    const schematicTest = await this.schematicTestRepository.find(cmd.id, cmd.userId)
    schematicTest.removeTestData(cmd.param1, cmd.param2, cmd.param3)
    await this.schematicTestRepository.persist(schematicTest)
  }
}
`
const generatedRemoveIndexText = `import { AddTestDataHandler } from "./add-test-data.handler"
import { RemoveTestDataHandler } from "./remove-test-data.handler"

export const commandHandlers = [
  AddTestDataHandler,
  RemoveTestDataHandler
]
`
const generatedIndexFormattedText = `import { AddTestDataHandler } from './add-test-data.handler'
import { RemoveTestDataHandler } from './remove-test-data.handler'

export const commandHandlers = [AddTestDataHandler, RemoveTestDataHandler]
`

describe('Command Handler Schematic', () => {
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

  const generatedIndexFile = '/src/schematic-test/command-handlers/index.ts'
  const generatedCreateFile =
    '/src/schematic-test/command-handlers/create-schematic-test.handler.ts'
  const generatedAddFile = '/src/schematic-test/command-handlers/add-test-data.handler.ts'
  const generatedRemoveFile =
    '/src/schematic-test/command-handlers/remove-test-data.handler.ts'

  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('create operation', async () => {
    const tree = await runner
      .runSchematicAsync('command-handler', createOperation, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedCreateFile, generatedIndexFile])
    expect(tree.readContent(generatedCreateFile)).toBe(generatedCreateText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedCreateIndexText)
  })

  test('add operation with parameters', async () => {
    const createOperationWithParameters = {
      ...createOperation,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const tree = await runner
      .runSchematicAsync('command-handler', createOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedCreateFile, generatedIndexFile])
    expect(tree.readContent(generatedCreateFile)).toBe(generatedCreateWithParametersText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedCreateIndexText)
  })

  test('add operation', async () => {
    const tree = await runner
      .runSchematicAsync('command-handler', addOperation, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedAddFile, generatedIndexFile])
    expect(tree.readContent(generatedAddFile)).toBe(generatedAddText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedAddIndexText)
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
      .runSchematicAsync('command-handler', addOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(2)
    expect(tree.files).toEqual([generatedAddFile, generatedIndexFile])
    expect(tree.readContent(generatedAddFile)).toBe(generatedAddWithParametersText)
    expect(tree.readContent(generatedIndexFile)).toBe(generatedAddIndexText)
  })

  test('multiple handlers and formatting', async () => {
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
      .runSchematicAsync('command-handler', addOperationWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('command-handler', removeOperationWithParameters, tree)
      .toPromise()
    expect(updatedTree.files).toHaveLength(3)
    expect(tree.files).toEqual([generatedAddFile, generatedIndexFile, generatedRemoveFile])
    expect(updatedTree.readContent(generatedAddFile)).toBe(generatedAddWithParametersText)
    expect(updatedTree.readContent(generatedRemoveFile)).toBe(
      generatedRemoveWithParametersText,
    )
    expect(tree.readContent(generatedIndexFile)).toBe(generatedRemoveIndexText)

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
