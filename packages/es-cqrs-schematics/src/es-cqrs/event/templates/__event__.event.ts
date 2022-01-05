import { DefaultEvent, EventForModule } from '@sclable/es-cqrs'
<% for (let imp of imports) { %>
import { <% imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>

<% const needEventDataType = parameters.length > 1 || parameters.length > 0 && parameters.filter(p => !!p.importPath).length === 0 %>
<% if (needEventDataType) { %>
interface EventData {<% for (let param of parameters) { %>
  <%= param.name %>: <%= param.type %>,<% } %>
}
<% } %>
export class <%= eventClass %> extends DefaultEvent
<<% if (needEventDataType) %>EventData<% else %><%= parameters[0] ? parameters[0].type : '{}' %>> {}
