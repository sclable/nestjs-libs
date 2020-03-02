import { UserID } from '../types'

export interface AuthProviderUserContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  externalId: UserID
  email: string
  username: string
  firstName?: string
  lastName?: string
}
