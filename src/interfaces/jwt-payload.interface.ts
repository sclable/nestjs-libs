export interface JwtPayload {
  sub?: string
  jti?: string
  exp?: number
  name?: string
  email?: string
}
