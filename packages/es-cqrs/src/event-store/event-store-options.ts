import { ModuleMetadata, Type } from '@nestjs/common/interfaces'

/** @hidden */
export const EVENT_STORE_OPTIONS = 'EventStoreOptions'

export interface EventStoreOptions {
  /**
   * Default snapshot interval is **5** events by aggregate
   */
  snapshotInterval?: number

  /**
   * Enables logging to the @nestjs logger
   */
  logging?: boolean

  /**
   * Enables logging of exceptions
   */
  debug?: boolean
}

/**
 * Implement this factory interface to create a options for the event store
 *
 * Example:
 * ```
 * class OptionsFactory implements EventStoreOptionsFactory {
 *   public async createEventStoreOptions() {
 *     return { logging: true }
 *   }
 * }
 * ```
 */
export interface EventStoreOptionsFactory {
  createEventStoreOptions(): Promise<EventStoreOptions> | EventStoreOptions
}

/**
 * Asyncronous options for the event store
 *
 * Example (`useFactory`): `app.module.ts`
 * ```
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRootAsync({
 *       inject: [GlobalOptionsProvider]
 *       useFactory: async (globalOptions: GlobalOptionsProvider) => {
 *         return await globalOptions.getEventStoreOptions()
 *       }
 *     }),
 *     MyModule,
 *   ]
 * })
 * ```
 *
 * Example (`useClass` / `useExisting`): `app.module.ts`
 * ```
 * class OptionsFactory implements EventStoreOptionsFactory {
 *   public async createEventStoreOptions() {
 *     return { logging: true }
 *   }
 * }
 *
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRootAsync({
 *       useClass: OptionsFactory
 *     }),
 *     MyModule,
 *   ]
 * })
 * ```
 *
 * It is also possible to add additional imports for the options factory if the service required is in another module
 *
 * Example (`imports`): `app.module.ts`
 * ```
 * @Module({
 *   imports: [
 *     ESCQRSModule.forRootAsync({
 *       imports: [GlobalOptionsModule]
 *       inject: [GlobalOptionsProvider]
 *       useFactory: async (globalOptions: GlobalOptionsProvider) => {
 *         return await globalOptions.getEventStoreOptions()
 *       }
 *     }),
 *     MyModule,
 *   ]
 * })
 * ```
 */
export interface EventStoreAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[]
  useClass?: Type<EventStoreOptionsFactory>
  useExisting?: Type<EventStoreOptionsFactory>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory?: (...args: any[]) => Promise<EventStoreOptions> | EventStoreOptions
}
