import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common'

import { AUTH_MODULE_OPTIONS } from '../constants'
import { ApplicationUserContract } from '../contracts'
import { JwtGuard, LocalGuard } from '../guards'
import { AuthModuleOptions, CheckResponse, LoginResponse } from '../interfaces'
import { LocalAuthService } from '../services'

@Controller('auth')
export class LocalAuthController<UserType extends ApplicationUserContract> {
  public constructor(
    @Inject(AUTH_MODULE_OPTIONS) private readonly authModuleOptions: AuthModuleOptions,
    @Inject(LocalAuthService) private readonly authService: LocalAuthService<UserType>,
  ) {}

  @UseGuards(LocalGuard)
  @Post('login')
  @HttpCode(200)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  public async login(@Request() request: any): Promise<LoginResponse> {
    return {
      accessToken: await this.authService.getAccessToken(request.user),
    }
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  public logout(@Request() request: any, @Response() response: any): void {
    this.authService.addToBlacklist(
      this.authService.decodeAuthorizationHeaderToken(request.headers.authorization),
    )

    response.status(HttpStatus.NO_CONTENT).send()
  }

  @UseGuards(JwtGuard)
  @Get('check')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  public async check(@Request() request: any): Promise<CheckResponse<UserType>> {
    if (!this.authModuleOptions.config.testEndpointEnabled) {
      throw new ForbiddenException()
    }

    return {
      ctxUser: request.user,
    }
  }
}
