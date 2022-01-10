import { resolve } from 'path'

import { Path, join, strings } from '@angular-devkit/core'
import { Rule, Tree, chain } from '@angular-devkit/schematics'
import { Project, Scope, ts } from 'ts-morph'

export function main(): Rule {
  return chain([updateCommandHandlers(), updateModules()])
}

function updateCommandHandlers(): Rule {
  return (tree: Tree) => {
    const srcDir = tree.getDir('src')
    const moduleNames = srcDir.subdirs.filter(dir =>
      tree.exists(join('src' as Path, dir, 'command-handlers', 'index.ts')),
    )
    moduleNames.forEach(moduleName => {
      const cmdhDir = tree.getDir(join('src' as Path, moduleName, 'command-handlers'))
      const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
      cmdhDir.subfiles.forEach(file => {
        if (!file.match(/.*\.handler\.ts/)) {
          return
        }
        const cmdhFileEntry = cmdhDir.file(file)
        if (!cmdhFileEntry) {
          return
        }

        const cmdhFile = project.getSourceFileOrThrow(cmdhFileEntry.path.substr(1))
        const cmdhClass = cmdhFile.getClasses()[0]
        const handleFn = cmdhClass.getInstanceMethodOrThrow('execute')
        const commandParam = handleFn.getParameterOrThrow('cmd')
        const commandParamName = commandParam.getName()
        const commandParamType = commandParam.getType().getSymbolOrThrow().getName()
        const tryStatement = handleFn.getFirstDescendantByKind(ts.SyntaxKind.TryStatement)
        if (!tryStatement) {
          return
        }

        const tryBlock = tryStatement.getFirstChildByKindOrThrow(ts.SyntaxKind.Block)
        const tryText = tryBlock
          .getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList)
          .getFullText()
        const fnText = tryText
          .replace(/return/g, '')
          .replace(/resolve\((.*)\)/g, 'return $1')
          .replace(/return new Error/g, 'throw new Error')

        handleFn.remove()

        cmdhClass.addMethod({
          name: 'execute',
          scope: Scope.Public,
          isAsync: true,
          parameters: [
            {
              name: commandParamName,
              type: commandParamType,
            },
          ],
          statements: fnText,
        })

        tree.overwrite(join(cmdhDir.path, file), cmdhFile.getFullText())
      })
    })

    return tree
  }
}

function updateModules(): Rule {
  return (tree: Tree) => {
    const srcDir = tree.getDir('src')
    const moduleNames = srcDir.subdirs.filter(dir =>
      tree.exists(join('src' as Path, dir, 'command-handlers', 'index.ts')),
    )
    moduleNames.forEach(moduleName => {
      const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
      const moduleFile = project.getSourceFileOrThrow(
        resolve('src', moduleName, `${moduleName}.module.ts`),
      )
      const moduleClass = moduleFile.getClassOrThrow(`${strings.classify(moduleName)}Module`)
      const constructor = moduleClass.getConstructors()[0]
      const onInitMethod = moduleClass.getInstanceMethodOrThrow('onModuleInit')
      const onInitMethodText = onInitMethod.getBodyText()
      const paramsToRemove = ['CommandBus', 'EventBus', 'RateLimitedEventBus']
      let text = onInitMethodText || ''
      constructor.getParameters().forEach(param => {
        if (paramsToRemove.includes(param.getType().getSymbolOrThrow().getName())) {
          const removeLine = new RegExp(`^.*${param.getName()}.*$`, 'mg')
          text = text.replace(removeLine, '')
          param.remove()
        }
      })
      constructor.getParameters().forEach(param => {
        const name = param.getName()
        if (
          param.getType().getSymbolOrThrow().getName() === 'ModuleRef' &&
          name &&
          !text.includes(name)
        ) {
          param.remove()
          const coreImport = moduleFile.getImportDeclarationOrThrow(
            im => im.getModuleSpecifierValue() === '@nestjs/core',
          )
          coreImport.getNamedImports().forEach(im => {
            if (im.getName() === 'ModuleRef') {
              im.remove()
            }
          })
          if (coreImport.getNamedImports().length === 0) {
            coreImport.remove()
          }
        }
      })
      const escqrsImport = moduleFile.getImportDeclarationOrThrow(
        im => im.getModuleSpecifierValue() === '@sclable/nestjs-es-cqrs',
      )
      escqrsImport.getNamedImports().forEach(im => {
        if (paramsToRemove.includes(im.getName())) {
          im.remove()
        }
      })
      onInitMethod.setBodyText(text)

      tree.overwrite(
        join('src' as Path, moduleName, `${moduleName}.module.ts`),
        moduleFile.getFullText(),
      )
    })

    return tree
  }
}
