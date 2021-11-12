import { Path, join, strings } from '@angular-devkit/core'
import {
  Rule,
  SchematicContext,
  Source,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics'
import { Project } from 'ts-morph'

import { pastParticiple } from '../../past-participle'
import { EsCqrsSchema, Import, Parameter } from '../schema'
import { AggregateSchema } from './aggregate.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: AggregateSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const aggregatePath = join(
      'src' as Path,
      options.fileName,
      `${options.fileName}.aggregate.ts`,
    )
    if (!tree.exists(aggregatePath)) {
      return mergeWith(generate(options))(tree, context)
    }

    return updateAggregate(options)(tree, context)
  }
}

function transform(options: EsCqrsSchema): AggregateSchema {
  const parameters = options.parameters || []
  const needEventDataType =
    parameters.length > 1 || parameters.filter(param => !!param.importPath).length === 0
  const importMap: Map<string, Set<string>> = new Map()
  parameters.forEach(param => {
    if (param.importPath) {
      if (!importMap.has(param.importPath)) {
        importMap.set(param.importPath, new Set())
      }
      const importPathSet = importMap.get(param.importPath)
      importPathSet && importPathSet.add(param.type)
    }
  })
  const imports: Import[] = []
  importMap.forEach((namedImports, path) => imports.push({ path, imports: [...namedImports] }))

  return {
    aggregate: options.moduleName,
    command: {
      eventClass: `${strings.classify(options.subject)}${strings.classify(
        pastParticiple(options.verb),
      )}`,
      eventData: needEventDataType
        ? `{${parameters.map(param => param.name).join(',')}}`
        : parameters[0].name,
      name: `${strings.camelize(options.verb)}${strings.classify(options.subject)}`,
      parameters,
    },
    fileName: strings.dasherize(options.moduleName),
    imports,
  }
}

function generate(options: AggregateSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path, strings.dasherize(options.fileName))),
  ])
}

function updateAggregate(options: AggregateSchema): Rule {
  return (tree: Tree) => {
    const aggregatePath = join(
      'src' as Path,
      options.fileName,
      `${options.fileName}.aggregate.ts`,
    )
    const aggregateSrc = tree.read(aggregatePath)
    if (!aggregateSrc) {
      return tree
    }
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const aggregate = project.createSourceFile('aggregate.ts', aggregateSrc.toString())
    const aggregateClass = aggregate.getClassOrThrow(strings.classify(options.fileName))

    if (!aggregateClass.getInstanceMethod(options.command.name)) {
      aggregateClass.addMethod({
        statements: `this.applyEvent(${options.command.eventClass}, ${options.command.eventData})`,
        name: options.command.name,
        parameters:
          options.command.parameters &&
          options.command.parameters.map((param: Parameter) => ({
            name: param.name,
            type: param.type,
          })),
        returnType: 'void',
      })
      aggregateClass.addMethod({
        statements: '/* no-op */',
        name: `on${options.command.eventClass}`,
        parameters: [{ name: 'event', type: options.command.eventClass }],
        returnType: 'void',
      })
      const eventImports = aggregate.getImportDeclaration('./events')
      if (eventImports) {
        if (
          !eventImports
            .getNamedImports()
            .map(ni => ni.getName())
            .includes(options.command.eventClass)
        ) {
          eventImports.addNamedImport(options.command.eventClass)
        }
      }
    }
    if (options.imports && options.imports.length > 0) {
      options.imports.forEach(imp => {
        const i = aggregate.getImportDeclaration(imp.path)
        if (i) {
          imp.imports.forEach(ii => {
            if (
              !i
                .getNamedImports()
                .map(ni => ni.getName())
                .includes(ii)
            ) {
              i.addNamedImport(ii)
            }
          })
        } else {
          aggregate.addImportDeclaration({
            moduleSpecifier: imp.path,
            namedImports: imp.imports,
          })
        }
      })
    }

    if (!tree.exists(aggregatePath)) {
      tree.create(aggregatePath, aggregate.getFullText())
    } else {
      tree.overwrite(aggregatePath, aggregate.getFullText())
    }

    return tree
  }
}
