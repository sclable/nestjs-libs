# Sclable ES-CQRS library

This library provides an event-sourced CQRS implementation for **NestJS**. It is built upon the
[`@nestjs/cqrs`](https://github.com/nestjs/cqrs) package and provides an inmemory implementation
to store and handle the events and snapshots. It also provides an interface for implementing your
own event-store to allow better integration with your application.

## Terminology

### Aggregate

As part of the write model it collects one or more entities.
It is designed to keep a consistent internal state defined by the business logic.
Command handlers will call its methods to change state, and state changes will emit events.

### Command

The only interaction with the system is through a predefined set of commands.
These commands create and modify aggregates.

### Event

Events are the aggregates reactions to commands.

### Event Store

It acts as the single source of truth by storing all the events.

### Repository

A repository manages aggregates.
It can find or create an aggregate by replaying all the events on it from the event store.
It also stores the aggregates by saving their events in the event store and creating
snapshots of the aggregate after every few events.

## Versioning

As the project builds upon [`@nestjs/cqrs`](https://github.com/nestjs/cqrs), the version will follow 
the main *nestjs* versions. So if your application uses v7 please use v7 from this package too.

## Install

```bash
npm install @sclable/nestjs-es-cqrs
```

## Usage

* create aggregates according to your data model (see [Aggregate](src/aggregate.ts))
* create commands and events according to your write model (see [Nestjs/CQRS](https://docs.nestjs.com/v7/recipes/cqrs))
* create your command and event handlers (see [Nestjs/CQRS](https://docs.nestjs.com/v7/recipes/cqrs))
* import the `ESCQRSModule` into your module and register the command and event handlers (see [ESCQRSModule](src/es-cqrs.module.ts))
* hook commands to your REST API or your GraphQL mutations

You can run commands by injecting the `CommandBus` into your component and execute commands on it.

```typescript
someMutation(): Promise<string> {
  return this.commandBus.execute(new SomeCommand())
}
```

## Event Versioning

As events must be kept replayable, some versioning mechanism has to be in place if the schema
of already emitted events has to be changed. The upcasting approach is straightforward to
implement within the es-cqrs library by setting `customOptions.version` in the constructor.

For example if an additional field `upvotes` is needed for the following event
which should be default to `0` we can implement the upcasting like this:

```typescript
interface TodoCreatedEventData {
  msg: string;
  upvotes: number;
}

export class TodoCreatedEvent extends DefaultEvent<TodoCreatedEventData> {

  private static currentVersion: number = 2;

  constructor(
    aggregateId: string,
    aggregateType: string,
    revision: number,
    createdAt: Date,
    userId: string,
    data: TodoCreatedEventData,
    customOptions: CustomEventOptions,
  ) {
    if ((customOptions.version ?? 0) < TodoCreatedEvent.currentVersion) {
      data.upvotes = 0;
    }
    super(aggregateId, aggregateType, revision, createdAt, userId, data, customOptions);
  }
}

```

If the new parameter can be optional, a simple condition in the event-handler will also suffice.

In case of a required new parameter, where no default value can be added, a complete event DB migration is needed.

## Documentation

```bash
npm install -g typedoc
typedoc --mode file --excludeNotExported --out packages/es-cqrs/docs packages/es-cqrs/
```
