import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import {
  ApplicationUserContract,
  AuthProviderServiceContract,
  UserServiceContract,
} from '../contracts'
import { CreateAuthProviderUser, JwtPayload } from '../interfaces'
import { AuthService } from './auth.service'
import { AUTH_PROVIDER_SERVICE, USER_SERVICE } from '../constants'
import { UserID } from '../types'

@Injectable()
export class ExternalAuthService<UserType extends ApplicationUserContract> extends AuthService<
  UserType
> {
  private updateLock: string[] = []

  public constructor(
    @Inject(AUTH_PROVIDER_SERVICE)
    private readonly authProviderService: AuthProviderServiceContract,
    @Inject(USER_SERVICE) private readonly userService: UserServiceContract<UserType>,
    @Inject(JwtService) protected readonly jwtService: JwtService,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    super(jwtService)
    this.logger.setContext(AuthService.name)
  }

  public async getApplicationUser(
    token: JwtPayload,
    createIfNotExists: boolean = true,
    updateIfChanged: boolean = true,
  ): Promise<UserType | null> {
    const externalId = token.sub
    if (!externalId) {
      return null
    }

    let user: UserType | null = await this.userService.getOneByExternalId(externalId)

    if (!user && createIfNotExists) {
      const userId = await this.createApplicationUser(externalId)

      user = userId ? await this.userService.getOneById(userId) : null
    } else if (
      !!user &&
      updateIfChanged &&
      AuthService.userDataChanged(user, token) &&
      this.updateLock.indexOf(user.id.toString()) < 0
    ) {
      const userId = await this.updateApplicationUser(externalId, user)

      user = userId ? await this.userService.getOneById(userId) : null
    }

    if (user) {
      user.resourceAccess = token.resource_access
    }

    return user
  }

  public async createAuthUser(users: CreateAuthProviderUser[]): Promise<number> {
    return this.authProviderService.createUsers(users)
  }

  private async createApplicationUser(externalId: UserID): Promise<UserID | null> {
    let userId: string | number | UserID | null = null
    try {
      const userData = await this.authProviderService.getUserById(externalId)
      if (!userData) {
        return null
      }

      userId = await this.userService.createFromExternalUserData(userData)
    } catch (e) {
      this.logger.warn(`Application user cannot be created (external ID: ${externalId})`)
      this.logger.debug(e)

      return null
    }

    this.logger.debug(`New application user created (ID: ${userId})`)

    return userId
  }

  private async updateApplicationUser(
    externalId: UserID,
    user: UserType,
  ): Promise<UserID | null> {
    this.updateLock.push(user.id.toString())
    const userData = await this.authProviderService.getUserById(externalId)
    if (!userData) {
      return null
    }
    const userId = await this.userService.updateFromExternalUserData({
      ...userData,
      id: user.id,
    })
    this.updateLock.splice(this.updateLock.indexOf(user.id.toString()), 1)

    this.logger.debug(`Application user updated (ID: ${user.id})`)

    return userId
  }
}
