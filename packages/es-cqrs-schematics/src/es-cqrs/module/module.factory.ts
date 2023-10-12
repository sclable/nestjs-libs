import { join as pathJoin } from 'path'

import { Path, strings } from '@angular-devkit/core'
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
import { ObjectLiteralExpression, Project, SyntaxKind } from 'ts-morph'

import { formatCodeSettings } from '../format'
import { EsCqrsSchema } from '../schema'
import { KeyValuesDefinition, mergeWithArrayString, updateImports } from '../utils'
import { ModuleSchema } from './module.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: ModuleSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const modulePath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.module.ts`,
    )
    if (tree.exists(modulePath)) {
      return updateModule(options)(tree, context)
    }

    return mergeWith(generate(options))(tree, context)
  }
}

function transform(options: EsCqrsSchema): ModuleSchema {
  return {
    aggregate: options.moduleName,
  }
}

function generate(options: ModuleSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(pathJoin('src' as Path)),
  ])
}

function updateModule(options: ModuleSchema): Rule {
  return (tree: Tree) => {
    const modulePath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.module.ts`,
    )
    const moduleSrc = tree.read(modulePath)
    if (!moduleSrc) {
      return tree
    }

    const aggregateClassName = strings.classify(options.aggregate)
    const serviceClassName = aggregateClassName + 'Service'
    const moduleClassName = aggregateClassName + 'Module'

    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const moduleSourceFile = project.createSourceFile('module.ts', moduleSrc.toString())

    const importDefinition: KeyValuesDefinition = {
      ['@sclable/nestjs-es-cqrs']: ['ESCQRSModule'],
      [`./${strings.dasherize(options.aggregate)}.aggregate`]: [aggregateClassName],
      [`./${strings.dasherize(options.aggregate)}.service`]: [serviceClassName],
      ['./command-handlers']: ['commandHandlers'],
      ['./event-handlers']: ['eventHandlers'],
    }

    const moduleDecoratorDefinition: KeyValuesDefinition = {
      imports: [`ESCQRSModule.forFeature([${aggregateClassName}])`],
      providers: ['...commandHandlers', '...eventHandlers', serviceClassName],
      exports: [serviceClassName],
    }

    updateImports(moduleSourceFile, importDefinition)

    const moduleClass = moduleSourceFile.getClass(moduleClassName)
    if (moduleClass) {
      const moduleDecorator = moduleClass.getDecorator('Module')
      if (moduleDecorator) {
        const moduleOptions = moduleDecorator.getArguments()[0] as ObjectLiteralExpression
        const moduleOptionsProperties = moduleOptions
          .getChildrenOfKind(SyntaxKind.PropertyAssignment)
          .map(prop => ({
            id: prop.getFirstChildByKind(SyntaxKind.Identifier),
            array: prop.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression),
          }))
        Object.keys(moduleDecoratorDefinition).forEach(propertyName => {
          const property = moduleOptionsProperties.find(
            prop => prop.id?.getText() === propertyName,
          )
          if (property) {
            moduleDecoratorDefinition[propertyName].forEach(propertyValue => {
              property.array?.replaceWithText(
                mergeWithArrayString(property.array.getFullText(), propertyValue),
              )
            })
          } else {
            moduleOptions.addPropertyAssignment({
              name: propertyName,
              initializer: `[ ${moduleDecoratorDefinition[propertyName].join(', ')} ]`,
            })
          }
        })
      }
    }

    moduleSourceFile.formatText(formatCodeSettings)

    if (!tree.exists(modulePath)) {
      tree.create(modulePath, moduleSourceFile.getFullText())
    } else {
      tree.overwrite(modulePath, moduleSourceFile.getFullText())
    }

    return tree
  }
}
