export interface CustomEventOptions {
  /**
   * Custom ID to use for the event-handler queue
   *
   * Useful to group together event-handlers that belong to different aggregates but depend on each other
   */
  queueById?: string

  /** Skip the event-handler from queueing */
  skipQueue?: boolean

  /** Version of the event */
  version?: number
}
