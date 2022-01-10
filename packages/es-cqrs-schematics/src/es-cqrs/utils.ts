import { Import, Parameter } from './schema'

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
