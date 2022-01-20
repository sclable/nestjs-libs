import { Rule, chain, schematic } from '@angular-devkit/schematics'

import { EsCqrsSchema } from './schema'

export function all(options: EsCqrsSchema): Rule {
  return chain([
    schematic('command', options),
    schematic('command-handler', options),
    schematic('event', options),
    schematic('event-handler', options),
    schematic('aggregate', options),
    schematic('module', options),
    schematic('service', options),
  ])
}

export function allWithRestController(options: EsCqrsSchema): Rule {
  return chain([all(options), schematic('controller', options)])
}
