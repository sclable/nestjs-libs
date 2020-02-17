# NestJS Authentication Library

## Features

### Local (JWT) authentication
TBD

### Keycloak authentication
TBD

## Setting up
### Import the required module to the application module.
```typescript
// app/src/app.module.ts

import { AuthConfig, KeycloakAuthModule } from '@contakt/libs/nestjs-auth'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { UserService } from './services' // this must be implemented by the application

@Module({
  imports: [
    // ...
    KeycloakAuthModule.forRootAsync({
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      imports: [AppModule],
      useFactory: (config: ConfigService, userService: UserService) => ({
        config: config.get<AuthConfig>('auth', {}),
        userService,
      }),
      inject: [ConfigService, UserService],
    }),
    // ...
  ],
  exports: [UserService],
  providers: [UserService],
  // ...
})
export class AppModule {}
```

There is a second argument of the `forRootAsync()` function which can be used to disable the built in controllers.
```typescript
public static abstract forRootAsync(
  asyncOptions: AuthModuleAsyncOptions,
  provideControllers: boolean = false,
): DynamicModule
```

### Create configuration file
Check `examples/config/auth.config.ts` as a reference.
```typescript
// app/src/config/auth.config.ts

import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  loglevel: process.env.AUTH_LOGLEVEL || 'error',
  testEndpointEnabled: process.env.AUTH_TEST_ENDPOINT_ENABLED === 'true',
  jwtSecret: process.env.AUTH_JWT_SECRET,
  jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN,
  providerUrl: process.env.AUTH_PROVIDER_URL,
  providerRealm: process.env.AUTH_PROVIDER_REALM,
  providerAdminUser: process.env.AUTH_PROVIDER_USER,
  providerAdminPassword: process.env.AUTH_PROVIDER_PASSWORD,
}))
```

### Add configuration to app's .env file
```dotenv
AUTH_LOGLEVEL=info
AUTH_TEST_ENDPOINT_ENABLED=false
AUTH_JWT_SECRET=SuperSafeSecret$$$
AUTH_JWT_EXPIRES_IN=1d

AUTH_PROVIDER_URL=http://localhost:8088/auth
AUTH_PROVIDER_REALM=master
AUTH_PROVIDER_USER=admin
AUTH_PROVIDER_PASSWORD=Pa55w0rd
AUTH_PROVIDER_DB_NAME=keycloak
AUTH_PROVIDER_DB_USER=KeycloakAdmin
AUTH_PROVIDER_DB_PASSWORD=KCAdmin123
```

### Create ApplicationUser entity
ApplicationUser must fulfill the ApplicationUserContract defined in `src/contracts/application-user.contract.ts'.
```typescript
// lib/src/contracts/application-user.contract.ts'

export interface ApplicationUserContract {
  [key: string]: any
  id: string | number
  externalId?: string | number
  name?: string
  username?: string
  email?: string
}
```

An example can be found here: `examples/interfaces/application-user.interface.ts`.

### Implement UserService
UserService must fulfill the UserServiceContract defined in `src/contracts/user-service.contract.ts`.
```typescript
// lib/src/contracts/user-service.contract.ts

import { ApplicationUserContract } from './application-user.contract'

export interface UserServiceContract<UserType extends ApplicationUserContract> {
  getOneById(userId: string | number): UserType | Promise<UserType> | undefined
  getOneByExternalId(externalId: string | number): UserType | Promise<UserType> | undefined
  getOneByUsernameAndPassword(
    username: string,
    password: string,
  ): UserType | Promise<UserType> | undefined
  createFromExternalUserData(userData: ApplicationUserContract): UserType | Promise<UserType>
  updateFromExternalUserData(userData: ApplicationUserContract): UserType | Promise<UserType>
}
```

An example implementation can be found here: `examples/services/user.service.ts`. This example service is exported
by the library so the application can use it directly ONLY FOR TESTING PURPOSES.

Note: not all the functions need to be implemented (return undefined, throw exception, etc.)
 * for Keycloak authentication `getOneByUsernameAndPassword()` can be omitted
 * for local authentication `createFromExternalUserDat()` and `updateFromExternalUserData()` can be omitted.
 
### GraphQL
For GraphQL usage a GraphQL guard must be created within the application according to the NestJS recommendations.
This guard must be extended from one of the guards provided by the library.
```typescript
// app/src/auth/graphql.guard.ts

import { KeycloakGuard } from '@contakt/libs/nestjs-auth'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class GraphqlGuard extends KeycloakGuard {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getRequest(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context)

    return ctx.getContext().req
  }
}
```

## Usage
Just simply import and apply the needed guards in the application controllers or resolvers.
* JwtGuard
* LocalGuard
* KeycloakGuard

Example:
```typescript
  import { KeycloakGuard } from '@contakt/libs/nestjs-auth'

  @UseGuards(KeycloakGuard)
  @Get('secured')
  public async secured(@Request() request: any): Promise<any> {
    // ...
  }
```
