import { SourceFile } from 'ts-morph'

import { Import, Parameter } from './schema'

export interface KeyValuesDefinition {
  [path: string]: string[]
}

const CREATION_VERBS = ['add', 'insert', 'create']

export function isCreating(verb: string): boolean {
  return CREATION_VERBS.includes(verb.toLowerCase())
}

export function updateImports(sourceFile: SourceFile, definition: KeyValuesDefinition): void {
  const importDeclarations = sourceFile.getImportDeclarations()
  Object.keys(definition).forEach(importPath => {
    const importDecl = importDeclarations.find(
      impDecl => impDecl.getModuleSpecifierValue() === importPath,
    )
    if (importDecl) {
      definition[importPath].forEach(namedImport => {
        if (
          !importDecl
            .getNamedImports()
            .map(ni => ni.getName())
            .includes(namedImport)
        ) {
          importDecl.addNamedImport(namedImport)
        }
      })
    } else {
      sourceFile.addImportDeclaration({
        moduleSpecifier: importPath,
        namedImports: [...definition[importPath]],
      })
    }
  })
}

export function getImports(parameters: Parameter[]): Import[] {
  const importMap: Map<string, Set<string>> = new Map()
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

  return imports
}

export function appendToArrayString(array: string, item: string): string {
  const list = array
    .replace('[', '')
    .replace(']', '')
    .split(',')
    .map(str => str.trim())
    .filter(str => str.length > 0)
  if (!list.includes(item)) {
    list.push(item)
  }

  return `[\n${list.join(',\n')}\n]`
}
