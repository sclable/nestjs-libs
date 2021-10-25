import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_ENDPOINT = 'isPublicEndpoint'
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_ENDPOINT, true)
