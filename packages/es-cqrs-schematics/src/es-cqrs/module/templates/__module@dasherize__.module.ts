import { Module } from '@nestjs/common'
import { ESCQRSModule } from '@sclable/nestjs-es-cqrs'

import { <%= classify(module) %> } from './<%= dasherize(module) %>.aggregate'
import { <%= classify(module) %>Service } from './<%= dasherize(module) %>.service'
import { commandHandlers } from './command-handlers'
import { eventHandlers } from './event-handlers'

@Module({
  imports: [ESCQRSModule.forFeature([<%= classify(module) %>])],
  providers: [...commandHandlers, ...eventHandlers, <%= classify(module) %>Service],
  exports: [<%= classify(module) %>Service],
})
export class <%= classify(module) %>Module {}
