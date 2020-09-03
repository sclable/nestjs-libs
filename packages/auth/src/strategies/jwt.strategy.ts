import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AUTH_MODULE_OPTIONS } from '../constants'
import { ApplicationUserContract } from '../contracts'
import { AuthModuleOptions, JwtPayload } from '../interfaces'
import { LocalAuthService } from '../services'

@Injectable()
export class JwtStrategy<UserType extends ApplicationUserContract> extends PassportStrategy(
  Strategy,
) {
  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) authModuleOptions: AuthModuleOptions,
    @Inject(LocalAuthService) private readonly authService: LocalAuthService<UserType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authModuleOptions.config.jwtSecret,
    })
  }

  public async validate(jwtPayload: JwtPayload): Promise<UserType> {
    if (this.authService.isBlackListed(jwtPayload)) {
      throw new UnauthorizedException()
    }

    const user = await this.authService.getApplicationUser(jwtPayload)
    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
