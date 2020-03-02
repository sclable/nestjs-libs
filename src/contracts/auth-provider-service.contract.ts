import { AuthProviderUserContract } from '../contracts'
import { UserID } from '../types'

export interface AuthProviderServiceContract {
  getUserById(id: UserID): Promise<AuthProviderUserContract | undefined>
}
