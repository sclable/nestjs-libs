<% for (let imp of imports) { %>import { <%= imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>

export interface <%= classify(command) %>Dto {<% for (let param of parameters) { %>
  <%= param.name %>: <%= param.type %><% } %>
}
