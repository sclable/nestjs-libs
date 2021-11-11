/**
 * Options to filter replayable events
 *
 * Filters are applied with AND between them
 */
export interface ReplayOptions {
  /** Minimun position is 1, filter is expected to be inclusive */
  fromPosition?: number
  /** Maximum position is MAX_INT, filter is expected to be inclusive */
  toPosition?: number
  aggregateId?: string
  aggregateType?: string
  /** Minimun revision is 1, filter is expected to be inclusive */
  fromRevision?: number
  /** Maximum revision is MAX_INT, filter is expected to be inclusive */
  toRevision?: number
  eventName?: string
  /** Minimun date is epoch, filter is expected to be inclusive */
  fromDate?: Date
  /** Maximum date is now, filter is expected to be inclusive */
  toDate?: Date
  /**
   * If paging size is not given, the default is 1000
   *
   * Please choose a number suitable for your application and DB
   */
  pagingSize?: number
}
