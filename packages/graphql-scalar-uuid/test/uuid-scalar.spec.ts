import { INestApplication } from '@nestjs/common'
import { Args, GraphQLModule, Query, Resolver } from '@nestjs/graphql'
import { Test as NestTest, TestingModule } from '@nestjs/testing'
import supertest, { SuperTest, Test } from 'supertest'
import { v4 as uuidv4 } from 'uuid'

import { UUIDv4Scalar } from '..'

const typeDefs = `
  scalar UUIDv4
  type Data {
    id: ID!
    str: String
  }

  type Query {
    Data_getData(id: UUIDv4!): Data
  }
`
const testData = 'TEST_DATA'

interface Data {
  id: string
  str: string
}

let app: INestApplication
let testServer: SuperTest<Test>

@Resolver()
class TestResolver {
  @Query('Data_getData')
  public async getData(@Args('id') id: string): Promise<Data> {
    return {
      id,
      str: testData,
    }
  }
}

describe('GraphQL UUID scalar', () => {
  beforeAll(async () => {
    const module: TestingModule = await NestTest.createTestingModule({
      imports: [GraphQLModule.forRoot({ typeDefs, introspection: true })],
      providers: [UUIDv4Scalar, TestResolver],
    }).compile()
    app = module.createNestApplication()
    await app.init()
    testServer = supertest(app.getHttpServer())
  })
  afterAll(async () => {
    await app.close()
  })
  test('valid UUIDv4', async () => {
    const id = uuidv4()
    await testServer
      .post('/graphql')
      .send({ query: `{Data_getData(id: "${id}") {id str}}` })
      .expect(200, {
        data: {
          Data_getData: {
            id,
            str: testData,
          },
        },
      })
  })
  test('invalid UUIDv4', async () => {
    const id = 'invalid uuid'
    const response = await testServer
      .post('/graphql')
      .send({ query: `{Data_getData(id: "${id}") {id str}}` })
      .expect(400)
    expect(response.body.errors[0]).toEqual(
      expect.objectContaining({ message: `Expected value of type "UUIDv4!", found "${id}".` }),
    )
  })
})
