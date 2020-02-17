import { ApplicationUserContract } from './application-user.contract'

export interface AuthProviderServiceContract {
  getUserById(id: string | number): Promise<ApplicationUserContract | undefined>
}
