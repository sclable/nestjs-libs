import { Abstract, ModuleMetadata, Provider, Type } from '@nestjs/common/interfaces'

/** For defineing a provider with `useClass` or `useExisting` the provider must implement this interface */
export interface AsyncProviderFactory<T> {
  create(): T
}

/** ASync provider interface */
export interface AsyncProvider<T> extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  inject?: (string | symbol | Function | Type<any> | Abstract<any>)[]
  useClass?: Type<AsyncProviderFactory<T>>
  useExisting?: Type<AsyncProviderFactory<T>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory?: (...args: any[]) => T
}

function createAsyncProvider<T>(provider: AsyncProvider<T>, token: string): Provider<T> {
  if (provider.useFactory) {
    return {
      inject: provider.inject || [],
      provide: token,
      useFactory: provider.useFactory,
    }
  }

  let toInject
  if (provider.useClass === undefined) {
    if (provider.useExisting === undefined) {
      throw new Error(
        'at least one of the two provider useClass and useExisting must not be undefined',
      )
    } else {
      toInject = provider.useExisting
    }
  } else {
    toInject = provider.useClass
  }

  return {
    inject: [toInject],
    provide: token,
    useFactory: (providerFactory: AsyncProviderFactory<T>) => providerFactory.create(),
  }
}

/**
  Creates an async provider

  It returns an array of providers because for the `useClass` method an additional provider need to be created

  @param provider an async provider
  @param token token for the provider (use this token with the `@Inject(<token>)` decorator)
  @typeparam T type of the object provided by this provider
*/
export function createAsyncProviders<T>(
  provider: AsyncProvider<T>,
  token: string,
): Provider[] {
  if (provider.useExisting || provider.useFactory) {
    return [createAsyncProvider(provider, token)]
  } else if (provider.useClass) {
    return [
      createAsyncProvider(provider, token),
      {
        provide: provider.useClass,
        useClass: provider.useClass,
      },
    ]
  } else {
    return []
  }
}
