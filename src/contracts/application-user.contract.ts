export interface ApplicationUserContract {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  id: string | number
  externalId?: string | number
  name?: string
  username?: string
  email?: string
}
