import { ModuleMetadata } from '@nestjs/common/interfaces'

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

export interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => AuthModuleOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject: any[]
}
