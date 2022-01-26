import { Aggregate, EventSourcableAggregate } from '@sclable/nestjs-es-cqrs'
import { v4 as uuidv4 } from 'uuid'
<% for (let imp of imports) { %>
import { <%= imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>
import { <%= camelize(aggregate) %>Events, <%= classify(event) %> } from './events'

@EventSourcableAggregate(...<%= camelize(aggregate) %>Events)
export class <%= classify(aggregate) %> extends Aggregate {<% if (hasMembers) { parameters.filter(param => param.isMember).forEach(param => { %>
  private <%= param.name %>: <%= param.type %><% }) } %>
<% if (isCreating) { %>
  public static <%= camelize(command) %>(userId: string, <%= parameters.map(p => `${p.name}: ${p.type}`).join(', ') %><%= parameters.length > 0 ? ', ' : '' %>id: string = uuidv4()): <%= classify(aggregate) %> {
    const self = new <%= classify(aggregate) %>(id, userId)
    this.applyEvent(<%= classify(event) %>, <% if (needsEventData) { %>{ <%= parameters.map(p => p.name).join(', ') %> }<% } else { %><%= parameters[0].name %><% } %>)
    return self
  }<% } else { %>
  public <%= camelize(command) %>(<%= parameters.map(p => `${p.name}: ${p.type}`).join(', ') %>): void {
    this.applyEvent(<%= classify(event) %>, <% if (needsEventData) { %>{ <%= parameters.map(p => p.name).join(', ') %> }<% } else { %><%= parameters[0].name %><% } %>)
  }<% } %>

  public on<%= classify(event) %>(<% if (!hasMembers) { %>_<% } %>event: <%= classify(event) %>): void {<% if (hasMembers) { parameters.filter(param => param.isMember).forEach(param => { if (param.isObject) {%>
    this.<%= camelize(param.name) %> = event.data<% } else { %>
    this.<%= camelize(param.name) %> = event.data.<%= camelize(param.name) %><% } }) } else { %>
    /* no-op */<% } %>
  }
}
