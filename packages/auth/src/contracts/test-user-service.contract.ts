import { ApplicationUserContract } from './application-user.contract'
import { UserServiceContract } from './user-service.contract'

export interface TestUserServiceContract<UserType extends ApplicationUserContract>
  extends UserServiceContract<UserType> {
  getTestUser(): UserType | Promise<UserType>
}
