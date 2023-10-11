/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { readFileSync } from 'fs'
import { join as pathJoin } from 'path'

import { JsonObject, logging, schema } from '@angular-devkit/core'
import {
  Collection,
  DelegateTree,
  HostTree,
  Rule,
  Schematic,
  SchematicContext,
  SchematicEngine,
  TaskConfiguration,
  Tree,
  callRule,
  formats,
} from '@angular-devkit/schematics'
import { BuiltinTaskExecutor } from '@angular-devkit/schematics/tasks/node'
import {
  NodeModulesTestEngineHost,
  validateOptionsWithSchema,
} from '@angular-devkit/schematics/tools'
import { Observable, of as observableOf } from 'rxjs'
import { map } from 'rxjs/operators'

export class UnitTestTree extends DelegateTree {
  public get files(): string[] {
    const result: string[] = []
    this.visit(path => result.push(path))

    return result
  }

  public readContent(path: string): string {
    const buffer = this.read(path)
    if (buffer === null) {
      return ''
    }

    return buffer.toString()
  }
}

export class SchematicTestRunner {
  private _engineHost = new NodeModulesTestEngineHost()
  // eslint-disable-next-line @typescript-eslint/ban-types
  private _engine: SchematicEngine<{}, {}> = new SchematicEngine(this._engineHost)
  // eslint-disable-next-line @typescript-eslint/ban-types
  private _collection: Collection<{}, {}>
  private _logger: logging.LoggerApi

  public constructor(
    private _collectionName: string,
    collectionPath: string,
  ) {
    this._engineHost.registerCollection(_collectionName, collectionPath)
    this._logger = new logging.Logger('test')

    const registry = new schema.CoreSchemaRegistry(formats.standardFormats)
    registry.registerUriHandler((uri: string): Promise<JsonObject> | undefined => {
      if (uri.startsWith('src')) {
        const content = readFileSync(pathJoin(__dirname, '..', uri))

        return JSON.parse(content.toString())
      }

      return undefined
    })
    registry.addPostTransform(schema.transforms.addUndefinedDefaults)

    this._engineHost.registerOptionsTransform(validateOptionsWithSchema(registry))
    this._engineHost.registerTaskExecutor(BuiltinTaskExecutor.NodePackage)
    this._engineHost.registerTaskExecutor(BuiltinTaskExecutor.RepositoryInitializer)
    this._engineHost.registerTaskExecutor(BuiltinTaskExecutor.RunSchematic)

    this._collection = this._engine.createCollection(this._collectionName)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public get engine(): SchematicEngine<{}, {}> {
    return this._engine
  }
  public get logger(): logging.LoggerApi {
    return this._logger
  }
  public get tasks(): TaskConfiguration[] {
    return [...this._engineHost.tasks]
  }

  public registerCollection(collectionName: string, collectionPath: string): void {
    this._engineHost.registerCollection(collectionName, collectionPath)
  }

  public runSchematicAsync<SchematicSchemaT>(
    schematicName: string,
    opts?: SchematicSchemaT,
    tree?: Tree,
  ): Observable<UnitTestTree> {
    const schematic = this._collection.createSchematic(schematicName, true)
    const host = observableOf(tree || new HostTree())
    this._engineHost.clearTasks()

    return schematic
      .call(opts || {}, host, { logger: this._logger })
      .pipe(map(tree => new UnitTestTree(tree)))
  }

  public runExternalSchematicAsync<SchematicSchemaT>(
    collectionName: string,
    schematicName: string,
    opts?: SchematicSchemaT,
    tree?: Tree,
  ): Observable<UnitTestTree> {
    const externalCollection = this._engine.createCollection(collectionName)
    const schematic = externalCollection.createSchematic(schematicName, true)
    const host = observableOf(tree || new HostTree())
    this._engineHost.clearTasks()

    return schematic
      .call(opts || {}, host, { logger: this._logger })
      .pipe(map(tree => new UnitTestTree(tree)))
  }

  public callRule(
    rule: Rule,
    tree: Tree,
    parentContext?: Partial<SchematicContext>,
  ): Observable<Tree> {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const context = this._engine.createContext({} as Schematic<{}, {}>, parentContext)

    return callRule(rule, observableOf(tree), context)
  }
}
