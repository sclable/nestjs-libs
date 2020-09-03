import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Inject,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common'

import { AUTH_MODULE_OPTIONS } from '../constants'
import { ApplicationUserContract } from '../contracts'
import { KeycloakGuard } from '../guards'
import { AuthModuleOptions, CheckResponse } from '../interfaces'
import { ExternalAuthService } from '../services'

@Controller('auth')
export class KeycloakAuthController<UserType extends ApplicationUserContract> {
  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly authModuleOptions: AuthModuleOptions,
    @Inject(ExternalAuthService) private readonly authService: ExternalAuthService<UserType>,
  ) {}

  @UseGuards(KeycloakGuard)
  @Post('logout')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public logout(@Request() request: any, @Response() response: any): void {
    this.authService.addToBlacklist(
      this.authService.decodeAuthorizationHeaderToken(request.headers.authorization),
    )

    response.status(HttpStatus.NO_CONTENT).send()
  }

  @UseGuards(KeycloakGuard)
  @Get('check')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async check(@Request() request: any): Promise<CheckResponse<UserType>> {
    if (!this.authModuleOptions.config.testEndpointEnabled) {
      throw new ForbiddenException()
    }

    return {
      ctxUser: request.user,
    }
  }
}
