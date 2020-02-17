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

  public async validateUser(
    username: string,
    password: string,
  ): Promise<UserType | undefined> {
    return this.userService.getOneByUsernameAndPassword(username, password)
  }

  public async getAccessToken(user: ApplicationUserContract): Promise<string> {
    const payload = { username: user.name, sub: user.id }

    return this.jwtService.sign(payload)
  }

  public async getApplicationUser(token: JwtPayload): Promise<UserType | undefined> {
    return token.sub ? this.userService.getOneById(token.sub) : undefined
  }
}
