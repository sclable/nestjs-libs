import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'

import { LocalAuthService } from '../services'
import { AuthModuleOptions, JwtPayload } from '../interfaces'
import { ApplicationUserContract } from '../contracts'
import { AUTH_MODULE_OPTIONS } from '../constants'

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
