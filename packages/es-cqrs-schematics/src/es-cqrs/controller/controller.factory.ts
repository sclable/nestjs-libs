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
import { ParameterDeclarationStructure, Project, Scope, StructureKind } from 'ts-morph'

import { formatCodeSettings } from '../format'
import { EsCqrsSchema } from '../schema'
import { KeyValuesDefinition, getImports, isCreating, updateImports } from '../utils'
import { ControllerSchema } from './controller.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: ControllerSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const controllerPath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.controller.ts`,
    )
    const rules: Rule[] = []

    if (tree.exists(controllerPath)) {
      rules.push(updateController(options))
    } else {
      rules.push(mergeWith(generateController(options)))
    }
    if (options.needsDto) {
      rules.push(mergeWith(generateDto(options)), updateDtoIndex(options))
    }

    return chain(rules)(tree, context)
  }
}

function transform(options: EsCqrsSchema): ControllerSchema {
  return {
    aggregate: options.moduleName,
    command: `${strings.classify(options.verb)}${strings.classify(options.subject)}`,
    imports: getImports(options.parameters ?? []),
    parameters: options.parameters,
    httpMethod: isCreating(options) ? 'Post' : 'Put',
    isCreating: isCreating(options),
    needsDto: (options.parameters?.length ?? -1) > 0,
  }
}

function generateController(options: ControllerSchema): Source {
  return apply(url('./templates/controller'), [
    template({
      ...strings,
      ...options,
    }),
    move(pathJoin('src' as Path, strings.dasherize(options.aggregate))),
  ])
}

function generateDto(options: ControllerSchema): Source {
  return apply(url('./templates/dto'), [
    template({
      ...strings,
      ...options,
    }),
    move(pathJoin('src' as Path, strings.dasherize(options.aggregate), 'dto')),
  ])
}

function updateDtoIndex(options: ControllerSchema): Rule {
  return (tree: Tree) => {
    const indexPath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      'dto',
      'index.ts',
    )
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const dtoIndex = project.createSourceFile(
      'dto.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )

    const moduleSpecifier = `./${strings.dasherize(options.command)}.dto`
    const namedExport = dtoIndex.getExportDeclaration(moduleSpecifier)
    if (!namedExport) {
      dtoIndex.addExportDeclaration({
        moduleSpecifier,
        namedExports: [`${strings.classify(options.command)}Dto`],
      })
    }
    dtoIndex.formatText(formatCodeSettings)
    if (!tree.exists(indexPath)) {
      tree.create(indexPath, dtoIndex.getFullText())
    } else {
      tree.overwrite(indexPath, dtoIndex.getFullText())
    }

    return tree
  }
}

function updateController(options: ControllerSchema): Rule {
  return (tree: Tree) => {
    const controllerPath = pathJoin(
      'src' as Path,
      strings.dasherize(options.aggregate),
      `${strings.dasherize(options.aggregate)}.controller.ts`,
    )
    const controllerSrc = tree.read(controllerPath)
    if (!controllerSrc) {
      return tree
    }

    const commandClassName = strings.classify(options.command)
    const commandDtoName = commandClassName + 'Dto'
    const commandMethodName = strings.camelize(options.command)
    const controllerClassName = strings.classify(options.aggregate) + 'Controller'
    const serviceClassName = strings.classify(options.aggregate) + 'Service'
    const serviceName = strings.camelize(serviceClassName)

    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const controllerSourceFile = project.createSourceFile(
      'controller.ts',
      controllerSrc.toString(),
    )

    const importDefinition: KeyValuesDefinition = {
      ['@sclable/nestjs-auth']: ['ApplicationUserContract', 'RequestUser'],
      ['@nestjs/common']: ['Body', 'Param', options.httpMethod ?? 'Put'],
      [`./${strings.dasherize(options.aggregate)}.service`]: [serviceClassName],
    }
    if (options.needsDto) {
      importDefinition['./dto'] = [commandDtoName]
    }

    updateImports(controllerSourceFile, importDefinition)

    const controllerClass = controllerSourceFile.getClass(controllerClassName)
    if (controllerClass) {
      const controllerConstructor = controllerClass.getConstructors()[0]
      if (
        !controllerConstructor
          .getParameters()
          .find(param => param.getType().getText() === serviceClassName)
      ) {
        controllerConstructor.addParameter({
          name: serviceName,
          scope: Scope.Private,
          isReadonly: true,
          type: serviceClassName,
        })
      }

      if (!controllerClass.getMethod(commandMethodName)) {
        const serviceMethodParameters: string[] = []
        if (!options.isCreating) {
          serviceMethodParameters.push('id')
        }
        serviceMethodParameters.push(
          ...(options.parameters?.map(param => 'dto.' + param.name) ?? []),
          'user.id',
        )
        const controllerMethodParameters: ParameterDeclarationStructure[] = []
        if (!options.isCreating) {
          controllerMethodParameters.push({
            kind: StructureKind.Parameter,
            name: 'id',
            type: 'string',
            decorators: [{ name: 'Param', arguments: [`'id'`] }],
          })
        }
        if (options.needsDto) {
          controllerMethodParameters.push({
            kind: StructureKind.Parameter,
            name: 'dto',
            type: commandDtoName,
            decorators: [{ name: 'Body', arguments: [] }],
          })
        }
        controllerMethodParameters.push({
          kind: StructureKind.Parameter,
          name: 'user',
          type: 'ApplicationUserContract',
          decorators: [{ name: 'RequestUser', arguments: [] }],
        })
        controllerClass.addMethod({
          decorators: [
            {
              name: options.httpMethod ?? 'Put',
              arguments: options.isCreating ? [] : [`'/:id'`],
            },
          ],
          name: commandMethodName,
          returnType: `Promise<${options.isCreating ? 'string' : 'void'}>`,
          isAsync: true,
          scope: Scope.Public,
          parameters: controllerMethodParameters,
          statements: `return this.${serviceName}.${commandMethodName}(${serviceMethodParameters.join(
            ', ',
          )})`,
        })
      }
    }

    controllerSourceFile.formatText(formatCodeSettings)

    if (!tree.exists(controllerPath)) {
      tree.create(controllerPath, controllerSourceFile.getFullText())
    } else {
      tree.overwrite(controllerPath, controllerSourceFile.getFullText())
    }

    return tree
  }
}
