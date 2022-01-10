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

import { pastParticiple } from '../../past-participle'
import { appendToArray, formatCodeSettings } from '../format'
import { EsCqrsSchema } from '../schema'
import { EventHandlerSchema } from './event-handler.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([
    standalone(transform(options)),
    // format(),
  ])
}

export function standalone(options: EventHandlerSchema): Rule {
  return chain([mergeWith(generate(options)), updateIndex(options)])
}

function transform(options: EsCqrsSchema): EventHandlerSchema {
  return {
    event: `${strings.dasherize(options.subject)}-${pastParticiple(options.verb)}`,
    eventClass: `${strings.classify(options.subject)}${strings.classify(
      pastParticiple(options.verb),
    )}`,
    moduleName: options.moduleName || '',
  }
}

function generate(options: EventHandlerSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path, strings.dasherize(options.moduleName), 'event-handlers')),
  ])
}

function updateIndex(options: EventHandlerSchema): Rule {
  return (tree: Tree) => {
    const indexPath = join(
      'src' as Path,
      strings.dasherize(options.moduleName),
      'event-handlers',
      'index.ts',
    )
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const eventHandlersIndex = project.createSourceFile(
      'event-handlers.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )

    const moduleSpecifier = `./${options.event}.handler`
    const eventHandlerClass = `${options.eventClass}Handler`
    const namedImport = eventHandlersIndex.getImportDeclaration(moduleSpecifier)
    if (!namedImport) {
      eventHandlersIndex.addImportDeclaration({
        moduleSpecifier,
        namedImports: [eventHandlerClass],
      })
    }
    const exportAsArray = eventHandlersIndex.getVariableStatement('eventHandlers')
    if (!exportAsArray) {
      eventHandlersIndex.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: 'eventHandlers', initializer: `[${eventHandlerClass}]` }],
        isExported: true,
      })
    } else {
      const array = exportAsArray.getDeclarations()[0].getInitializer()
      if (array) {
        exportAsArray
          .getDeclarations()[0]
          .setInitializer(appendToArray(array.getText(), eventHandlerClass))
      }
    }
    eventHandlersIndex.formatText(formatCodeSettings)
    if (!tree.exists(indexPath)) {
      tree.create(indexPath, eventHandlersIndex.getFullText())
    } else {
      tree.overwrite(indexPath, eventHandlersIndex.getFullText())
    }

    return tree
  }
}
