import { AuthGuard } from '@nestjs/passport'

export class KeycloakGuard extends AuthGuard('keycloak') {}
