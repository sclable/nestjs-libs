import { ExecutionContext, Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

import { IS_LOCAL_AUTH, IS_PUBLIC_ENDPOINT } from '../decorators'
import { LocalGuard } from './local.guard'

export class JwtGuard extends AuthGuard('jwt') {
  public constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(LocalGuard) private readonly localGuard: LocalGuard,
  ) {
    super()
  }
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ENDPOINT, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }
    const isLocalAuth = this.reflector.getAllAndOverride<boolean>(IS_LOCAL_AUTH, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isLocalAuth) {
      return this.localGuard.canActivate(context)
    }

    return super.canActivate(context)
  }
}
