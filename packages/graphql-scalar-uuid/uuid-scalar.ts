import { isUUID } from 'class-validator'
import { ASTNode, Kind } from 'graphql'

type UUIDVersion = '3' | '4' | '5'

export class UUIDScalar {
  protected constructor(private version: UUIDVersion) {}

  public parseValue(value: string): string {
    if (!isUUID(value, this.version)) {
      throw new TypeError(`UUID cannot represent non-UUID value: ${value}`)
    }

    return value.toLowerCase()
  }

  public serialize(value: string): string {
    return this.parseValue(value)
  }

  public parseLiteral(ast: ASTNode): string | undefined {
    if (ast.kind !== Kind.STRING || !isUUID(ast.value, this.version)) {
      return undefined
    }

    return ast.value
  }
}
