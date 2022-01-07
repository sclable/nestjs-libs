import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedText1 = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

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
const generatedIndexText = `import { AddTestDataHandler } from "./add-test-data.handler"

export const commandHandlers = [AddTestDataHandler]
`
const generatedText1WithParams = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

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
const generatedText2WithParams = `import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

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
const generatedIndexUpdatedText = `import { AddTestDataHandler } from "./add-test-data.handler"
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

  const generatedIndexFile = '/src/schematic-test/command-handlers/index.ts'
  const generatedFile1 = '/src/schematic-test/command-handlers/add-test-data.handler.ts'
  const generatedFile2 = '/src/schematic-test/command-handlers/remove-test-data.handler.ts'

  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await runner.runSchematicAsync('command-handler', mainData, Tree.empty()).toPromise()
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
      .runSchematicAsync('command-handler', mainDataWithParameters, Tree.empty())
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
      .runSchematicAsync('command-handler', mainDataWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('command-handler', updateDataWithParameters, tree)
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
