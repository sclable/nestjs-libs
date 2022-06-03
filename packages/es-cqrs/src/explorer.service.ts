/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Type } from '@nestjs/common'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Module } from '@nestjs/core/injector/module'
import { ModulesContainer } from '@nestjs/core/injector/modules-container'
import { ICommandHandler, IEventHandler } from '@nestjs/cqrs'
import {
  COMMAND_HANDLER_METADATA,
  EVENTS_HANDLER_METADATA,
} from '@nestjs/cqrs/dist/decorators/constants'

export interface CqrsOptions {
  events?: Type<IEventHandler>[]
  commands?: Type<ICommandHandler>[]
}

@Injectable()
export class ExplorerService {
  public constructor(
    @Inject(ModulesContainer)
    private readonly modulesContainer: ModulesContainer,
  ) {}

  public explore(): CqrsOptions {
    const modules = [...this.modulesContainer.values()]
    const commands = this.flatMap<ICommandHandler>(modules, instance =>
      this.filterProvider(instance, COMMAND_HANDLER_METADATA),
    )
    const events = this.flatMap<IEventHandler>(modules, instance =>
      this.filterProvider(instance, EVENTS_HANDLER_METADATA),
    )

    return { commands, events }
  }

  public flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    const items = modules
      .map(module => [...module.providers.values()].map(callback))
      .reduce((all, prvs) => all.concat(prvs), [])

    return items.filter(element => !!element) as Type<T>[]
  }

  public filterProvider(wrapper: InstanceWrapper, metadataKey: string): Type<any> | undefined {
    const { instance } = wrapper
    if (!instance) {
      return undefined
    }

    return this.extractMetadata(instance, metadataKey)
  }

  public extractMetadata(
    instance: Record<string, unknown>,
    metadataKey: string,
  ): Type<any> | undefined {
    if (!instance.constructor) {
      return undefined
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor)

    return metadata ? (instance.constructor as Type<any>) : undefined
  }
}
