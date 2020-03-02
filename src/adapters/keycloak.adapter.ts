import { Inject, Logger } from '@nestjs/common'
import KcAdminClient from 'keycloak-admin'
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation'

import { AuthProviderServiceContract, AuthProviderUserContract } from '../contracts'
import { AuthModuleOptions } from '../interfaces'
import { AUTH_MODULE_OPTIONS } from '../constants'

const MASTER_REALM = 'master'

/**
 * @see https://github.com/keycloak/keycloak-nodejs-admin-client
 */
export class KeycloakAdapter implements AuthProviderServiceContract {
  private kcAdminClient: KcAdminClient

  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly authModuleOptions: AuthModuleOptions,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: authModuleOptions.config.providerUrl,
      realmName: MASTER_REALM, // must be master to be able to authenticate properly
    })
    this.logger.setContext(KeycloakAdapter.name)
  }

  public async getUserById(id: string): Promise<AuthProviderUserContract | undefined> {
    const user = await this.getUser(id)

    return user ? this.createApplicationUserFromUserRepresentation(user) : undefined
  }

  private async login(): Promise<void> {
    this.kcAdminClient.setConfig({
      realmName: MASTER_REALM,
    })

    await this.kcAdminClient.auth({
      username: this.authModuleOptions.config.providerAdminUser || '',
      password: this.authModuleOptions.config.providerAdminPassword || '',
      grantType: 'password',
      clientId: 'admin-cli',
    })

    this.kcAdminClient.setConfig({
      realmName: this.authModuleOptions.config.providerRealm,
    })
  }

  private async getUser(id: string): Promise<UserRepresentation | undefined> {
    let user: UserRepresentation | undefined = undefined
    try {
      await this.login()
      user = await this.kcAdminClient.users.findOne({ id })
    } catch (e) {
      this.logger.warn(
        `User cannot be fetched from Keycloak API (external ID: ${id}), error: ${e.message}`,
      )

      return undefined
    }

    this.logger.debug(`1 user successfully fetched from Keycloak API (external ID: ${id})`)

    return user
  }

  private createApplicationUserFromUserRepresentation(
    user: UserRepresentation,
  ): AuthProviderUserContract | undefined {
    if (!user.id) {
      this.logger.warn(`External user fetched by ID has no external ID`)

      return undefined
    }

    return {
      externalId: user.id,
      email: user.email || '',
      username: user.username || '',
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }
}
