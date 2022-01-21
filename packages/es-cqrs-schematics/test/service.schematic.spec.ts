import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedText = `import { Injectable } from '@nestjs/common'
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

  public async addTestData(id: string, userId: string, param1: string, param2: number, param3: Parameter): Promise<void> {
    return this.commandBus.execute(new AddTestData(id, userId, param1, param2, param3))
  }
}
`

describe('Service Schematic', () => {
  const mainData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'add',
    subject: 'testData',
  }

  const generatedFile = '/src/schematic-test/schematic-test.service.ts'
  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await runner.runSchematicAsync('service', mainData, Tree.empty()).toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedText)
  })

  test('main with existing service', async () => {
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentNonEsCqrs)
    tree = await runner.runSchematicAsync('service', mainData, tree).toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForExistingFileNonEsCqrs)
  })

  test('main with existing service and parameters', async () => {
    const mainDataWithParameters = {
      ...mainData,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentNonEsCqrs)
    tree = await runner.runSchematicAsync('service', mainDataWithParameters, tree).toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextWithParameters)
  })
})
