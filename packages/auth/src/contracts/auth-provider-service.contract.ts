import { AuthProviderUserContract } from '../contracts'
import { UserID } from '../types'
import { CreateAuthProviderUser } from '../interfaces'

export interface AuthProviderServiceContract {
  createUsers(users: CreateAuthProviderUser[]): Promise<number>
  getUserById(id: UserID): Promise<AuthProviderUserContract | undefined>
}
