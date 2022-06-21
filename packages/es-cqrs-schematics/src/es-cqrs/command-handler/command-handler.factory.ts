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

import { formatCodeSettings } from '../format'
import { EsCqrsSchema } from '../schema'
import { appendToArrayString, isCreating } from '../utils'
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
  return {
    command: `${strings.dasherize(options.verb)}-${strings.dasherize(options.subject)}`,
    aggregate: options.moduleName,
    parameters: options.parameters || [],
    isCreating: isCreating(options),
  }
}

function generate(options: CommandHandlerSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path, strings.dasherize(options.aggregate))),
  ])
}

function updateIndex(options: CommandHandlerSchema): Rule {
  return (tree: Tree) => {
    const indexPath = join(
      'src' as Path,
      strings.dasherize(options.aggregate),
      'command-handlers',
      'index.ts',
    )
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const commandHandlersIndex = project.createSourceFile(
      'command-handlers.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )

    const moduleSpecifier = `./${strings.dasherize(options.command)}.handler`
    const commandHandlerClass = `${strings.classify(options.command)}Handler`
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
          .setInitializer(appendToArrayString(array.getText(), commandHandlerClass))
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
