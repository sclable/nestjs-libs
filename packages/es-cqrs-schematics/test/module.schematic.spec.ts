import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'
import { firstValueFrom } from 'rxjs'

import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedText = `import { Module } from '@nestjs/common'
import { ESCQRSModule } from '@sclable/nestjs-es-cqrs'

import { SchematicTest } from './schematic-test.aggregate'
import { SchematicTestService } from './schematic-test.service'
import { commandHandlers } from './command-handlers'
import { eventHandlers } from './event-handlers'

@Module({
  imports: [ESCQRSModule.forFeature([SchematicTest])],
  providers: [...commandHandlers, ...eventHandlers, SchematicTestService],
  exports: [SchematicTestService],
})
export class SchematicTestModule {}
`

const existingFileContentNonEsCqrs = `import { Module } from '@nestjs/common'

import { UserModule, UserService } from '../user'

@Module({
  imports: [UserModule],
  providers: [UserService],
})
export class SchematicTestModule {}
`

const generatedTextForExistingFileNonEsCqrs = `import { Module } from '@nestjs/common'

import { UserModule, UserService } from '../user'
import { ESCQRSModule } from "@sclable/nestjs-es-cqrs"
import { SchematicTest } from "./schematic-test.aggregate"
import { SchematicTestService } from "./schematic-test.service"
import { commandHandlers } from "./command-handlers"
import { eventHandlers } from "./event-handlers"

@Module({
  imports: [
    UserModule,
    ESCQRSModule.forFeature([SchematicTest])
  ],
  providers: [
    UserService,
    ...commandHandlers,
    ...eventHandlers,
    SchematicTestService
  ],
  exports: [SchematicTestService]
})
export class SchematicTestModule { }
`

const generatedTextForAlreadyGeneratedText = `import { Module } from '@nestjs/common'
import { ESCQRSModule } from '@sclable/nestjs-es-cqrs'

import { SchematicTest } from './schematic-test.aggregate'
import { SchematicTestService } from './schematic-test.service'
import { commandHandlers } from './command-handlers'
import { eventHandlers } from './event-handlers'

@Module({
  imports: [
    ESCQRSModule.forFeature([SchematicTest])
  ],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    SchematicTestService
  ],
  exports: [
    SchematicTestService
  ],
})
export class SchematicTestModule { }
`

describe('Module Schematic', () => {
  const mainData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'add',
    subject: 'testData',
  }

  const otherData: EsCqrsSchema = {
    moduleName: 'SchematicTest',
    verb: 'set',
    subject: 'testData',
  }

  const generatedFile = '/src/schematic-test/schematic-test.module.ts'
  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('main', async () => {
    const tree = await firstValueFrom(
      runner.runSchematicAsync('module', mainData, Tree.empty()),
    )
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedText)
  })

  test('main with existing module', async () => {
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, existingFileContentNonEsCqrs)
    tree = await firstValueFrom(runner.runSchematicAsync('module', mainData, tree))
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForExistingFileNonEsCqrs)
  })

  test('main with es-cqrs module', async () => {
    let tree = new UnitTestTree(Tree.empty())
    tree.create(generatedFile, generatedText)
    tree = await firstValueFrom(runner.runSchematicAsync('module', otherData, tree))
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedTextForAlreadyGeneratedText)
  })
})
