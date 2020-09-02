import { ApplicationUserContract, AuthProviderUserContract } from '../contracts'
import { UserID } from '../types'

export interface UserServiceContract<UserType extends ApplicationUserContract> {
  getOneById(userId: UserID): UserType | Promise<UserType | null> | null
  getOneByExternalId(externalId: UserID): UserType | Promise<UserType | null> | null
  getOneByUsernameAndPassword(
    username: string,
    password: string,
  ): UserType | Promise<UserType | null> | null
  createFromExternalUserData(userData: AuthProviderUserContract): UserID | Promise<UserID>
  updateFromExternalUserData(userData: AuthProviderUserContract): UserID | Promise<UserID>
}
