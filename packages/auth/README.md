# NestJS Authentication Library

## Features

### Local (JWT) authentication
Create an `auth.module.ts` for your application and import `LocalAuthModule`. 
```typescript
// app/src/auth/auth.module.ts

@Module({
  imports: [
    LocalAuthModule.forRootAsync({
      imports: [UserModule],
      inject: [ConfigService, UserService],
      useFactory: (config: ConfigService, userService: UserService) => ({
        config: config.get<AuthConfig>('auth', {}),
        userService,
      }),
    })
  ],
  providers: [
    // set as global guard
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    LocalGuard,
  ],
})
export class AuthModule {}
```

### Keycloak authentication
Create an `auth.module.ts` for your application and import `LocalAuthModule`. 
```typescript
// app/src/auth/auth.module.ts

@Module({
  imports: [
    KeycloakAuthModule.forRootAsync({
      imports: [UserModule],
      inject: [ConfigService, UserService],
      useFactory: (config: ConfigService, userService: UserService) => ({
        config: config.get<AuthConfig>('auth', {}),
        userService,
      }),
    }),
  ],
  providers: [
    // set as global guard
    {
      provide: APP_GUARD,
      useClass: KeycloakGuard,
    },
  ],
})
export class AuthModule {}
```

## Setting up
Import your authentication module to the app module
```typescript
// app/src/app.module.ts

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [auth] }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

There is a second argument of the `forRootAsync()` function which can be used to disable the built in controllers. If enabled (default) the modules will provide an `auth/logout` and if `testEndpointEnabled` is enabled in the config an `auth/check` endpoint which returns the user's info. Local authentication module also provides an `auth/login` endpoint to provide username and password as the JWT authentication's entry point.
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
ApplicationUser must fulfill the ApplicationUserContract defined in `src/contracts/application-user.contract.ts'.`
```typescript
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

import { KeycloakGuard } from '@contakt-libs/nestjs-auth'
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
### Global guards

To setup global guard in nestjs provide and `APP_GUARD` provider from the auth or app module. `JwtGuard` has an additional dependency on `LocalGuard` (for the `auth/login` endpoint) so it also needs to be provided in the same module.
```typescript
providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard, // or KeycloakGuard
    },
    LocalGuard,
  ],
```
### Scoped guards

Just simply import and apply the needed guards in the application controllers or resolvers.
* JwtGuard
* LocalGuard
* KeycloakGuard

Example:
```typescript
  import { KeycloakGuard } from '@contakt-libs/nestjs-auth'

  @UseGuards(KeycloakGuard)
  @Get('secured')
  public async secured(@Request() request: any): Promise<any> {
    // ...
  }
```

### Public endpoint
For an unauthenticated public endpoint use the `@Public()` decorator.

## API documentation
[Github Wiki](https://github.com/sclable/nestjs-libs/wiki/auth)
