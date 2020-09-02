import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'

import { LocalAuthService } from '../services'
import { ApplicationUserContract } from '../contracts'

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
