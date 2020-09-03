import { ResourceAccess } from '../interfaces'
import { UserID } from '../types'

export interface ApplicationUserContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  id: UserID
  externalId?: UserID
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  resourceAccess?: ResourceAccess
}
