import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import {
  ApplicationUserContract,
  AuthProviderServiceContract,
  UserServiceContract,
} from '../contracts'
import { JwtPayload } from '../interfaces'
import { AuthService } from './auth.service'
import { AUTH_PROVIDER_SERVICE, USER_SERVICE } from '../constants'

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
  ): Promise<UserType | undefined> {
    const externalId = token.sub
    if (!externalId) {
      return undefined
    }

    let user = await this.userService.getOneByExternalId(externalId)
    if (!user && createIfNotExists) {
      user = await this.createApplicationUser(externalId)
    } else if (
      !!user &&
      updateIfChanged &&
      AuthService.userDataChanged(user, token) &&
      this.updateLock.indexOf(user.id.toString()) < 0
    ) {
      await this.updateApplicationUser(externalId, user)
    }

    return user
  }

  private async createApplicationUser(
    externalId: string | number,
  ): Promise<UserType | undefined> {
    let user = undefined
    try {
      const userData = await this.authProviderService.getUserById(externalId)
      if (!userData) {
        return undefined
      }

      user = await this.userService.createFromExternalUserData(userData)
    } catch (e) {
      this.logger.warn(`Application user cannot be created (external ID: ${externalId})`)

      return undefined
    }

    this.logger.debug(`New application user created (ID: ${user.id})`)

    return user
  }

  private async updateApplicationUser(
    externalId: string | number,
    user: ApplicationUserContract,
  ): Promise<void> {
    this.updateLock.push(user.id.toString())
    const userData = await this.authProviderService.getUserById(externalId)
    if (!userData) {
      return
    }
    await this.userService.updateFromExternalUserData(userData)
    this.updateLock.splice(this.updateLock.indexOf(user.id.toString()), 1)

    this.logger.debug(`Application user updated (ID: ${user.id})`)
  }
}
