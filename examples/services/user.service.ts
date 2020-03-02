import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

import { ApplicationUser } from '../interfaces/application-user.interface'
import { AuthProviderUserContract, UserServiceContract } from '../../src/contracts'
import { UserID } from '../../src/types'

@Injectable()
export class UserService implements UserServiceContract<ApplicationUser> {
  private users: ApplicationUser[] = [
    {
      id: uuid(),
      username: 'tifa',
      password: 'none',
      firstName: 'Tifa',
      lastName: 'Lockhart',
    },
    {
      id: uuid(),
      username: 'lightning',
      password: 'none',
      firstName: 'Claire',
      lastName: 'Farron',
    },
  ]

  public getOneById(id: string): ApplicationUser | null {
    return this.users.find(user => user.id === id) || null
  }

  public getOneByExternalId(id: string): ApplicationUser | null {
    return this.users.find(user => user.externalId === id) || null
  }

  public getOneByUsernameAndPassword(
    username: string,
    password: string,
  ): ApplicationUser | null {
    return (
      this.users.find(user => user.username === username && user.password === password) || null
    )
  }

  public createFromExternalUserData(userData: AuthProviderUserContract): UserID {
    const newUser: ApplicationUser = { ...userData, id: uuid() }
    this.users.push(newUser)

    return newUser.id
  }

  public updateFromExternalUserData(userData: AuthProviderUserContract): UserID {
    if (!userData.externalId) {
      throw new Error('External ID is not present in user data.')
    }
    const user = this.getOneByExternalId(userData.externalId.toString())
    if (!user) {
      throw new Error('User is not found.')
    }

    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.username = userData.username
    user.email = userData.email

    return user.id
  }
}
