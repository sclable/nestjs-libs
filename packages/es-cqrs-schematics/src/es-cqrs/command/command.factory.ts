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
import { Project } from 'ts-morph'

import { formatCodeSettings } from '../format'
import { EsCqrsSchema } from '../schema'
import { getImports } from '../utils'
import { CommandSchema } from './command.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: CommandSchema): Rule {
  return chain([mergeWith(generate(options)), updateIndex(options)])
}

function transform(options: EsCqrsSchema): CommandSchema {
  return {
    command: `${strings.dasherize(options.verb)}-${strings.dasherize(options.subject)}`,
    commandClass: `${strings.classify(options.verb)}${strings.classify(options.subject)}`,
    imports: getImports(options.parameters ?? []),
    moduleName: options.moduleName || '',
    parameters: options.parameters,
  }
}

function generate(options: CommandSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path, strings.dasherize(options.moduleName))),
  ])
}

function updateIndex(options: CommandSchema): Rule {
  return (tree: Tree) => {
    const indexPath = join(
      'src' as Path,
      strings.dasherize(options.moduleName),
      'commands',
      'index.ts',
    )
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const commandsIndex = project.createSourceFile(
      'commands.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )

    const moduleSpecifier = `./${options.command}.command`
    const namedExport = commandsIndex.getExportDeclaration(moduleSpecifier)
    if (!namedExport) {
      commandsIndex.addExportDeclaration({
        moduleSpecifier,
        namedExports: [`${options.commandClass}`],
      })
    }
    commandsIndex.formatText(formatCodeSettings)
    if (!tree.exists(indexPath)) {
      tree.create(indexPath, commandsIndex.getFullText())
    } else {
      tree.overwrite(indexPath, commandsIndex.getFullText())
    }

    return tree
  }
}
