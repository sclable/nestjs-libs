import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { ExternalAuthService } from '../services'
import { KeycloakStrategy, MockStrategy } from '../strategies'
import { AuthModuleAsyncOptions } from '../interfaces'
import { KeycloakAuthController } from '../controllers'
import { AuthModule } from './auth.module'
import { AuthProviderServiceContract } from '../contracts'
import { KeycloakAdapter } from '../adapters'
import { AUTH_PROVIDER_SERVICE } from '../constants'

@Global()
@Module({})
export class KeycloakAuthModule extends AuthModule {
  public static forRootAsync(
    asyncOptions: AuthModuleAsyncOptions,
    provideControllers: boolean = true,
  ): DynamicModule {
    const authProviderService: Provider<AuthProviderServiceContract> = {
      provide: AUTH_PROVIDER_SERVICE,
      useClass: KeycloakAdapter,
    }

    const controllers = provideControllers ? [KeycloakAuthController] : []

    return {
      module: KeycloakAuthModule,
      imports: [PassportModule, JwtModule.register({}), ...(asyncOptions.imports || [])],
      providers: [
        Logger,
        ExternalAuthService,
        KeycloakStrategy,
        MockStrategy,
        authProviderService,
        this.getUserServiceProvider(),
        this.createAsyncOptionsProvider(asyncOptions),
      ],
      exports: [this.createAsyncOptionsProvider(asyncOptions)],
      controllers,
    }
  }
}
