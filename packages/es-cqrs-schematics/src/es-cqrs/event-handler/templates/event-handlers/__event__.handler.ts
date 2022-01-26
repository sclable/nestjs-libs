import { EventHandler, IEventHandler } from '@sclable/nestjs-es-cqrs'

import { <%= classify(event) %> } from '../events'

@EventHandler(<%= classify(event) %>)
export class <%= classify(event) %>Handler implements IEventHandler<<%= classify(event) %>> {
  public async handle(_event: <%= classify(event) %>) {
    /* no-op */
  }
}
