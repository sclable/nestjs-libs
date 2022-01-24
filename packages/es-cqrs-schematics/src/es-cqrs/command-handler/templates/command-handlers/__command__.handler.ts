import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/nestjs-es-cqrs'

import { <%= commandClass %> } from '../commands'
import { <%= aggregateClass %> } from '../<%= dasherize(moduleName) %>.aggregate'

@CommandHandler(<%= commandClass %>)
export class <%= commandClass %>Handler implements ICommandHandler<<%= commandClass %>> {
  constructor(@InjectRepository(<%= aggregateClass %>) private readonly <%= camelize(moduleName) %>Repository: Repository<<%= aggregateClass %>>) {}

  public async execute(cmd: <%= commandClass %>): Promise<void> {
    const <%= aggregate %> = await this.<%= aggregate %>Repository.find(cmd.id, cmd.userId)
    <%= aggregate %>.<%= camelize(command) %>(<%= parameters.map(p => 'cmd.' + p.name).join(', ') %>)
    await this.<%= aggregate %>Repository.persist(<%= aggregate %>)
  }
}
