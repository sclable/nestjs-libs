import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AsyncProvider, createAsyncProviders } from '@sclable/nestjs-async-provider'

import { AUTH_MODULE_OPTIONS } from '../constants'
import { LocalAuthController } from '../controllers'
import { LocalGuard } from '../guards'
import { AuthModuleOptions } from '../interfaces'
import { LocalAuthService } from '../services'
import { JwtStrategy, LocalStrategy, MockStrategy } from '../strategies'

import { AuthModule } from './auth.module'

@Global()
@Module({})
export class LocalAuthModule extends AuthModule {
  public static forRootAsync(
    asyncOptions: AsyncProvider<AuthModuleOptions>,
    provideControllers: boolean = true,
  ): DynamicModule {
    const controllers = provideControllers ? [LocalAuthController] : []
    const asyncProviders = createAsyncProviders(asyncOptions, AUTH_MODULE_OPTIONS)

    return {
      module: LocalAuthModule,
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          inject: [AUTH_MODULE_OPTIONS],
          useFactory: (options: AuthModuleOptions) => ({
            secret: options.config.jwtSecret,
            signOptions: { expiresIn: options.config.jwtExpiresIn },
          }),
        }),
        ...(asyncOptions.imports || []),
      ],
      providers: [
        Logger,
        LocalAuthService,
        LocalGuard,
        LocalStrategy,
        JwtStrategy,
        MockStrategy,
        this.getUserServiceProvider(),
        ...asyncProviders,
      ],
      exports: [...asyncProviders],
      controllers,
    }
  }
}
