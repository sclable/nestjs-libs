import { Constructible, EventSourcableAggregate, UserAwareAggregate, UserAwareEvent } from '@sclable/es-cqrs'
<% for (let imp of imports) { %>
import { <% for (let i of imp.imports) { %><%= i %>, <% } %>} from '<%= imp.path %>'<% } %>
import {<%= camelize(aggregate) %>Events, <%= command.eventClass %>} from './events'

@EventSourcableAggregate(...<%= camelize(aggregate) %>Events)
export class <%= classify(aggregate) %> extends UserAwareAggregate {
  public <%= command.name %>(<% for (let param of command.parameters) { %><%= param.name %>: <%= param.type %>,<% } %>) {
    this.applyEvent(<%= command.eventClass %>, <%= command.eventData %>)
  }

  public on<%= command.eventClass %>(event: <%= command.eventClass %>) {
    /* no-op */
  }

  private applyEvent<T>(event: Constructible<UserAwareEvent<T>>, data: T): void {
    this.apply(new event(this.id, this.uppedRevision(), this.userId, data))
  }
}
