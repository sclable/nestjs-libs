import { INestApplication, Module } from '@nestjs/common'
import { Test as NestTest, TestingModule } from '@nestjs/testing'
import request, { SuperTest, Test } from 'supertest'

import { UserService } from '../examples'
import { JwtGuard, LocalAuthModule, LocalGuard } from '../src'

@Module({
  providers: [UserService],
  exports: [UserService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class UserModule {}

describe('Local Authentication', () => {
  let testModule: TestingModule
  let app: INestApplication
  let testServer: SuperTest<Test>
  let bearerToken: string

  beforeAll(async () => {
    testModule = await NestTest.createTestingModule({
      imports: [
        UserModule,
        LocalAuthModule.forRootAsync({
          imports: [UserModule],
          inject: [UserService],
          useFactory: (userService: UserService) => ({
            config: {
              testEndpointEnabled: true,
              jwtSecret: 'test-secret',
              jwtExpiresIn: '1d',
            },
            userService,
          }),
        }),
      ],
    }).compile()

    app = testModule.createNestApplication()
    await app.init()

    testServer = request(app.getHttpServer())
  })

  test('guards defined', () => {
    expect(testModule.get(LocalGuard)).toBeDefined()
    expect(testModule.get(JwtGuard)).toBeDefined()
  })

  test('/auth/check unauthenticated', async () => {
    await testServer.get('/auth/check').expect(401)
  })

  test('/auth/login', async () => {
    const response = await testServer
      .post('/auth/login')
      .send({ username: 'tifa', password: 'none' })
      .expect(200)
    bearerToken = response.body.accessToken
  })

  test('/auth/check', async () => {
    const response = await testServer
      .get('/auth/check')
      .set({ Authorization: `Bearer ${bearerToken}` })
      .expect(200)
    expect(response.body.ctxUser).toEqual(
      expect.objectContaining({
        username: 'tifa',
        firstName: 'Tifa',
        lastName: 'Lockhart',
      }),
    )
  })

  test('/auth/logout', async () => {
    await testServer
      .post('/auth/logout')
      .set({ Authorization: `Bearer ${bearerToken}` })
      .expect(204)
    await testServer.get('/auth/check').expect(401)
  })
})
