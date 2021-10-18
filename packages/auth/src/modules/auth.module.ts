import { Provider } from '@nestjs/common'

import { AUTH_MODULE_OPTIONS, USER_SERVICE } from '../constants'
import { ApplicationUserContract, UserServiceContract } from '../contracts'
import { AuthModuleAsyncOptions, AuthModuleOptions } from '../interfaces'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class AuthModule {
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
