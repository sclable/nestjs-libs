import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { ApplicationUserContract } from '../contracts'
import { LocalAuthService } from '../services'

@Injectable()
export class LocalStrategy<UserType extends ApplicationUserContract> extends PassportStrategy(
  Strategy,
) {
  public constructor(
    @Inject(LocalAuthService) private readonly authService: LocalAuthService<UserType>,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    super()
    this.logger.setContext(LocalStrategy.name)
  }

  protected async validate(username: string, password: string): Promise<UserType> {
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException()
    }

    this.logger.debug(`Application user successfully authenticated (ID: ${user.id})`)

    return user
  }
}
