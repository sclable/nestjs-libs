import { ApplicationUserContract } from './application-user.contract'

export interface UserServiceContract<UserType extends ApplicationUserContract> {
  getOneById(userId: string | number): UserType | Promise<UserType> | undefined
  getOneByExternalId(externalId: string | number): UserType | Promise<UserType> | undefined
  getOneByUsernameAndPassword(
    username: string,
    password: string,
  ): UserType | Promise<UserType> | undefined
  createFromExternalUserData(userData: ApplicationUserContract): UserType | Promise<UserType>
  updateFromExternalUserData(userData: ApplicationUserContract): UserType | Promise<UserType>
}
