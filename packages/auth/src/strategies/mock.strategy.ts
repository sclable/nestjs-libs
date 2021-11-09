import { Inject, Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-mock-strategy'

import { USER_SERVICE } from '../constants'
import { ApplicationUserContract, TestUserServiceContract } from '../contracts'

@Injectable()
export class MockStrategy<UserType extends ApplicationUserContract> extends PassportStrategy(
  Strategy,
) {
  private readonly logger: Logger = new Logger(MockStrategy.name)
  public constructor(
    @Inject(USER_SERVICE) private readonly userService: TestUserServiceContract<UserType>,
  ) {
    super()
  }

  protected async validate(): Promise<UserType | null> {
    const user = await this.userService.getTestUser()

    this.logger.debug(`MOCK user successfully authenticated (ID: ${user.id})`)

    return user
  }
}
