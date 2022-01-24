import { Module } from '@nestjs/common'
import { ESCQRSModule } from '@sclable/nestjs-es-cqrs'

import { <%= classify(aggregate) %> } from './<%= dasherize(aggregate) %>.aggregate'
import { <%= classify(aggregate) %>Service } from './<%= dasherize(aggregate) %>.service'
import { commandHandlers } from './command-handlers'
import { eventHandlers } from './event-handlers'

@Module({
  imports: [ESCQRSModule.forFeature([<%= classify(aggregate) %>])],
  providers: [...commandHandlers, ...eventHandlers, <%= classify(aggregate) %>Service],
  exports: [<%= classify(aggregate) %>Service],
})
export class <%= classify(aggregate) %>Module {}
