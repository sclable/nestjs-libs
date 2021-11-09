import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { ApplicationUserContract } from '../contracts'
import { LocalAuthService } from '../services'

@Injectable()
export class LocalStrategy<UserType extends ApplicationUserContract> extends PassportStrategy(
  Strategy,
) {
  private readonly logger: Logger = new Logger(LocalStrategy.name)
  public constructor(
    @Inject(LocalAuthService) private readonly authService: LocalAuthService<UserType>,
  ) {
    super()
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
