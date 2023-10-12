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
import { formatCodeSettings } from '../format'
import { EsCqrsSchema } from '../schema'
import { getImports, mergeWithArrayString } from '../utils'
import { EventSchema } from './event.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([standalone(transform(options))])
}

export function standalone(options: EventSchema): Rule {
  return chain([mergeWith(generate(options)), updateIndex(options)])
}

function transform(options: EsCqrsSchema): EventSchema {
  const parameters = options.parameters || []

  return {
    event: `${strings.dasherize(options.subject)}-${pastParticiple(options.verb)}`,
    aggregate: strings.classify(options.moduleName),
    imports: getImports(parameters),
    parameters,
    needsEventData:
      parameters.length > 1 || (parameters.length !== 0 && !parameters[0].isExistingObject),
  }
}

function generate(options: EventSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path, strings.dasherize(options.aggregate))),
  ])
}

function updateIndex(options: EventSchema): Rule {
  return (tree: Tree) => {
    const indexPath = join(
      'src' as Path,
      strings.dasherize(options.aggregate),
      'events',
      'index.ts',
    )
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const eventsIndex = project.createSourceFile(
      'events.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )
    const eventClassName = strings.classify(options.event)

    const moduleSpecifier = `./${options.event}.event`
    const namedImport = eventsIndex.getImportDeclaration(moduleSpecifier)
    if (!namedImport) {
      eventsIndex.addImportDeclaration({
        moduleSpecifier,
        namedImports: [eventClassName],
      })
    }

    const moduleEvents = `${options.aggregate}Events`
    const exportAsArray = eventsIndex.getVariableStatement(moduleEvents)
    if (!exportAsArray) {
      eventsIndex.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: moduleEvents, initializer: `[${eventClassName}]` }],
        isExported: true,
      })
    } else {
      const array = exportAsArray.getDeclarations()[0].getInitializer()
      if (array) {
        exportAsArray
          .getDeclarations()[0]
          .setInitializer(mergeWithArrayString(array.getText(), eventClassName))
      }
    }
    const namedExport = eventsIndex.getExportDeclaration(decl => !decl.hasModuleSpecifier())
    if (!namedExport) {
      eventsIndex.addExportDeclaration({
        namedExports: [eventClassName],
      })
    } else {
      if (
        !namedExport
          .getNamedExports()
          .map(ne => ne.getName())
          .includes(eventClassName)
      ) {
        namedExport.addNamedExport(eventClassName)
      }
    }
    eventsIndex.formatText(formatCodeSettings)
    if (!tree.exists(indexPath)) {
      tree.create(indexPath, eventsIndex.getFullText())
    } else {
      tree.overwrite(indexPath, eventsIndex.getFullText())
    }

    return tree
  }
}
