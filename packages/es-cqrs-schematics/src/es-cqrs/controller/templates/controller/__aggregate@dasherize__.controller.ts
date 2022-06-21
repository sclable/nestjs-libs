import { Body, Controller, <%= httpMethod %>, Param } from '@nestjs/common'
import { ApplicationUserContract, RequestUser } from '@sclable/nestjs-auth'<% if (needsDto) { %>
import { <%= classify(command) %>Dto } from './dto'<% } %>
import { <%= classify(aggregate) %>Service } from './<%= dasherize(aggregate) %>.service'

@Controller('<%= dasherize(aggregate) %>')
export class <%= classify(aggregate) %>Controller {
  public constructor(private readonly <%= camelize(aggregate) %>Service: <%= classify(aggregate) %>Service) {}

  @<%= httpMethod %>(<% if (!isCreating) { %>'/:id'<% } %>)
  public async <%= camelize(command) %>(<% if (!isCreating) { %>
    @Param('id') id: string,<% } %><% if (needsDto) { %>
    @Body() dto: <%= classify(command) %>Dto,<% } %>
    @RequestUser() user: ApplicationUserContract,
  ): Promise<<%= isCreating ? 'string' : 'void' %>> {
    return this.<%= camelize(aggregate) %>Service.<%= camelize(command) %>(<% if (!isCreating) { %>id, <% } %><%= parameters.map(p => 'dto.' + p.name).join(', ') %><%= parameters.length > 0 ? ', ': '' %>user.id)
  }
}
