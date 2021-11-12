import { Path, join, strings } from '@angular-devkit/core'
import {
  Rule,
  Source,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics'
import { plural } from 'pluralize'
import { Project, Scope } from 'ts-morph'

import { ClientServiceSchema } from './client-service.schema'

export function standalone(options: ClientServiceSchema): Rule {
  return chain([mergeWith(generate(options)), updateService(options)])
}

function generate(options: ClientServiceSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
      plural,
    }),
    move(join('src' as Path, 'app', 'core', options.moduleName)),
  ])
}

function updateService(options: ClientServiceSchema): Rule {
  const graphqlMethodToMethod = (gqlm: string): string => {
    switch (gqlm) {
      case 'query':
        return 'fetch'
      case 'mutation':
        return 'mutate'
      case 'subscription':
        return 'subscribe'
      default:
        return 'mutate'
    }
  }
  const graphqlTypeToTypeScript = (gqlt: string): string => {
    const arraySuffix = gqlt[0] === '[' ? '[]' : ''
    switch (gqlt.replace(/[[\]!]/g, '')) {
      case 'UUIDv4':
      case 'ID':
      case 'String':
        return 'string' + arraySuffix
      case 'Int':
      case 'Float':
        return 'number' + arraySuffix
      default:
        return gqlt + arraySuffix
    }
  }
  const subscribeOrPluck = (gqlm: string, func: string): string => {
    if (gqlm === 'mutation') {
      return 'subscribe()'
    }

    return `pipe(pluck('data', '${func}'))`
  }

  return (tree: Tree) => {
    const servicePath = join(
      'src' as Path,
      'app',
      'core',
      options.moduleName,
      `${options.moduleName}.service.ts`,
    )
    const serviceSrc = tree.read(servicePath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const service = project.createSourceFile(
      'service.ts',
      serviceSrc ? serviceSrc.toString() : '',
    )

    const moduleSpecifier = `./${plural(options.graphqlType)}/${strings.dasherize(
      options.name,
    )}.graphql`
    const namedImport = service.getImportDeclaration(moduleSpecifier)
    if (!namedImport) {
      service.addImportDeclaration({
        moduleSpecifier,
        namedImports: [`${strings.classify(options.name)}GQL`],
      })
    }

    const serviceClassName = `${strings.classify(options.moduleName)}Service`
    const serviceClass = service.getClassOrThrow(serviceClassName)
    const serviceConstructor = serviceClass.getConstructors()[0]
    if (!serviceConstructor) {
      throw new Error(`Constructor not found for ${serviceClassName}`)
    }
    const serviceConstructorParam = serviceConstructor.getParameter(
      `${strings.camelize(options.name)}GQL`,
    )
    if (!serviceConstructorParam) {
      serviceConstructor.addParameter({
        isReadonly: true,
        name: `${strings.camelize(options.name)}GQL`,
        scope: Scope.Private,
        type: `${strings.classify(options.name)}GQL`,
      })
    }

    const graphqlMethod = serviceClass.getInstanceMethod(strings.camelize(options.name))
    if (!graphqlMethod) {
      serviceClass.addMethod({
        statements: `return this.${strings.camelize(options.name)}GQL.${graphqlMethodToMethod(
          options.graphqlType,
        )}
          ({${
            options.parameters ? options.parameters.map(param => param.name).join(',') : ''
          }})
          .${subscribeOrPluck(options.graphqlType, options.graphqlFunction)}`,
        name: strings.camelize(options.name),
        parameters: options.parameters
          ? options.parameters.map(param => ({
              name: param.name,
              type: graphqlTypeToTypeScript(param.type),
            }))
          : [],
      })
    }

    if (!tree.exists(servicePath)) {
      tree.create(servicePath, service.getFullText())
    } else {
      tree.overwrite(servicePath, service.getFullText())
    }

    return tree
  }
}
