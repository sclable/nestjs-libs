import { join as pathJoin } from 'path'

import { Tree } from '@angular-devkit/schematics'
import { UnitTestTree } from '@angular-devkit/schematics/testing'

import { format } from '../src/es-cqrs/format'
import { EsCqrsSchema } from '../src/es-cqrs/schema'
import { SchematicTestRunner } from './schematic-test-runner'

const generatedCreateText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { schematicTestEvents, SchematicTestCreated } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {

  public static createSchematicTest(userId: string, id: string = uuidv4()): SchematicTest {
    const self = new SchematicTest(id, userId)
    this.applyEvent(SchematicTestCreated, {  })
    return self
  }

  public onSchematicTestCreated(_event: SchematicTestCreated): void {
    /* no-op */
  }
}
`

const generatedCreateWithParametersText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { Parameter } from './parameter'
import { schematicTestEvents, SchematicTestCreated } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {

  public static createSchematicTest(userId: string, param1: string, param2: number, param3: Parameter, id: string = uuidv4()): SchematicTest {
    const self = new SchematicTest(id, userId)
    this.applyEvent(SchematicTestCreated, { param1, param2, param3 })
    return self
  }

  public onSchematicTestCreated(_event: SchematicTestCreated): void {
    /* no-op */
  }
}
`

const generatedCreateWithParametersAndMembersText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { Parameter } from './parameter'
import { schematicTestEvents, SchematicTestCreated } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {
  private param1: string
  private param3: Parameter

  public static createSchematicTest(userId: string, param1: string, param2: number, param3: Parameter, id: string = uuidv4()): SchematicTest {
    const self = new SchematicTest(id, userId)
    this.applyEvent(SchematicTestCreated, { param1, param2, param3 })
    return self
  }

  public onSchematicTestCreated(event: SchematicTestCreated): void {
    this.param1 = event.data.param1
    this.param3 = event.data.param3
  }
}
`
const generatedAddText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { schematicTestEvents, TestDataAdded } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {

  public addTestData(): void {
    this.applyEvent(TestDataAdded, {  })
  }

  public onTestDataAdded(_event: TestDataAdded): void {
    /* no-op */
  }
}
`

const generatedAddWithParametersText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { Parameter } from './parameter'
import { schematicTestEvents, TestDataAdded } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {

  public addTestData(param1: string, param2: number, param3: Parameter): void {
    this.applyEvent(TestDataAdded, { param1, param2, param3 })
  }

  public onTestDataAdded(_event: TestDataAdded): void {
    /* no-op */
  }
}
`

const generatedAddAndCreateText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { Parameter } from './parameter'
import { schematicTestEvents, TestDataAdded, SchematicTestCreated } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {
  private param1: string
  private param2: number

  public addTestData(param1: string, param2: number, param3: Parameter): void {
    this.applyEvent(TestDataAdded, { param1, param2, param3 })
  }

  public onTestDataAdded(event: TestDataAdded): void {
    this.param1 = event.data.param1
    this.param2 = event.data.param2
  }

  private param3: Parameter

  public static createSchematicTest(userId: string, param1: string, param2: number, param3: Parameter, id: string = uuidv4()): SchematicTest {
    const self = new SchematicTest(id, userId)
    this.applyEvent(SchematicTestCreated, { param1, param2, param3 })
    return self
  }

  public onSchematicTestCreated(event: SchematicTestCreated): void {
    this.param1 = event.data.param1
    this.param3 = event.data.param3
  }
}
`

