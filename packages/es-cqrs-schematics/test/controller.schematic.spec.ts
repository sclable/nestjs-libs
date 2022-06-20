import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedText = `import { Body, Controller, Post, Param } from '@nestjs/common'
import { ApplicationUserContract, RequestUser } from '@sclable/nestjs-auth'
import { SchematicTestService } from './schematic-test.service'

@Controller('schematic-test')
export class SchematicTestController {
  public constructor(private readonly schematicTestService: SchematicTestService) {}

  @Post()
  public async addSchematicTest(
    @RequestUser() user: ApplicationUserContract,
  ): Promise<string> {
    return this.schematicTestService.addSchematicTest(user.id)
  }
}
`

const generatedUpdateText = `import { Body, Controller, Put, Param } from '@nestjs/common'
import { ApplicationUserContract, RequestUser } from '@sclable/nestjs-auth'
import { SchematicTestService } from './schematic-test.service'

@Controller('schematic-test')
export class SchematicTestController {
  public constructor(private readonly schematicTestService: SchematicTestService) {}

  @Put('/:id')
  public async removeTestData(
    @Param('id') id: string,
    @RequestUser() user: ApplicationUserContract,
  ): Promise<void> {
    return this.schematicTestService.removeTestData(id, user.id)
  }
}
`

const existingFileContentWithoutMethods = `import { Controller } from '@nestjs/common'

import { DatabaseService } from '../db'

@Controller('schematic-test')
export class SchematicTestController {
  public constructor(private readonly db: DatabaseService) {}
}
`

const generatedTextForExistingFileWithoutMethods = `import { Controller, Body, Param, Post } from '@nestjs/common'

import { DatabaseService } from '../db'
import { ApplicationUserContract, RequestUser } from "@sclable/nestjs-auth"
import { SchematicTestService } from "./schematic-test.service"

@Controller('schematic-test')
export class SchematicTestController {
  public constructor(private readonly db: DatabaseService, private readonly schematicTestService: SchematicTestService) { }

  @Post()
  public async addSchematicTest(@RequestUser() user: ApplicationUserContract): Promise<string> {
    return this.schematicTestService.addSchematicTest(user.id)
  }
}
`

const generatedTextWithParameters = `import { Controller, Body, Param, Post, Put } from '@nestjs/common'

import { DatabaseService } from '../db'
import { ApplicationUserContract, RequestUser } from "@sclable/nestjs-auth"
import { SchematicTestService } from "./schematic-test.service"
import { AddSchematicTestDto } from "./dto"

@Controller('schematic-test')
export class SchematicTestController {
  public constructor(private readonly db: DatabaseService, private readonly schematicTestService: SchematicTestService) { }

  @Post()
  public async addSchematicTest(@Body() dto: AddSchematicTestDto, @RequestUser() user: ApplicationUserContract): Promise<string> {
    return this.schematicTestService.addSchematicTest(dto.param1, dto.param2, dto.param3, user.id)
  }

  @Put('/:id')
  public async removeTestData(@Param('id') id: string, @RequestUser() user: ApplicationUserContract): Promise<void> {
    return this.schematicTestService.removeTestData(id, user.id)
  }
}
`

const generatedDtoText = `import { Parameter } from './parameter'

export interface AddSchematicTestDto {
  param1: string
  param2: number
  param3: Parameter
}
`

const generatedDtoIndexText = `export { AddSchematicTestDto } from "./add-schematic-test.dto"
`

describe('Controller Schematic', () => {
  const mainData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'add',
    subject: 'SchematicTest',
  }
  const updateData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'remove',
    subject: 'testData',
  }

  const generatedFile = '/src/schematic-test/schematic-test.controller.ts'
  const generatedDtoFile = '/src/schematic-test/dto/add-schematic-test.dto.ts'
  const generatedDtoIndexFile = '/src/schematic-test/dto/index.ts'
  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await runner
      .runSchematicAsync('controller', mainData, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toEqual([generatedFile])
    expect(tree.readContent(generatedFile)).toBe(generatedText)
  })

  test('update', async () => {
    const tree = await runner
      .runSchematicAsync('controller', updateData, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toEqual([generatedFile])
    expect(tree.readContent(generatedFile)).toBe(generatedUpdateText)
  })

  test('main with existing controller', async () => {
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentWithoutMethods)
    tree = await runner.runSchematicAsync('controller', mainData, tree).toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toEqual([generatedFile])
    expect(tree.readContent(generatedFile)).toBe(generatedTextForExistingFileWithoutMethods)
  })

  test('main with existing controller and parameters', async () => {
    const mainDataWithParameters = {
      ...mainData,
      parameters: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentWithoutMethods)
    tree = await runner
      .runSchematicAsync('controller', mainDataWithParameters, tree)
      .toPromise()
    tree = await runner.runSchematicAsync('controller', updateData, tree).toPromise()
    expect(tree.files).toHaveLength(3)
    expect(tree.files).toEqual([generatedFile, generatedDtoFile, generatedDtoIndexFile])
    expect(tree.readContent(generatedFile)).toBe(generatedTextWithParameters)
    expect(tree.readContent(generatedDtoFile)).toBe(generatedDtoText)
    expect(tree.readContent(generatedDtoIndexFile)).toBe(generatedDtoIndexText)
  })
})
