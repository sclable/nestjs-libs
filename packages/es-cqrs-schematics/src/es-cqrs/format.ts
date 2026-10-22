import { Rule, Tree, chain } from '@angular-devkit/schematics'
import { ESLint } from 'eslint'
import { Options, format as prettierFormat, resolveConfig } from 'prettier'
import { FormatCodeSettings, SemicolonPreference } from 'typescript'

export const formatCodeSettings: FormatCodeSettings = {
  indentSize: 2,
  semicolons: SemicolonPreference.Remove,
}

const defaultPrettierOptions: Options = {
  arrowParens: 'avoid',
  parser: 'typescript',
  printWidth: 140,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
}

/**
 * Applies `prettier` formatting to the generated content
 *
 * If project has its own config it will be used, otherwise a default config is used
 */
export function prettier(): Rule {
  return async (tree: Tree) => {
    const prettierOptions = await resolveConfig(process.cwd())
    for (const action of tree.actions) {
      const src = tree.read(action.path)
      if (!src) {
        continue
      }
      const formatted = await prettierFormat(
        src.toString(),
        prettierOptions ?? defaultPrettierOptions,
      )
      tree.overwrite(action.path, formatted)
    }
  }
}

/**
 * Applies `eslint` fixing to the generated content
 *
 * If project has its own config it will be used, otherwise a default config is used
 */
export function eslint(): Rule {
  return async (tree: Tree) => {
    const eslint = new ESLint({ fix: true, extensions: ['.ts'] })
    for (const action of tree.actions) {
      const src = tree.read(action.path)
      if (!src) {
        continue
      }
      const lintResults = await eslint.lintText(src.toString(), { filePath: action.path })
      tree.overwrite(action.path, lintResults[0]?.output ?? src)
    }
  }
}

export function format(): Rule {
  return chain([prettier, eslint])
}
