# Nestjs Async Provider

Helper interface and function to create providers asynchronously for dynamic modules.

## Install
```bash
npm i @sclable/nestjs-async-provider
```

## Usage
```typescript
import { Module, Provider } from '@nestjs/common'
import { AsyncProvider, createAsyncProviders } from '@sclable/nestjs-async-provider'

@Module({})
export class SomeModule {
  public static forRoot(options: SomeModuleOptions): DynamicModule {
    const optionsProvider: Provider<SomeModuleOptions> = {
      provide: SOME_MODULE_OPTIONS,
      useValue: options,
    }

    return {
      module: SomeModule,
      imports: [...],
      providers: [..., optionsProvider],
      exports: [..., optionsProvider],
    }
  }

  public static forRoorAsync(options: AsyncProvider<SomeModuleOptions>): DynamicModule {
    const asyncProviders = createAsyncProviders(asyncOptions, SOME_MODULE_OPTIONS)

    return {
      module: SomeModule,
      providers: [..., ...asyncProviders],
      exports: [..., ...asyncProviders],
    }
  }
}
```

## API documentation
(Github Wiki)[https://github.com/sclable/nestjs-libs/wiki/async-provider]
