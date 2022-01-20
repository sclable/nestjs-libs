import { Injectable } from '@nestjs/common'
import { CommandBus } from '@sclable/nestjs-es-cqrs'
<% for (let imp of imports) { %>
import { <%= imp.imports.join(', ') %> } from '<%= imp.path %>'<% } %>
import { <%= classify(command) %> } from './commands'

@Injectable()
export class <%= classify(service) %>Service {
  public constructor(private readonly commandBus: CommandBus) {}

  public async <%= camelize(command) %>(<%= parameters.map(p => `${p.name}: ${p.type}`).join(', ') %>): Promise<void> {
    return this.commandBus.execute(new <%= classify(command) %>(<%= parameters.map(p => p.name).join(', ') %>))
  }
}
