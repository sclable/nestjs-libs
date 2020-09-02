// @ts-ignore
import KeycloakBearerStrategy from 'passport-keycloak-bearer'
import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { ExternalAuthService } from '../services'
import { AuthModuleOptions, JwtPayload } from '../interfaces'
import { ApplicationUserContract } from '../contracts'
import { AUTH_MODULE_OPTIONS } from '../constants'

export class KeycloakStrategy<
  UserType extends ApplicationUserContract
> extends PassportStrategy(KeycloakBearerStrategy) {
  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) authModuleOptions: AuthModuleOptions,
    @Inject(ExternalAuthService) private readonly authService: ExternalAuthService<UserType>,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    super({
      realm: authModuleOptions.config.providerRealm,
      url: authModuleOptions.config.providerUrl,
      loggingLevel: authModuleOptions.config.loglevel || 'error',
    })
    this.logger.setContext(KeycloakStrategy.name)
  }

  public async validate(jwtPayload: JwtPayload): Promise<UserType> {
    if (this.authService.isBlackListed(jwtPayload)) {
      throw new UnauthorizedException()
    }

    const user = await this.authService.getApplicationUser(jwtPayload)
    if (!user) {
      throw new UnauthorizedException()
    }

    this.logger.debug(`Application user successfully authenticated (ID: ${user.id})`)

    return user
  }
}
