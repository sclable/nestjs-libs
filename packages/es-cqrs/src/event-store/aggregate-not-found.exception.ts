/**
 * Exception for missing aggregate
 */
export class AggregateNotFoundException extends Error {
  public constructor(public readonly id: string) {
    super('Cannot find aggregate')
  }
}
