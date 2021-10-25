import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const IS_LOCAL_AUTH = 'isLocalAuth'
export const LocalAuth = (): CustomDecorator<string> => SetMetadata(IS_LOCAL_AUTH, true)
