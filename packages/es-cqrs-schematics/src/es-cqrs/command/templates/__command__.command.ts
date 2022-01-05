import { Command } from '@sclable/nestjs-es-cqrs'
<% for (let imp of imports) { %>
import { <% imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>

export class <%= commandClass %> implements Command {
  constructor(
    public readonly id: string,
    public readonly userId: string,<% for (let param of parameters) { %>
    public readonly <%= param.name %>: <%= param.type %>,<% } %>
  ) {}
}
