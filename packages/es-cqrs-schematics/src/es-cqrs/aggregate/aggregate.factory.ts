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
import { ParameterDeclarationStructure, Project, Scope, StructureKind } from 'ts-morph'

import { pastParticiple } from '../../past-participle'
import { formatCodeSettings } from '../format'
import { EsCqrsSchema, Parameter } from '../schema'
import { KeyValuesDefinition, getImports, isCreating, updateImports } from '../utils'
import { AggregateSchema } from './aggregate.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: AggregateSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const aggregatePath = join(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.aggregate.ts`,
    )
    if (!tree.exists(aggregatePath)) {
      return mergeWith(generate(options))(tree, context)
    }

    return updateAggregate(options)(tree, context)
  }
}

function transform(options: EsCqrsSchema): AggregateSchema {
  const parameters = options.parameters || []

  return {
    aggregate: options.moduleName,
    command: `${strings.camelize(options.verb)}${strings.classify(options.subject)}`,
    event: `${strings.classify(options.subject)}${strings.classify(
      pastParticiple(options.verb),
    )}`,
    parameters,
    imports: getImports(parameters),
    isCreating: isCreating(options),
    needsEventData:
      parameters.length > 1 || parameters.filter(param => param.isExistingObject).length === 0,
    hasMembers: parameters.filter(param => param.isMember).length > 0,
  }
}

function generate(options: AggregateSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path)),
  ])
}

function updateAggregate(options: AggregateSchema): Rule {
  return (tree: Tree) => {
    const aggregatePath = join(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.aggregate.ts`,
    )
    const aggregateSrc = tree.read(aggregatePath)
    if (!aggregateSrc) {
      return tree
    }

    const aggregateClassName = strings.classify(options.aggregate)
    const commandMethodName = strings.camelize(options.command)
    const eventClassName = strings.classify(options.event)

    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const aggregateSourceFile = project.createSourceFile(
      'aggregate.ts',
      aggregateSrc.toString(),
    )
    const aggregateClass = aggregateSourceFile.getClassOrThrow(aggregateClassName)

    const importDefinition: KeyValuesDefinition = {
      ['@sclable/nestjs-es-cqrs']: ['Aggregate', 'EventSourcableAggregate'],
      ['./events']: [eventClassName],
    }
    options.imports?.forEach(imp => {
      importDefinition[imp.path] = imp.imports
    })

    updateImports(aggregateSourceFile, importDefinition)

    if (options.hasMembers) {
      const memberNames = aggregateClass.getInstanceMembers().map(member => member.getName())
      options.parameters
        ?.filter(param => param.isMember && !memberNames.includes(param.name))
        .forEach(param =>
          aggregateClass.addMember({
            kind: StructureKind.Property,
            name: param.name,
            type: param.type,
            scope: Scope.Private,
          }),
        )
    }

    if (!aggregateClass.getInstanceMethod(commandMethodName)) {
      const parameterNameList = (options.parameters || []).map(param => param.name)
      const parametersText = options.needsEventData
        ? `{ ${parameterNameList.join(', ')} }`
        : parameterNameList[0]
      const parameterDeclarations: ParameterDeclarationStructure[] =
        options.parameters?.map((param: Parameter) => ({
          kind: StructureKind.Parameter,
          name: param.name,
          type: param.type,
        })) ?? []
      const statements: string[] = [`this.applyEvent(${eventClassName}, ${parametersText})`]
      if (options.isCreating) {
        parameterDeclarations.unshift({
          kind: StructureKind.Parameter,
          name: 'userId',
          type: 'string',
        })
        parameterDeclarations.push({
          kind: StructureKind.Parameter,
          name: 'id',
          type: 'string',
          initializer: 'uuidv4()',
        })
        statements.unshift(`const self = new ${aggregateClassName}(id, userId)`)
        statements.push('return self')
      }
      aggregateClass.addMethod({
        statements,
        name: commandMethodName,
        parameters: parameterDeclarations,
        returnType: options.isCreating ? aggregateClassName : 'void',
        scope: Scope.Public,
        isStatic: options.isCreating,
      })
      aggregateClass.addMethod({
        statements: options.hasMembers
          ? options.parameters
              ?.filter(param => param.isMember)
              .map(
                param =>
                  `this.${param.name} = event.data${
                    param.isExistingObject ? '' : '.' + param.name
                  }`,
              )
          : '/* no-op */',
        name: `on${eventClassName}`,
        parameters: [
          { name: (options.hasMembers ? '' : '_') + 'event', type: eventClassName },
        ],
        returnType: 'void',
        scope: Scope.Public,
      })
    }

    aggregateSourceFile.formatText(formatCodeSettings)

    if (!tree.exists(aggregatePath)) {
      tree.create(aggregatePath, aggregateSourceFile.getFullText())
    } else {
      tree.overwrite(aggregatePath, aggregateSourceFile.getFullText())
    }

    return tree
  }
}
