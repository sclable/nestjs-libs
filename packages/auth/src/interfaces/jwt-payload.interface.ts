import { ResourceAccess } from './resource-access.interface'

export interface JwtPayload {
  sub?: string
  jti?: string
  exp?: number
  name?: string
  given_name?: string
  family_name?: string
  preferred_username?: string
  email?: string
  resource_access?: ResourceAccess
}
