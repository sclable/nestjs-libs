import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { LocalAuthService } from '../services'
import { JwtStrategy, LocalStrategy } from '../strategies'
import { AuthModuleAsyncOptions, AuthModuleOptions } from '../interfaces'
import { LocalAuthController } from '../controllers'
import { AuthModule } from './auth.module'
import { AUTH_MODULE_OPTIONS } from '../constants'

@Global()
@Module({})
export class LocalAuthModule extends AuthModule {
  public static forRootAsync(
    asyncOptions: AuthModuleAsyncOptions,
    provideControllers: boolean = true,
  ): DynamicModule {
    const controllers = provideControllers ? [LocalAuthController] : []

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
        LocalStrategy,
        JwtStrategy,
        this.getUserServiceProvider(),
        this.createAsyncOptionsProvider(asyncOptions),
      ],
      exports: [this.createAsyncOptionsProvider(asyncOptions)],
      controllers,
    }
  }
}
