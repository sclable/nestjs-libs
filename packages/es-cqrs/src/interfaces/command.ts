import { ICommand as INestCommand } from '@nestjs/cqrs'

/**
 * Command interface
 *
 * Implement this to create unique commands. There is no restriction on what the command class can have.
 *
 * Example:
 * ```typescript
 * import { Command } from '@sclable/es-cqrs'
 * import { v4 } from 'uuid'
 *
 * export class CreateAccountCommand implements Command {}
 *
 * export class AccountNameChangeCommand implements Command {
 *   public constructor(public readonly id: string, public readonly name: string) {}
 * }
 * ```
 *
 * To handle these commands implement the `ICommandHandler` interface so that it finds or creates the needed aggregate,
 * call the modifying method that will create the event and persist the aggregate in the repository. The `resolve`
 * method should return the object needed for this command to finish (usually an ID).
 *
 * Example:
 * ```typescript
 * import { CommandHandler, ICommandHandler, InjectRepository, Repository } from '@sclable/es-cqrs'
 * import { AccountNameChangeCommand } from './commands'
 * import { AccountAggregate } from './aggregates'
 *
 * @CommandHandler(AccountNameChangeCommand)
 * export class SomeCommandHandler implements ICommandHandler<AccountNameChangeCommand> {
 *
 *   public constructor(@InjectRepository(AccountAggregate) private readonly repo: Repository<AccountAggregate>) {}
 *
 *   async execute(command: AccountNameChangeCommand): Promise<any> {
 *     const agg = await this.repo.find(command.id)
 *     agg.changeName(command.name)
 *     return this.repo.persist(agg)
 *   }
 * }
 * ```
 */
export type Command = INestCommand
