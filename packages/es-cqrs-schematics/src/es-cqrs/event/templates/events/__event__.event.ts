import { DefaultEvent } from '@sclable/nestjs-es-cqrs'
<% for (let imp of imports) { %>
import { <%= imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>
<% if (needsEventData) { %>
interface EventData {<% for (let param of parameters) { %>
  <%= param.name %>: <%= param.type %><% } %>
}
<% } %>
export class <%= classify(event) %> extends DefaultEvent<<% if (needsEventData) %>EventData<% else %><%= parameters[0] ? parameters[0].type : '{}' %>> {}
