import { Strategy } from 'passport-mock-strategy'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, Logger } from '@nestjs/common'

import { ApplicationUserContract, TestUserServiceContract } from '../contracts'
import { USER_SERVICE } from '../constants'

@Injectable()
export class MockStrategy<UserType extends ApplicationUserContract> extends PassportStrategy(
  Strategy,
) {
  public constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(USER_SERVICE) private readonly userService: TestUserServiceContract<UserType>,
  ) {
    super()
    this.logger.setContext(MockStrategy.name)
  }

  protected async validate(): Promise<UserType | null> {
    const user = await this.userService.getTestUser()

    this.logger.debug(`MOCK user successfully authenticated (ID: ${user.id})`)

    return user
  }
}
