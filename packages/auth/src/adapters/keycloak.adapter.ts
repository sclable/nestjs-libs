import { Inject, Logger } from '@nestjs/common'
import KcAdminClient from 'keycloak-admin'
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation'

import { AUTH_MODULE_OPTIONS } from '../constants'
import { AuthProviderServiceContract, AuthProviderUserContract } from '../contracts'
import { AuthModuleOptions } from '../interfaces'

const MASTER_REALM = 'master'

/**
 * @see https://github.com/keycloak/keycloak-nodejs-admin-client
 */
export class KeycloakAdapter implements AuthProviderServiceContract {
  private kcAdminClient: KcAdminClient
  private readonly logger: Logger = new Logger(KeycloakAdapter.name)

  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly authModuleOptions: AuthModuleOptions,
  ) {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: authModuleOptions.config.providerUrl,
      realmName: MASTER_REALM, // must be master to be able to authenticate properly
    })
  }

  public async createUsers(users: UserRepresentation[]): Promise<number> {
    let created = 0
    try {
      await this.login()
      for await (const user of users) {
        let kcUser: { id: string }
        try {
          kcUser = await this.kcAdminClient.users.create(user)
          created++
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown Error'
          this.logger.error(`User cannot be created via Keycloak API: ${message}`)
          continue
        }

        const clientRoles = user.clientRoles || {}
        if (!clientRoles) {
          continue
        }

        try {
          await this.assignClientRolesToUser(kcUser.id, clientRoles)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown Error'
          this.logger.error(`Roles cannot be assigned to user via Keycloak API: ${message}`)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      this.logger.error(`CreateUser error: ${message}`)
    }

    return created
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      this.logger.warn(
        `User cannot be fetched from Keycloak API (external ID: ${id}), error: ${message}`,
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

  private async assignClientRolesToUser(
    userId: string,
    clientRoles: Record<string, []>,
  ): Promise<void> {
    for await (const clientId of Object.keys(clientRoles)) {
      const kcClients = await this.kcAdminClient.clients.find({ clientId })
      if (!kcClients || !kcClients[0]) {
        continue
      }

      const kcClient = kcClients[0]
      if (!kcClient.id) {
        continue
      }

      const roles = [...clientRoles[clientId]]
      for await (const roleName of roles) {
        const kcRole = await this.kcAdminClient.clients.findRole({
          id: kcClient.id,
          roleName,
        })

        if (!kcRole || !kcRole.id || !kcRole.name) {
          continue
        }

        await this.kcAdminClient.users.addClientRoleMappings({
          id: userId,
          clientUniqueId: kcClient.id,
          roles: [
            {
              id: kcRole.id,
              name: kcRole.name,
            },
          ],
        })
      }
    }
  }
}
