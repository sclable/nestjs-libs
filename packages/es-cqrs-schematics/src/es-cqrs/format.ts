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
    tree.actions.forEach(action => {
      const src = tree.read(action.path)
      if (!src) {
        return
      }
      tree.overwrite(
        action.path,
        prettierFormat(src.toString(), prettierOptions ?? defaultPrettierOptions),
      )
    })
  }
}

/**
 * Applies `eslint` fixing to the generated content
 *
 * If project has its own config it will be used, otherwise a default config is used
 * WARNING! `prettier/prettier` rules doesn't seem to apply as it can't defer the correct parser
 */
export function eslint(): Rule {
  return async (tree: Tree) => {
    const eslint = new ESLint({ fix: true, extensions: ['.ts'] })
    tree.actions.forEach(async action => {
      const src = tree.read(action.path)
      if (!src) {
        return
      }
      const lintResults = await eslint.lintText(src.toString())
      tree.overwrite(action.path, lintResults[0].output ?? src)
    })
  }
}

export function format(): Rule {
  return chain([prettier, eslint])
}
