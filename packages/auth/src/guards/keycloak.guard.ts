import { ExecutionContext, Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

import { IS_PUBLIC_ENDPOINT } from '../decorators'

export class KeycloakGuard extends AuthGuard('keycloak') {
  public constructor(@Inject(Reflector) private readonly reflector: Reflector) {
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

    return super.canActivate(context)
  }
}
