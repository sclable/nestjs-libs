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
import { Project, VariableDeclarationKind } from 'ts-morph'

import { appendToArray, formatCodeSettings } from '../format'
import { EsCqrsSchema, Import } from '../schema'
import { CommandHandlerSchema } from './command-handler.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([
    standalone(transform(options)),
    // format(),
  ])
}

export function standalone(options: CommandHandlerSchema): Rule {
  return chain([mergeWith(generate(options)), updateIndex(options)])
}

function transform(options: EsCqrsSchema): CommandHandlerSchema {
  const importMap: Map<string, Set<string>> = new Map()
  const parameters = options.parameters || []
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
    command: `${strings.dasherize(options.verb)}-${strings.dasherize(options.subject)}`,
    commandClass: `${strings.classify(options.verb)}${strings.classify(options.subject)}`,
    imports,
    moduleName: options.moduleName || '',
    parameters,
  }
}

function generate(options: CommandHandlerSchema): Source {
  const aggregate = strings.camelize(options.moduleName)
  const aggregateClass = strings.classify(options.moduleName)
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
      aggregate,
      aggregateClass,
    }),
    move(join('src' as Path, strings.dasherize(options.moduleName), 'command-handlers')),
  ])
}

function updateIndex(options: CommandHandlerSchema): Rule {
  return (tree: Tree) => {
    const indexPath = join(
      'src' as Path,
      strings.dasherize(options.moduleName),
      'command-handlers',
      'index.ts',
    )
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const commandHandlersIndex = project.createSourceFile(
      'command-handlers.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )

    const moduleSpecifier = `./${options.command}.handler`
    const commandHandlerClass = `${options.commandClass}Handler`
    const namedImport = commandHandlersIndex.getImportDeclaration(moduleSpecifier)
    if (!namedImport) {
      commandHandlersIndex.addImportDeclaration({
        moduleSpecifier,
        namedImports: [commandHandlerClass],
      })
    }
    const exportAsArray = commandHandlersIndex.getVariableStatement('commandHandlers')
    if (!exportAsArray) {
      commandHandlersIndex.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: 'commandHandlers', initializer: `[${commandHandlerClass}]` }],
        isExported: true,
      })
    } else {
      const array = exportAsArray.getDeclarations()[0].getInitializer()
      if (array) {
        exportAsArray
          .getDeclarations()[0]
          .setInitializer(appendToArray(array.getText(), commandHandlerClass))
      }
    }
    commandHandlersIndex.formatText(formatCodeSettings)
    if (!tree.exists(indexPath)) {
      tree.create(indexPath, commandHandlersIndex.getFullText())
    } else {
      tree.overwrite(indexPath, commandHandlersIndex.getFullText())
    }

    return tree
  }
}