const generatedAddWithSingleObjectParameterText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { Parameter } from './parameter'
import { schematicTestEvents, TestDataAdded } from './events'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {
  private param3: Parameter

  public addTestData(param3: Parameter): void {
    this.applyEvent(TestDataAdded, param3)
  }

  public onTestDataAdded(event: TestDataAdded): void {
    this.param3 = event.data
  }
}
`
const generatedRemoveText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { Parameter } from './parameter'
import { schematicTestEvents, TestDataAdded, TestDataRemoved } from './events'
import { UpdateParameter } from "../update-parameter"

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {

  public addTestData(param1: string, param2: number, param3: Parameter): void {
    this.applyEvent(TestDataAdded, { param1, param2, param3 })
  }

  public onTestDataAdded(_event: TestDataAdded): void {
    /* no-op */
  }

  public removeTestData(param1: string, param2: number, param3: UpdateParameter): void {
    this.applyEvent(TestDataRemoved, { param1, param2, param3 })
  }

  public onTestDataRemoved(_event: TestDataRemoved): void {
    /* no-op */
  }
}
`
const generatedFormattedText = `import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'

import { UpdateParameter } from '../update-parameter'
import { TestDataAdded, TestDataRemoved, schematicTestEvents } from './events'
import { Parameter } from './parameter'

@EventSourcableAggregate(...schematicTestEvents)
export class SchematicTest extends Aggregate {
  public addTestData(param1: string, param2: number, param3: Parameter): void {
    this.applyEvent(TestDataAdded, { param1, param2, param3 })
  }

  public onTestDataAdded(_event: TestDataAdded): void {
    /* no-op */
  }

  public removeTestData(param1: string, param2: number, param3: UpdateParameter): void {
    this.applyEvent(TestDataRemoved, { param1, param2, param3 })
  }

  public onTestDataRemoved(_event: TestDataRemoved): void {
    /* no-op */
  }
}
`

describe('Aggregate Schematic', () => {
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
  const generatedFile = '/src/schematic-test/schematic-test.aggregate.ts'
  let runner: SchematicTestRunner

  beforeAll(() => {
    runner = new SchematicTestRunner('.', pathJoin(__dirname, '../src/collection.json'))
  })

  test('create operation', async () => {
    const tree = await runner
      .runSchematicAsync('aggregate', createOperation, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedCreateText)
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
      .runSchematicAsync('aggregate', createOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedCreateWithParametersText)
  })

  test('create operation with parameters and members', async () => {
    const createOperationWithParameters = {
      ...createOperation,
      parameters: [
        { name: 'param1', type: 'string', isMember: true },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter', isMember: true },
      ],
    }
    const tree = await runner
      .runSchematicAsync('aggregate', createOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedCreateWithParametersAndMembersText)
  })

  test('add operation', async () => {
    const tree = await runner
      .runSchematicAsync('aggregate', addOperation, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedAddText)
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
      .runSchematicAsync('aggregate', addOperationWithParameters, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedAddWithParametersText)
  })

  test('add operation with single object parameter', async () => {
    const addOperationWithSingleObjectParameter: EsCqrsSchema = {
      ...addOperation,
      parameters: [
        {
          name: 'param3',
          type: 'Parameter',
          importPath: './parameter',
          isMember: true,
          isObject: true,
        },
      ],
    }
    const tree = await runner
      .runSchematicAsync('aggregate', addOperationWithSingleObjectParameter, Tree.empty())
      .toPromise()
    expect(tree.files).toHaveLength(1)
    expect(tree.files).toContain(generatedFile)
    expect(tree.readContent(generatedFile)).toBe(generatedAddWithSingleObjectParameterText)
  })

  test('add and create operation with parameters', async () => {
    const addOperationWithParameters = {
      ...addOperation,
      parameters: [
        { name: 'param1', type: 'string', isMember: true },
        { name: 'param2', type: 'number', isMember: true },
        { name: 'param3', type: 'Parameter', importPath: './parameter' },
      ],
    }
    const createOperationWithParameters = {
      ...createOperation,
      parameters: [
        { name: 'param1', type: 'string', isMember: true },
        { name: 'param2', type: 'number' },
        { name: 'param3', type: 'Parameter', importPath: './parameter', isMember: true },
      ],
    }
    const tree = await runner
      .runSchematicAsync('aggregate', addOperationWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('aggregate', createOperationWithParameters, tree)
      .toPromise()
    expect(updatedTree.files).toHaveLength(1)
    expect(updatedTree.files).toContain(generatedFile)
    expect(updatedTree.readContent(generatedFile)).toBe(generatedAddAndCreateText)
  })

  test('multiple operations and formatting', async () => {
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
      .runSchematicAsync('aggregate', addOperationWithParameters, Tree.empty())
      .toPromise()
    const updatedTree = await runner
      .runSchematicAsync('aggregate', removeOperationWithParameters, tree)
      .toPromise()
    expect(updatedTree.files).toHaveLength(1)
    expect(updatedTree.files).toContain(generatedFile)
    expect(updatedTree.readContent(generatedFile)).toBe(generatedRemoveText)

    const formattedTree = new UnitTestTree(
      await runner.callRule(format(), updatedTree).toPromise(),
    )
    expect(formattedTree.readContent(generatedFile)).toBe(generatedFormattedText)
  }, 45000)
})
