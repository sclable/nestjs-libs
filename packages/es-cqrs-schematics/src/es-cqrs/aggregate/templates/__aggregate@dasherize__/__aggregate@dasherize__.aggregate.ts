import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
<% for (let imp of imports) { %>
import { <%= imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>
import { <%= camelize(aggregate) %>Events, <%= command.eventClass %> } from './events'

@EventSourcableAggregate(...<%= camelize(aggregate) %>Events)
export class <%= classify(aggregate) %> extends Aggregate {
  public <%= command.name %>(<%= command.parameters.map(p => `${p.name}: ${p.type}`).join(', ') %>): void {
    this.applyEvent(<%= command.eventClass %>, <%= command.eventData %>)
  }

  public on<%= command.eventClass %>(_event: <%= command.eventClass %>): void {
    /* no-op */
  }
}
