import { Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ApplicationUserContract, UserServiceContract } from '../contracts'
import { AuthService } from './auth.service'
import { JwtPayload } from '../interfaces'
import { USER_SERVICE } from '../constants'

export class LocalAuthService<UserType extends ApplicationUserContract> extends AuthService<
  UserType
> {
  public constructor(
    @Inject(USER_SERVICE) private readonly userService: UserServiceContract<UserType>,
    @Inject(JwtService) protected readonly jwtService: JwtService,
  ) {
    super(jwtService)
  }

  public async validateUser(username: string, password: string): Promise<UserType | null> {
    return this.userService.getOneByUsernameAndPassword(username, password)
  }

  public async getAccessToken(user: ApplicationUserContract): Promise<string> {
    const payload = {
      sub: user.id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      preferred_username: user.username,
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/camelcase
      given_name: user.firstName,
      // eslint-disable-next-line @typescript-eslint/camelcase
      family_name: user.lastName,
    }

    return this.jwtService.sign(payload)
  }

  public async getApplicationUser(token: JwtPayload): Promise<UserType | null> {
    return token.sub ? this.userService.getOneById(token.sub) : null
  }
}
