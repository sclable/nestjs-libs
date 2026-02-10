import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'
import { firstValueFrom } from 'rxjs'

import { SchematicTestRunner } from './schematic-test-runner'
import { EsCqrsSchema } from '../src/es-cqrs/schema'

const generatedTextForCreateOperation = `import { Injectable } from '@nestjs/common'
import { CommandBus } from '@sclable/nestjs-es-cqrs'

import { CreateSchematicTest } from './commands'

@Injectable()
export class SchematicTestService {
  public constructor(private readonly commandBus: CommandBus) {}

  public async createSchematicTest(userId: string): Promise<string> {
    return this.commandBus.execute(new CreateSchematicTest(userId))
  }
}
`

const generatedTextForAddOperation = `import { Injectable } from '@nestjs/common'
import { CommandBus } from '@sclable/nestjs-es-cqrs'

import { AddTestData } from './commands'

@Injectable()
export class SchematicTestService {
  public constructor(private readonly commandBus: CommandBus) {}

  public async addTestData(id: string, userId: string): Promise<void> {
    return this.commandBus.execute(new AddTestData(id, userId))
  }
}
`

const generatedTextForCreateOperationExistingFile = `import { Injectable } from '@nestjs/common'

import { UserService } from '../user'
import { CommandBus } from "@sclable/nestjs-es-cqrs"
import { CreateSchematicTest } from "./commands"

@Injectable()
export class SchematicTestService {
  public constructor(private readonly userService: UserService, private readonly commandBus: CommandBus) { }

  public async createSchematicTest(userId: string): Promise<string> {
    return this.commandBus.execute(new CreateSchematicTest(userId))
  }
}
`

const existingFileContentNonEsCqrs = `import { Injectable } from '@nestjs/common'

import { UserService } from '../user'

@Injectable()
export class SchematicTestService {
  public constructor(private readonly userService: UserService) {}
}
`

const generatedTextForExistingFileNonEsCqrs = `import { Injectable } from '@nestjs/common'

import { UserService } from '../user'
import { CommandBus } from "@sclable/nestjs-es-cqrs"
import { AddTestData } from "./commands"

@Injectable()
export class SchematicTestService {
  public constructor(private readonly userService: UserService, private readonly commandBus: CommandBus) { }

  public async addTestData(id: string, userId: string): Promise<void> {
    return this.commandBus.execute(new AddTestData(id, userId))
  }
}
`

const generatedTextWithParameters = `import { Injectable } from '@nestjs/common'

import { UserService } from '../user'
import { CommandBus } from "@sclable/nestjs-es-cqrs"
import { AddTestData } from "./commands"
import { Parameter } from "./parameter"

@Injectable()
export class SchematicTestService {
  public constructor(private readonly userService: UserService, private readonly commandBus: CommandBus) { }

  public async addTestData(id: string, param1: string, param2: number, param3: Parameter, userId: string): Promise<void> {
    return this.commandBus.execute(new AddTestData(id, param1, param2, param3, userId))
  }
}
`

describe('Service Schematic', () => {
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

  const generatedFile = '/src/schematic-test/schematic-test.service.ts'
  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('create operation', async () => {
    const tree = await firstValueFrom(
      runner.runSchematicAsync('service', createOperation, Tree.empty()),
    )
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForCreateOperation)
  })

  test('add operation', async () => {
    const tree = await firstValueFrom(
      runner.runSchematicAsync('service', addOperation, Tree.empty()),
    )
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForAddOperation)
  })

  test('create operation with existing service', async () => {
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentNonEsCqrs)
    tree = await firstValueFrom(runner.runSchematicAsync('service', createOperation, tree))
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForCreateOperationExistingFile)
  })

  test('add operation with existing service', async () => {
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentNonEsCqrs)
    tree = await firstValueFrom(runner.runSchematicAsync('service', addOperation, tree))
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForExistingFileNonEsCqrs)
  })

  test('add operation with existing service and parameters', async () => {
    const addOperationWithParameters = {
      ...addOperation,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentNonEsCqrs)
    tree = await firstValueFrom(
      runner.runSchematicAsync('service', addOperationWithParameters, tree),
    )
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextWithParameters)
  })
})
