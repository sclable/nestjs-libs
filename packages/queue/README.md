# NestJS Queue Library

## Features
At this time the library has the following adapters implemented:
* dummy (does nothing)
* rabbitmq (RabbitMQ)
* azure-service-bus (Azure Service Bus)

## Requirements
`@nestjs/config` package needs to be installed in the project.
See: https://docs.nestjs.com/techniques/configuration

## Installation
```bash
$ npm install --save @sclable/nestjs-queue
```

## Setting up

### Create configuration file
In the application's configuration folder there must be a file which configures the storage library. You can simply copy `src/examples/queue.config.ts` and remove the parts you don't need.
```javascript
// config/queue.ts

import { registerAs } from '@nestjs/config'
import { QueueModuleOptions, QueueType } from '@sclable/nestjs-queue'

export default registerAs(
  'queue',
  (): QueueModuleOptions => ({
    type: (process.env.QUEUE_TYPE || QueueType.DUMMY) as QueueType,
    config: {
      [QueueType.DUMMY]: {
        enabled: true,
      },
      [QueueType.RABBITMQ]: {
        hostname: process.env.QUEUE_RABBITMQ_HOSTNAME || 'localhost',
        port: +(process.env.QUEUE_RABBITMQ_PORT || 5672),
        username: process.env.QUEUE_RABBITMQ_USERNAME || 'guest',
        password: process.env.QUEUE_RABBITMQ_PASSWORD || 'guest',
      },
      [QueueType.AZURE_SERVICE_BUS]: {
        connectionString:
          process.env.QUEUE_AZURE_SERVICE_BUS_CONNECTION_STRING ||
          'define QUEUE_AZURE_SERVICE_BUS_CONNECTION_STRING',
      },
    },
  }),
)
```

### Add configuration to your .env file
You can remove the ones you don't need.
```dotenv
## QUEUE_TYPE=[dummy|rabbitmq|azure-service-bus]
QUEUE_TYPE=dummy
```

### Import QueueModule to your application
```javascript
// app/src/app.module.ts

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QueueModule, QueueModuleOptions, QueueType } from '@sclable/nestjs-queue'

@Module({
  imports: [
    // ...
    QueueModule.forRootAsync({
      useFactory: (config: ConfigService) =>
        config.get<QueueModuleOptions>('queue', {
          type: QueueType.DUMMY,
          config: {},
        }),
      inject: [ConfigService],
    }),
    // ...
  ],
})
export class AppModule {}
```

## Adapters
TBD

### Dummy Adapter
TBD

You need to add the following enviroment config to your .env file:
```dotenv
## QUEUE_TYPE=[dummy|rabbitmq|azure-service-bus]
QUEUE_TYPE=dummy
```

### RabbitMQ Adapter
TBD

You need to add the following enviroment config to your .env file:
```dotenv
## QUEUE_TYPE=[dummy|rabbitmq|azure-service-bus]
QUEUE_TYPE=rabbitmq

QUEUE_RABBITMQ_HOSTNAME=localhost
QUEUE_RABBITMQ_PORT=5672
QUEUE_RABBITMQ_USERNAME=guest
QUEUE_RABBITMQ_PASSWORD=guest
```
### Azure Adapter
TBD

You need to add the following enviroment config to your .env file:
```dotenv
## QUEUE_TYPE=[dummy|rabbitmq|azure-service-bus]
QUEUE_TYPE=azure-service-bus

QUEUE_AZURE_SERVICE_BUS_CONNECTION_STRING=
```

## Usage
QueueService. Import, inject and use.
```javascript
import { QUEUE_SERVICE, QueueMessage, QueueServiceContract } from '@sclable/nestjs-queue'

@Injectable()
export class SomeService {
  public constructor(
    @Inject(QUEUE_SERVICE)
    private readonly queueService: QueueServiceContract,
  ) {}

  public sendMessage(queueName: string, payload: PayloadType): Promise<void> {
    return this.queueService.sendMessage<PayloadType>(queueName, payload)
  }

  public listen(queueName: string): Promise<void> {
    return this.queueService.addConsumer<PayloadType>(queueName,
      message: QueueMessage<PayloadType> => {
        console.info(message)
        message.ack()
      }
    )
  }
}
```

## Functions
`QueueServiceContract` defines what one can to with the service.
```javascript
export interface QueueServiceContract {
  sendMessage<PayloadType>(queueName: string, payload: PayloadType): Promise<void>
  addConsumer<PayloadType>(
    queueName: string,
    consumer: (msg: QueueMessage<PayloadType>) => Promise<void> | void,
  ): Promise<void>
}
```