import { createParamDecorator } from '@nestjs/common'

export const RequestUser = createParamDecorator((_, req) => {
  if (Array.isArray(req)) {
    const [
      ,
      ,
      {
        req: { user },
      },
    ] = req

    return user
  }

  return req.user
})
