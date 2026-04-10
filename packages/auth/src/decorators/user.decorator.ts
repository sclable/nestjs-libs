import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const RequestUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const type = ctx.getType<'http' | 'graphql' | 'ws'>()
  if (type === 'http') {
    return ctx.switchToHttp().getRequest<{ user?: unknown }>().user
  }

  // GraphQL context: args[2] is { req, res, ... }
  const [, , gqlCtx] =
    ctx.getArgs<[unknown, unknown, { req?: { user?: unknown }; user?: unknown }]>()

  return gqlCtx?.req?.user ?? gqlCtx?.user
})
