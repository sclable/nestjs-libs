// https://github.com/cszatmary/passport-mock-strategy

import { Request } from 'express'
import { Strategy } from 'passport'

import { User, mockUser } from './mock-user'

export interface PassportMockStrategyOptions {
  name?: string
  user?: User
  passReqToCallback?: true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DoneCallback = (error: Error, user?: User, info?: any) => void

export interface VerifyFunction {
  (req: Request, user: User, done: DoneCallback): void
  (user: User, done: DoneCallback): void
}

/**
 * Mock Passport Strategy for testing purposes.
 * @extends Strategy
 */
export class PassportMockStrategy extends Strategy {
  private _user: User
  private _verify?: VerifyFunction
  private _passReqToCallback: boolean
  /**
   * The PassportMockStrategy constructor.
   *
   * This allows you to test authenticated routes using a mock strategy.
   * It will automatically authenticate a mock user which then allows the
   * functionality of authenticated routes to be tested independent of
   * the authentication process.
   *
   * Note: This strategy is meant for testing purposes only.
   * It provides no actually security.
   *
   * Optionally an `options` object can be passed to custom configure the Strategy.
   * options = {
   *  name: String - The name of the strategy, defaults to 'mock'
   *  user: Object - The mock user to be authenticated, defaults to ./mock-user.js
   *  passReqToCallback: Boolean - When true `req` is the first argument to the
   *                                  verify callback, defaults to false
   * }
   *
   * A `verify` callback can also optionally passed which accepts `user`
   * which is the user that was authenticated and then calls the `done`
   * callback supplying a `user`. Optionally an error can be set as the
   * first argument in `done` if needed for testing.
   *
   * Calling the constructor with no parameters while create a default mock
   * strategy which a mock user exported from `./mock-user.js`.
   *
   *  @param {Object} options
   *  @param {Function} verify
   */
  public constructor(options?: PassportMockStrategyOptions, verify?: VerifyFunction) {
    // Allows verify to be passed as the first parameter and options skipped
    if (typeof options === 'function') {
      verify = options
      options = undefined
    }

    options = options || {}

    super()
    this.name = options.name || 'mock'
    this._user = options.user || mockUser
    this._verify = verify
    this._passReqToCallback = options.passReqToCallback || false
  }

  /**
   * Authenticate request. Always authenticates successfully by default
   * unless instructed otherwise through `verify` callback that was
   * passed to the constructor.
   *
   * @param {Object} req
   */
  public authenticate(req?: Request): void {
    // If no verify callback was specified automatically authenticate
    if (!this._verify) {
      this.success(this._user)

      return
    }

    const verified: DoneCallback = (error, user, info): void => {
      if (error) {
        this.error(error)

        return
      }

      if (!user) {
        this.fail(info)

        return
      }

      this.success(user, info)
    }

    try {
      if (this._passReqToCallback && req) {
        this._verify(req, this._user, verified)
      } else {
        this._verify(this._user, verified)
      }
    } catch (err) {
      this.error(err)

      return
    }
  }
}
