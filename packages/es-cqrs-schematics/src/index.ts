import { Rule, chain, schematic } from '@angular-devkit/schematics'
import { readJsonSync } from 'fs-extra'

import { format } from './es-cqrs/format'
import { JsonInputSchema } from './json.schema'

export function json(options: JsonInputSchema): Rule {
  // TODO(adam.koleszar): skipFormat handling
  const jsonObject = readJsonSync(options.jsonPath)
  if (Array.isArray(jsonObject)) {
    return chain([...jsonObject.map(obj => schematic(options.rule, obj)), format()])
  }

  return chain([schematic(options.rule, jsonObject), format()])
}
