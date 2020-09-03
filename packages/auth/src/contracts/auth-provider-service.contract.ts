import { AuthProviderUserContract } from '../contracts'
import { CreateAuthProviderUser } from '../interfaces'
import { UserID } from '../types'

export interface AuthProviderServiceContract {
  createUsers(users: CreateAuthProviderUser[]): Promise<number>
  getUserById(id: UserID): Promise<AuthProviderUserContract | undefined>
}
