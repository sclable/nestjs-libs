import { ApplicationUserContract } from '../../src/contracts'

export interface ApplicationUser extends ApplicationUserContract {
  password?: string
}
