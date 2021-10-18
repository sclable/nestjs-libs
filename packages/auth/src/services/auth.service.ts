import { Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ApplicationUserContract } from '../contracts'
import { JwtPayload } from '../interfaces'

export abstract class AuthService<UserType extends ApplicationUserContract> {
  private blackList: JwtPayload[] = []

  protected constructor(@Inject(JwtService) protected readonly jwtService: JwtService) {}

  protected static userDataChanged(user: ApplicationUserContract, token: JwtPayload): boolean {
    return (
      user.firstName !== token.given_name ||
      user.lastName !== token.family_name ||
      user.username !== token.preferred_username ||
      user.email !== token.email
    )
  }

  public decodeAuthorizationHeaderToken(headerToken: string): JwtPayload {
    return this.jwtService.decode(headerToken.split(' ')[1]) as JwtPayload
  }

  public isValid(jwtPayload: JwtPayload): boolean {
    return (
      !this.isBlackListed(jwtPayload) &&
      !!jwtPayload.exp &&
      !!jwtPayload.sub &&
      jwtPayload.exp > Date.now() / 1000
    )
  }

  public isBlackListed(jwtPayload: JwtPayload): boolean {
    return !!this.blackList.find(({ jti }) => jti === jwtPayload.jti)
  }

  public addToBlacklist(jwtPayload: JwtPayload): void {
    this.cleanupBlacklist()

    this.blackList.push({
      jti: jwtPayload.jti,
      exp: jwtPayload.exp,
    })
  }

  private cleanupBlacklist(): void {
    this.blackList = this.blackList.filter(({ exp }) => exp && exp > Date.now() / 1000)
  }

  public abstract getApplicationUser(token: JwtPayload): Promise<UserType | null>
}
