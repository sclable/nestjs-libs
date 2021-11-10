import { ApplicationUserContract, UserServiceContract } from '../contracts'

export interface AuthConfig {
  loglevel?: string
  testEndpointEnabled?: boolean
  providerUrl?: string
  providerRealm?: string
  providerAdminUser?: string
  providerAdminPassword?: string
  jwtSecret?: string
  jwtExpiresIn?: string
}

export interface AuthModuleOptions {
  config: AuthConfig
  userService: UserServiceContract<ApplicationUserContract>
}
