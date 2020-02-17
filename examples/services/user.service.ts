import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'

import { ApplicationUser } from '../interfaces/application-user.interface'
import { ApplicationUserContract, UserServiceContract } from '../../src/contracts'

@Injectable()
export class UserService implements UserServiceContract<ApplicationUser> {
  private users: ApplicationUser[] = [
    { id: uuid(), name: 'Tifa Lockhart', username: 'tifa', password: 'none' },
    { id: uuid(), name: 'Claire Farron', username: 'lightning', password: 'none' },
  ]

  public getOneById(id: string): ApplicationUser | undefined {
    return this.users.find(user => user.id === id)
  }

  public getOneByExternalId(id: string): ApplicationUser | undefined {
    return this.users.find(user => user.externalId === id)
  }

  public getOneByUsernameAndPassword(
    username: string,
    password: string,
  ): ApplicationUser | undefined {
    return this.users.find(user => user.username === username && user.password === password)
  }

  public createFromExternalUserData(userData: ApplicationUserContract): ApplicationUser {
    const newUser: ApplicationUser = { ...userData, id: uuid() }
    this.users.push(newUser)

    return newUser
  }

  public updateFromExternalUserData(
    userData: ApplicationUserContract,
  ): Promise<ApplicationUser> | ApplicationUser {
    if (!userData.externalId) {
      throw new Error('External ID is not present in user data.')
    }
    const user = this.getOneByExternalId(userData.externalId.toString())
    if (!user) {
      throw new Error('User is not found.')
    }

    user.name = userData.name
    user.username = userData.username
    user.email = userData.email

    return user
  }
}
