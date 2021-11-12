import { Scalar } from '@nestjs/graphql'

import { UUIDScalar } from './uuid-scalar'

@Scalar('UUIDv3')
export class UUIDv3Scalar extends UUIDScalar {
  public description = 'UUID v3 custom scalar type'

  public constructor() {
    super('3')
  }
}

@Scalar('UUIDv4')
export class UUIDv4Scalar extends UUIDScalar {
  public description = 'UUID v4 custom scalar type'

  public constructor() {
    super('4')
  }
}

@Scalar('UUIDv5')
export class UUIDv5Scalar extends UUIDScalar {
  public description = 'UUID v5 custom scalar type'

  public constructor() {
    super('5')
  }
}
