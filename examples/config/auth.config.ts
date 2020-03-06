// Remove linting comments in real application!
// @ts-ignore
import { registerAs } from '@nestjs/config'

// eslint-disable-next-line import/no-default-export
export default registerAs('auth', () => ({
  loglevel: process.env.AUTH_LOGLEVEL || 'error',
  testEndpointEnabled: process.env.AUTH_TEST_ENDPOINT_ENABLED === 'true',
  clientId: process.env.AUTH_CLIENT_ID,
  jwtSecret: process.env.AUTH_JWT_SECRET,
  jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN,
  providerUrl: process.env.AUTH_PROVIDER_URL,
  providerRealm: process.env.AUTH_PROVIDER_REALM,
  providerAdminUser: process.env.AUTH_PROVIDER_USER,
  providerAdminPassword: process.env.AUTH_PROVIDER_PASSWORD,
}))
