import { ModuleMetadata, Provider, Type } from '@nestjs/common/interfaces'

export interface AsyncProviderFactory<T> {
  create(): Promise<T> | T
}

export interface AsyncProvider<T> extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[]
  useClass?: Type<AsyncProviderFactory<T>>
  useExisting?: Type<AsyncProviderFactory<T>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory?: (...args: any[]) => Promise<T> | T
}

export function createAsyncProvider<T>(provider: AsyncProvider<T>, token: string): Provider {
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
    useFactory: async (providerFactory: AsyncProviderFactory<T>) =>
      await providerFactory.create(),
  }
}

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
