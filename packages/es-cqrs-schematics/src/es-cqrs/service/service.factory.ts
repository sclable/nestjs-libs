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
import { Project, Scope } from 'ts-morph'

import { formatCodeSettings } from '../format'
import { EsCqrsSchema, Parameter } from '../schema'
import { KeyValuesDefinition, getImports, isCreating, updateImports } from '../utils'

import { ServiceSchema } from './service.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: ServiceSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const servicePath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.service.ts`,
    )
    if (tree.exists(servicePath)) {
      return updateService(options)(tree, context)
    }

    return mergeWith(generate(options))(tree, context)
  }
}

function transform(options: EsCqrsSchema): ServiceSchema {
  const parameters: Parameter[] = []
  if (!isCreating(options)) {
    parameters.push({ name: 'id', type: 'string' })
  }
  if (options.parameters) {
    parameters.push(...options.parameters)
  }
  parameters.push({ name: 'userId', type: 'string' })

  return {
    aggregate: options.moduleName,
    command: `${strings.classify(options.verb)}${strings.classify(options.subject)}`,
    imports: getImports(parameters),
    parameters,
    isCreating: isCreating(options),
  }
}

function generate(options: ServiceSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(pathJoin('src' as Path)),
  ])
}

function updateService(options: ServiceSchema): Rule {
  return (tree: Tree) => {
    const servicePath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.service.ts`,
    )
    const serviceSrc = tree.read(servicePath)
    if (!serviceSrc) {
      return tree
    }

    const commandClassName = strings.classify(options.command)
    const commandMethodName = strings.camelize(options.command)
    const serviceClassName = strings.classify(options.aggregate) + 'Service'

    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const serviceSourceFile = project.createSourceFile('service.ts', serviceSrc.toString())

    const importDefinition: KeyValuesDefinition = {
      ['@sclable/nestjs-es-cqrs']: ['CommandBus'],
      ['./commands']: [commandClassName],
    }
    options.imports?.forEach(imp => {
      importDefinition[imp.path] = imp.imports
    })

    updateImports(serviceSourceFile, importDefinition)

    const serviceClass = serviceSourceFile.getClass(serviceClassName)
    if (serviceClass) {
      const serviceConstructor = serviceClass.getConstructors()[0]
      if (
        !serviceConstructor
          .getParameters()
          .find(param => param.getType().getText() === 'CommandBus')
      ) {
        serviceConstructor.addParameter({
          name: 'commandBus',
          scope: Scope.Private,
          isReadonly: true,
          type: 'CommandBus',
        })
      }

      if (!serviceClass.getMethod(commandMethodName)) {
        serviceClass.addMethod({
          name: commandMethodName,
          returnType: `Promise<${options.isCreating ? 'string' : 'void'}>`,
          isAsync: true,
          scope: Scope.Public,
          parameters: options.parameters ?? [],
          statements: `return this.commandBus.execute(new ${commandClassName}(${options.parameters
            ?.map(param => param.name)
            .join(', ')}))`,
        })
      }
    }

    serviceSourceFile.formatText(formatCodeSettings)

    if (!tree.exists(servicePath)) {
      tree.create(servicePath, serviceSourceFile.getFullText())
    } else {
      tree.overwrite(servicePath, serviceSourceFile.getFullText())
    }

    return tree
  }
}
