# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-async-provider@1.0.5...@sclable/nestjs-async-provider@2.0.0) (2026-04-10)

- feat!: upgrade to NestJS 11 ([ef1b4dc](https://github.com/sclable/nestjs-libs/commit/ef1b4dc81b2f0c1f254c02894148c0a789073543))

### BREAKING CHANGES

- peer dependencies now require NestJS ^11. NestJS <11 is no longer supported.

* Upgrade @nestjs/\* packages to v11
* Upgrade @nestjs/apollo to v13 with @apollo/server v5
* Add @as-integrations/express5 peer dep (required by @nestjs/apollo@13)
* Update ExplorerService to return InstanceWrapper[] (cqrs v11 API)
* Update RateLimitedEventBus.bind() to accept InstanceWrapper<IEventHandler>
* Fix PassportStrategy validate() visibility: protected -> public
* Fix RequestUser decorator to use ExecutionContext API properly
* Fix strict type issues in JWT/Keycloak strategies from stricter typings
* Add uuid devDep (no longer transitively available)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## [1.0.5](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-async-provider@1.0.4...@sclable/nestjs-async-provider@1.0.5) (2024-09-11)

**Note:** Version bump only for package @sclable/nestjs-async-provider

## [1.0.4](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-async-provider@1.0.3...@sclable/nestjs-async-provider@1.0.4) (2021-11-12)

**Note:** Version bump only for package @sclable/nestjs-async-provider

## [1.0.3](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-async-provider@1.0.2...@sclable/nestjs-async-provider@1.0.3) (2021-11-11)

**Note:** Version bump only for package @sclable/nestjs-async-provider

## [1.0.2](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-async-provider@1.0.1...@sclable/nestjs-async-provider@1.0.2) (2021-11-11)

**Note:** Version bump only for package @sclable/nestjs-async-provider

## 1.0.1 (2021-11-09)

**Note:** Version bump only for package @sclable/nestjs-async-provider
