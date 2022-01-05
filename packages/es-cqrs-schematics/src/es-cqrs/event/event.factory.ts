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
import { appendToArray } from '../format'
import { EsCqrsSchema, Import } from '../schema'
import { EventSchema } from './event.schema'

export function main(options: EsCqrsSchema): Rule {
  return chain([
    standalone(transform(options)),
    // format(),
  ])
}

export function standalone(options: EventSchema): Rule {
  return chain([mergeWith(generate(options)), updateIndex(options)])
}

function transform(options: EsCqrsSchema): EventSchema {
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
    event: `${strings.dasherize(options.subject)}-${pastParticiple(options.verb)}`,
    eventClass: `${strings.classify(options.subject)}${strings.classify(
      pastParticiple(options.verb),
    )}`,
    imports,
    moduleName: options.moduleName || '',
    parameters,
  }
}

function generate(options: EventSchema): Source {
  return apply(url('./templates'), [
    template({
      ...strings,
      ...options,
    }),
    move(join('src' as Path, strings.dasherize(options.moduleName), 'events')),
  ])
}

function updateIndex(options: EventSchema): Rule {
  return (tree: Tree) => {
    const indexPath = join('src' as Path, options.moduleName, 'events', 'index.ts')
    const indexSrc = tree.read(indexPath)
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
    const eventsIndex = project.createSourceFile(
      'events.index.ts',
      indexSrc ? indexSrc.toString() : '',
    )

    const moduleSpecifier = `./${options.event}.event`
    const namedImport = eventsIndex.getImportDeclaration(moduleSpecifier)
    if (!namedImport) {
      eventsIndex.addImportDeclaration({
        moduleSpecifier,
        namedImports: [options.eventClass],
      })
    }

    const moduleEvents = `${options.moduleName}Events`
    const exportAsArray = eventsIndex.getVariableStatement(moduleEvents)
    if (!exportAsArray) {
      eventsIndex.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: moduleEvents, initializer: `[${options.eventClass}]` }],
        isExported: true,
      })
    } else {
      const array = exportAsArray.getDeclarations()[0].getInitializer()
      if (array) {
        exportAsArray
          .getDeclarations()[0]
          .setInitializer(appendToArray(array.getText(), options.eventClass))
      }
    }
    const namedExport = eventsIndex.getExportDeclaration(decl => !decl.hasModuleSpecifier())
    if (!namedExport) {
      eventsIndex.addExportDeclaration({
        namedExports: [options.eventClass],
      })
    } else {
      if (
        !namedExport
          .getNamedExports()
          .map(ne => ne.getName())
          .includes(options.eventClass)
      ) {
        namedExport.addNamedExport(options.eventClass)
      }
    }

    if (!tree.exists(indexPath)) {
      tree.create(indexPath, eventsIndex.getFullText())
    } else {
      tree.overwrite(indexPath, eventsIndex.getFullText())
    }

    return tree
  }
}
