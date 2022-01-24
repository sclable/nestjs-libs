import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { <%= classify(command) %> } from '../commands'
import { <%= classify(aggregate) %> } from '../<%= dasherize(aggregate) %>.aggregate'

@CommandHandler(<%= classify(command) %>)
export class <%= classify(command) %>Handler implements ICommandHandler<<%= classify(command) %>> {
  constructor(@InjectRepository(<%= classify(aggregate) %>) private readonly <%= camelize(aggregate) %>Repository: Repository<<%= classify(aggregate) %>>) {}

  public async execute(cmd: <%= classify(command) %>): Promise<<%= isCreating ? 'string' : 'void' %>> {<% if (isCreating) { %>
    const <%= camelize(aggregate) %> = <%= classify(aggregate) %>.<%= camelize(command) %>(<%= parameters.map(p => 'cmd.' + p.name).join(', ') %>)<% } else { %>
    const <%= camelize(aggregate) %> = await this.<%= camelize(aggregate) %>Repository.find(cmd.id, cmd.userId)
    <%= camelize(aggregate) %>.<%= camelize(command) %>(<%= parameters.map(p => 'cmd.' + p.name).join(', ') %>)<% } %>
    await this.<%= camelize(aggregate) %>Repository.persist(<%= camelize(aggregate) %>)<% if (isCreating) { %>
    return <%= camelize(aggregate) %>.id<% } %>
  }
}
