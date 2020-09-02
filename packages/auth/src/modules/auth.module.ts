import { DynamicModule, Provider } from '@nestjs/common'

import { AuthModuleAsyncOptions, AuthModuleOptions } from '../interfaces'
import { ApplicationUserContract, UserServiceContract } from '../contracts'
import { AUTH_MODULE_OPTIONS, USER_SERVICE } from '../constants'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class AuthModule {
  // @ts-ignore
  public static abstract forRootAsync(
    asyncOptions: AuthModuleAsyncOptions,
    provideControllers?: boolean,
  ): DynamicModule

  protected static createAsyncOptionsProvider(
    asyncOptions: AuthModuleAsyncOptions,
  ): Provider<AuthModuleOptions> {
    return {
      inject: asyncOptions.inject || [],
      provide: AUTH_MODULE_OPTIONS,
      useFactory: asyncOptions.useFactory,
    }
  }

  protected static getUserServiceProvider(): Provider<
    UserServiceContract<ApplicationUserContract>
  > {
    return {
      inject: [AUTH_MODULE_OPTIONS],
      provide: USER_SERVICE,
      useFactory: (options: AuthModuleOptions) => options.userService,
    }
  }
}
