import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics'
import { TslintFixTask } from '@angular-devkit/schematics/tasks'
import { Options, format as prettierFormat } from 'prettier'

const prettierOptions: Options = {
  arrowParens: 'avoid',
  parser: 'typescript',
  printWidth: 140,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
}

export function prettier(): Rule {
  return (tree: Tree) => {
    tree.actions.forEach(action => {
      const src = tree.read(action.path)
      if (!src) {
        return
      }
      tree.overwrite(action.path, prettierFormat(src.toString(), prettierOptions))
    })
  }
}

export function tslint(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(
      new TslintFixTask({
        files: tree.actions.map(action => action.path.substr(1)),
        ignoreErrors: true,
      }),
    )
  }
}

export function format(): Rule {
  return chain([prettier, tslint])
}

export function appendToArray(array: string, item: string): string {
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
