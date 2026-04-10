import type KcAdminClient from '@keycloak/keycloak-admin-client'
import { Inject, Logger } from '@nestjs/common'

import { AUTH_MODULE_OPTIONS } from '../constants'
import { AuthProviderServiceContract, AuthProviderUserContract } from '../contracts'
import { AuthModuleOptions, CreateAuthProviderUser } from '../interfaces'

const MASTER_REALM = 'master'

type KcUser = NonNullable<Awaited<ReturnType<KcAdminClient['users']['findOne']>>>

/**
 * Bypasses TypeScript's CommonJS `import()` rewrite so that Node.js executes a
 * native dynamic `import()` at runtime, enabling ESM-only packages to be loaded
 * from a CommonJS compiled module.
 */
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const nativeDynamicImport = new Function('modulePath', 'return import(modulePath)') as <T>(
  modulePath: string,
) => Promise<T>

/**
 * @see https://github.com/keycloak/keycloak-nodejs-admin-client
 */
export class KeycloakAdapter implements AuthProviderServiceContract {
  private kcAdminClient: KcAdminClient | undefined
  private readonly logger: Logger = new Logger(KeycloakAdapter.name)

  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly authModuleOptions: AuthModuleOptions,
  ) {}

  public async createUsers(users: CreateAuthProviderUser[]): Promise<number> {
    let created = 0
    try {
      const client = await this.getKcAdminClient()
      await this.login(client)
      for await (const user of users) {
        let kcUser: { id: string }
        try {
          kcUser = await client.users.create(user)
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
          await this.assignClientRolesToUser(client, kcUser.id, clientRoles)
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

  private async getKcAdminClient(): Promise<KcAdminClient> {
    if (!this.kcAdminClient) {
      const { default: KcAdminClientClass } = await nativeDynamicImport<
        typeof import('@keycloak/keycloak-admin-client')
      >('@keycloak/keycloak-admin-client')
      this.kcAdminClient = new KcAdminClientClass({
        baseUrl: this.authModuleOptions.config.providerUrl,
        realmName: MASTER_REALM, // must be master to be able to authenticate properly
      })
    }

    return this.kcAdminClient
  }

  private async login(client: KcAdminClient): Promise<void> {
    client.setConfig({
      realmName: MASTER_REALM,
    })

    await client.auth({
      username: this.authModuleOptions.config.providerAdminUser || '',
      password: this.authModuleOptions.config.providerAdminPassword || '',
      grantType: 'password',
      clientId: 'admin-cli',
    })

    client.setConfig({
      realmName: this.authModuleOptions.config.providerRealm,
    })
  }

  private async getUser(id: string): Promise<KcUser | undefined> {
    let user: KcUser | undefined = undefined
    try {
      const client = await this.getKcAdminClient()
      await this.login(client)
      user = await client.users.findOne({ id })
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
    user: KcUser,
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
    client: KcAdminClient,
    userId: string,
    clientRoles: Record<string, []>,
  ): Promise<void> {
    for await (const clientId of Object.keys(clientRoles)) {
      const kcClients = await client.clients.find({ clientId })
      if (!kcClients || !kcClients[0]) {
        continue
      }

      const kcClient = kcClients[0]
      if (!kcClient.id) {
        continue
      }

      const roles = [...clientRoles[clientId]]
      for await (const roleName of roles) {
        const kcRole = await client.clients.findRole({
          id: kcClient.id,
          roleName,
        })

        if (!kcRole || !kcRole.id || !kcRole.name) {
          continue
        }

        await client.users.addClientRoleMappings({
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
