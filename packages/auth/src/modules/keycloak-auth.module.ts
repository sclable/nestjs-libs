import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AsyncProvider, createAsyncProviders } from '@sclable/nestjs-async-provider'

import { KeycloakAdapter } from '../adapters'
import { AUTH_MODULE_OPTIONS, AUTH_PROVIDER_SERVICE } from '../constants'
import { AuthProviderServiceContract } from '../contracts'
import { KeycloakAuthController } from '../controllers'
import { AuthModuleOptions } from '../interfaces'
import { ExternalAuthService } from '../services'
import { KeycloakStrategy, MockStrategy } from '../strategies'
import { AuthModule } from './auth.module'

@Global()
@Module({})
export class KeycloakAuthModule extends AuthModule {
  public static forRootAsync(
    asyncOptions: AsyncProvider<AuthModuleOptions>,
    provideControllers: boolean = true,
  ): DynamicModule {
    const authProviderService: Provider<AuthProviderServiceContract> = {
      provide: AUTH_PROVIDER_SERVICE,
      useClass: KeycloakAdapter,
    }

    const controllers = provideControllers ? [KeycloakAuthController] : []
    const asyncProviders = createAsyncProviders(asyncOptions, AUTH_MODULE_OPTIONS)

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
        ...asyncProviders,
      ],
      exports: [...asyncProviders],
      controllers,
    }
  }
}
