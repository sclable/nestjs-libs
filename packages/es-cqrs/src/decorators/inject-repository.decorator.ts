import { Inject } from '@nestjs/common'

import { Aggregate, AggregateConstructor } from '../aggregate'
import { getRepositoryToken } from '../repository'

/**
 * Aggregate repository injector for command handlers
 */
export const InjectRepository = <T extends Aggregate>(
  aggregate: AggregateConstructor<T>,
): ReturnType<typeof Inject> => Inject(getRepositoryToken(aggregate))
