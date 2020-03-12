import { AuthGuard } from '@nestjs/passport'

export class MockGuard extends AuthGuard('mock') {}
