import { Rule, chain, schematic } from '@angular-devkit/schematics'
import { readJsonSync } from 'fs-extra'

import { format } from './es-cqrs/format'
import { JsonInputSchema } from './json.schema'

export function json(options: JsonInputSchema): Rule {
  const jsonObject = readJsonSync(options.jsonPath)
  const rules: Rule[] = []
  if (Array.isArray(jsonObject)) {
    rules.push(...jsonObject.map(obj => schematic(options.rule, obj)))
  } else {
    rules.push(schematic(options.rule, jsonObject))
  }
  if (!options.skipFormat) {
    rules.push(format())
  }

  return chain(rules)
}
