import { EventHandler, IEventHandler } from '@sclable/es-cqrs'
import { <%= eventClass %> } from '../events'

@EventHandler(<%= eventClass %>)
export class <%= eventClass %>Handler implements IEventHandler<<%= eventClass %>> {
  public async handle(event: <%= eventClass %>) {
    /* no-op */
  }
}
