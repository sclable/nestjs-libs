# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [8.0.2](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-es-cqrs@8.0.1...@sclable/nestjs-es-cqrs@8.0.2) (2021-11-11)

**Note:** Version bump only for package @sclable/nestjs-es-cqrs





## [8.0.1](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-es-cqrs@8.0.0...@sclable/nestjs-es-cqrs@8.0.1) (2021-11-11)

**Note:** Version bump only for package @sclable/nestjs-es-cqrs





# [8.0.0](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-es-cqrs@7.0.0...@sclable/nestjs-es-cqrs@8.0.0) (2021-11-11)


### chore

* **es-cqrs:** add version 8 ([75d5683](https://github.com/sclable/nestjs-libs/commit/75d568317b64c09794bac295a729ce81b47d41db))


### BREAKING CHANGES

* **es-cqrs:** minimum nestjs version is increased to v8
no actual breaking changes in the API





# [7.0.0](https://github.com/sclable/nestjs-libs/compare/@sclable/nestjs-es-cqrs@6.0.1...@sclable/nestjs-es-cqrs@7.0.0) (2021-11-11)


### chore

* **es-cqrs:** add version 7 ([8e717eb](https://github.com/sclable/nestjs-libs/commit/8e717ebe231101c52c9d7e61c6f65949667a2fed))


### BREAKING CHANGES

* **es-cqrs:** * minimum *nestjs* version is increased to v7
* no actual breaking changes in the API





## 6.0.1 (2021-11-11)

**Note:** Version bump only for package @sclable/nestjs-es-cqrs





## [3.1.4](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@3.1.3...@sclable-platform/es-cqrs@3.1.4) (2021-11-05)


### Bug Fixes

* **deps:** update dependency uuid to ^8.3.2 ([a1bb4c2](https://git.sclable.com/sclable-platform/ts-monorepo/commits/a1bb4c24b1316ee627808896bf89dd7ca663b4f4))





## [3.1.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@3.1.2...@sclable-platform/es-cqrs@3.1.3) (2021-10-27)

**Note:** Version bump only for package @sclable-platform/es-cqrs





## [3.1.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@3.1.1...@sclable-platform/es-cqrs@3.1.2) (2021-10-27)

**Note:** Version bump only for package @sclable-platform/es-cqrs





## [3.1.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@3.1.0...@sclable-platform/es-cqrs@3.1.1) (2021-10-27)

**Note:** Version bump only for package @sclable-platform/es-cqrs





# [3.1.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@3.0.1...@sclable-platform/es-cqrs@3.1.0) (2021-09-17)


### Features

* **replay:** use paging for replaying large amount of events ([a4ba41f](https://git.sclable.com/sclable-platform/ts-monorepo/commits/a4ba41fc21162ef98e21aed3bdf39422a28c1c6c))





## [3.0.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@3.0.0...@sclable-platform/es-cqrs@3.0.1) (2021-09-14)


### Bug Fixes

* **es-cqrs:** enable omitting user for Repository.find() ([e983584](https://git.sclable.com/sclable-platform/ts-monorepo/commits/e98358472b24e512ade4b115a5f3470a5bfca767))





# [3.0.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@2.2.3...@sclable-platform/es-cqrs@3.0.0) (2021-09-14)


### Features

* **es-cqrs:** remove wolkenkit (fix publish) ([c8f0d35](https://git.sclable.com/sclable-platform/ts-monorepo/commits/c8f0d35731aa47e8c7e0728ce4e1848c7b8c3026))


### BREAKING CHANGES

* **es-cqrs:** Wolkenkit removed

* removed UserAwareEvent: use Event
* removed UsedAwareAggregate: use Aggregate
* removed Constructible: use EventConstructor or AggregateConstructor
* removed @EventsForModule decorator
* new required fields are added to Event interface
* Wolkenkit event-store no longer available as default store, the
default store is an in-memory implementation
* EventStoreOptions no longer contains Wolkenkit related options
* Event.metadata is no longer available as it was a Wolkenkit property





## [2.2.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable-platform/es-cqrs@4.0.2...@sclable-platform/es-cqrs@2.2.3) (2021-09-13)

**Note:** Version bump only for package @sclable-platform/es-cqrs





## [2.2.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.2.1...@sclable/es-cqrs@2.2.2) (2021-06-16)

**Note:** Version bump only for package @sclable/es-cqrs





## [2.2.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.2.0...@sclable/es-cqrs@2.2.1) (2021-06-10)


### Bug Fixes

* **es-cqrs:** enable usage of async provider as event-store ([b00b990](https://git.sclable.com/sclable-platform/ts-monorepo/commits/b00b99099152c76c2352d5f84dd24667b35b5d28))





# [2.2.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.1.4...@sclable/es-cqrs@2.2.0) (2021-06-09)


### Features

* **es-cqrs:** enable the use of different event-store ([27ca023](https://git.sclable.com/sclable-platform/ts-monorepo/commits/27ca0230a0d85d53401f209d5fe5c6f35aece768))





## [2.1.4](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.1.3...@sclable/es-cqrs@2.1.4) (2021-05-28)


### Bug Fixes

* fix eslint ([8f74611](https://git.sclable.com/sclable-platform/ts-monorepo/commits/8f74611e78b85f795f10105d55d44948995ccbc2))





## [2.1.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.1.2...@sclable/es-cqrs@2.1.3) (2020-09-03)

**Note:** Version bump only for package @sclable/es-cqrs





## [2.1.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.1.1...@sclable/es-cqrs@2.1.2) (2020-08-10)

**Note:** Version bump only for package @sclable/es-cqrs





## [2.1.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.1.0...@sclable/es-cqrs@2.1.1) (2020-07-13)

**Note:** Version bump only for package @sclable/es-cqrs





# [2.1.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.0.1...@sclable/es-cqrs@2.1.0) (2020-07-13)


### Features

* **eslint-config:** detect vue import alias, alpabetize imports in group ([eb77108](https://git.sclable.com/sclable-platform/ts-monorepo/commits/eb77108a863de70387e40ce2937168148802539e))





## [2.0.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@2.0.0...@sclable/es-cqrs@2.0.1) (2020-07-07)


### Bug Fixes

* **es-cqrs:** save aggregate with events ([f84181e](https://git.sclable.com/sclable-platform/ts-monorepo/commits/f84181e447e75bfab3324c9f1af6d21aed293d67))





# [2.0.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.7...@sclable/es-cqrs@2.0.0) (2020-07-03)


### Bug Fixes

* **es-cqrs:** adjust wolkenkit events ([c9bce7a](https://git.sclable.com/sclable-platform/ts-monorepo/commits/c9bce7a27c8f076f8c7f54409071a8538ad7cef2))


### Documentation

* **es-cqrs:** add upgrade guide ([b8e94d4](https://git.sclable.com/sclable-platform/ts-monorepo/commits/b8e94d4530b2ecdf24c8cfeed6823dbc43f8f7ba))


### BREAKING CHANGES

* **es-cqrs:** Database migration necessary





## [1.4.7](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.6...@sclable/es-cqrs@1.4.7) (2020-04-01)


### Bug Fixes

* **es-cqrs:** adjust lib to wolkenkit-eventstore@2.6.0 ([d867fdd](https://git.sclable.com/sclable-platform/ts-monorepo/commits/d867fddbf8db8ad807f967a9df4f797b5c78759b))





## [1.4.6](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.5...@sclable/es-cqrs@1.4.6) (2020-01-28)


### Bug Fixes

* **event-store:** adjust to changed wolkenkit event store interfaces ([a61229c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/a61229c928c892e8e0ee4590e7060f24ed2db538))





## [1.4.5](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.4...@sclable/es-cqrs@1.4.5) (2020-01-27)

**Note:** Version bump only for package @sclable/es-cqrs





## [1.4.4](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.3...@sclable/es-cqrs@1.4.4) (2019-12-10)

**Note:** Version bump only for package @sclable/es-cqrs





## [1.4.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.2...@sclable/es-cqrs@1.4.3) (2019-09-24)


### Bug Fixes

* **ci:** add quotes ([3b5da4c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/3b5da4c))





## [1.4.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.1...@sclable/es-cqrs@1.4.2) (2019-09-03)

**Note:** Version bump only for package @sclable/es-cqrs





## [1.4.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.4.0...@sclable/es-cqrs@1.4.1) (2019-09-02)

**Note:** Version bump only for package @sclable/es-cqrs





# [1.4.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.3.0...@sclable/es-cqrs@1.4.0) (2019-08-23)


### Features

* **es-cqrs:** expose event timestamp ([48ee383](https://git.sclable.com/sclable-platform/ts-monorepo/commits/48ee383))





# [1.3.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.2.1...@sclable/es-cqrs@1.3.0) (2019-08-14)


### Features

* **es-cqrs:** add replay finished event, queue replayed events ([aaf597b](https://git.sclable.com/sclable-platform/ts-monorepo/commits/aaf597b))
* **es-cqrs:** save aggregate name into events ([a8107dc](https://git.sclable.com/sclable-platform/ts-monorepo/commits/a8107dc))





## [1.2.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.2.0...@sclable/es-cqrs@1.2.1) (2019-08-12)

**Note:** Version bump only for package @sclable/es-cqrs





# [1.2.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.1.4...@sclable/es-cqrs@1.2.0) (2019-08-01)


### Features

* **es-cqrs:** make more verbose exceptions ([177f814](https://git.sclable.com/sclable-platform/ts-monorepo/commits/177f814))





## [1.1.4](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.1.3...@sclable/es-cqrs@1.1.4) (2019-07-31)


### Bug Fixes

* **es-cqrs:** fix initial aggregate revision ([c825e93](https://git.sclable.com/sclable-platform/ts-monorepo/commits/c825e93))





## [1.1.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.1.2...@sclable/es-cqrs@1.1.3) (2019-07-31)


### Bug Fixes

* **es-cqrs:** add missing exports to index ([526beab](https://git.sclable.com/sclable-platform/ts-monorepo/commits/526beab))
* **es-cqrs:** fix aggregate lookup ([f124eb6](https://git.sclable.com/sclable-platform/ts-monorepo/commits/f124eb6))





## [1.1.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.1.1...@sclable/es-cqrs@1.1.2) (2019-07-29)


### Bug Fixes

* **repository:** apply events with revision after snapshot ([a2f9b9a](https://git.sclable.com/sclable-platform/ts-monorepo/commits/a2f9b9a))





## [1.1.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.1.0...@sclable/es-cqrs@1.1.1) (2019-07-10)

**Note:** Version bump only for package @sclable/es-cqrs





# [1.1.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.0.3...@sclable/es-cqrs@1.1.0) (2019-07-08)


### Features

* **es-cqrs:** add replay all method ([ceb4cf2](https://git.sclable.com/sclable-platform/ts-monorepo/commits/ceb4cf2))





## [1.0.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.0.2...@sclable/es-cqrs@1.0.3) (2019-07-01)

**Note:** Version bump only for package @sclable/es-cqrs





## [1.0.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@1.0.1...@sclable/es-cqrs@1.0.2) (2019-07-01)


### Bug Fixes

* resolved many linting issues ([233cd8d](https://git.sclable.com/sclable-platform/ts-monorepo/commits/233cd8d))





## [1.0.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.13.3...@sclable/es-cqrs@1.0.1) (2019-06-18)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.13.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.13.2...@sclable/es-cqrs@0.13.3) (2019-06-18)


### Bug Fixes

* **lint:** autofix many ESLint errors ([0ce61a2](https://git.sclable.com/sclable-platform/ts-monorepo/commits/0ce61a2))





## [0.13.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.13.1...@sclable/es-cqrs@0.13.2) (2019-06-17)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.13.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.13.0...@sclable/es-cqrs@0.13.1) (2019-06-04)


### Bug Fixes

* resolve some SonarQube issues ([825330b](https://git.sclable.com/sclable-platform/ts-monorepo/commits/825330b))





# [0.13.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.8...@sclable/es-cqrs@0.13.0) (2019-05-29)


### Bug Fixes

* **es-cqrs:** fix nest update problems ([3b0f76c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/3b0f76c))


### Features

* **event-store:** add revision conflict exception, remove error logging ([535d87c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/535d87c))





## [0.12.8](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.7...@sclable/es-cqrs@0.12.8) (2019-05-24)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.12.7](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.3...@sclable/es-cqrs@0.12.7) (2019-05-14)


### Bug Fixes

* **es-cqrs:** name changes in NestJS 6 ([e81bc8c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/e81bc8c))





## [0.12.6](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.5...@sclable/es-cqrs@0.12.6) (2019-05-02)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.12.5](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.4...@sclable/es-cqrs@0.12.5) (2019-05-02)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.12.4](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.3...@sclable/es-cqrs@0.12.4) (2019-05-02)


### Bug Fixes

* **es-cqrs:** name changes in NestJS 6 ([e81bc8c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/e81bc8c))





## [0.12.3](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.2...@sclable/es-cqrs@0.12.3) (2019-04-29)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.12.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.0...@sclable/es-cqrs@0.12.2) (2019-04-23)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.12.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.12.0...@sclable/es-cqrs@0.12.1) (2019-04-23)

**Note:** Version bump only for package @sclable/es-cqrs





# [0.12.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.11.2...@sclable/es-cqrs@0.12.0) (2019-04-04)


### Bug Fixes

* **event-store:** handle wolkenkit exceptions ([dcbffb6](https://git.sclable.com/sclable-platform/ts-monorepo/commits/dcbffb6))
* **snapshot:** deep clone aggregate for snapshot ([48f5330](https://git.sclable.com/sclable-platform/ts-monorepo/commits/48f5330))


### Features

* add user aware components ([e662153](https://git.sclable.com/sclable-platform/ts-monorepo/commits/e662153))
* **event-store:** close down event-store on module destroy ([13d161c](https://git.sclable.com/sclable-platform/ts-monorepo/commits/13d161c))





## [0.11.2](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.11.1...@sclable/es-cqrs@0.11.2) (2019-04-02)


### Bug Fixes

* **es-cqrs:** type fix InjectRepository decorator ([098cb31](https://git.sclable.com/sclable-platform/ts-monorepo/commits/098cb31))





## [0.11.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/@sclable/es-cqrs@0.11.0...@sclable/es-cqrs@0.11.1) (2019-03-20)


### Bug Fixes

* **ci:** attempt to fix authentication issues ([3eb6a91](https://git.sclable.com/sclable-platform/ts-monorepo/commits/3eb6a91))





# 0.11.0 (2019-03-20)



## 0.10.9 (2019-03-18)


### Bug Fixes

* **es-cqrs:** make custom property default to empty object ([78524d7](https://git.sclable.com/sclable-platform/ts-monorepo/commits/78524d7))



## 0.10.8 (2019-03-15)


### Bug Fixes

* **es-cqrs:** find aggregate without snapshot ([59f850b](https://git.sclable.com/sclable-platform/ts-monorepo/commits/59f850b))



## 0.10.7 (2019-03-13)



## 0.10.4 (2019-03-08)


### Bug Fixes

* **es-cqrs:** restore custom event options from event store ([f55d5bf](https://git.sclable.com/sclable-platform/ts-monorepo/commits/f55d5bf))



## 0.10.3 (2019-03-07)


### Features

* **es-cqrs:** add option to skip queue, or queue by custom ID ([c30b6b4](https://git.sclable.com/sclable-platform/ts-monorepo/commits/c30b6b4))



## 0.10.2 (2019-03-06)


### Features

* **es-cqrs:** rate-limited event bus ([9565078](https://git.sclable.com/sclable-platform/ts-monorepo/commits/9565078))



## 0.10.1 (2019-03-01)



# 0.10.0 (2019-02-28)


### Features

* **es-cqrs:** enable async options ([cf1bb0a](https://git.sclable.com/sclable-platform/ts-monorepo/commits/cf1bb0a))



## 0.9.1 (2019-02-06)


### Bug Fixes

* **es-cqrs:** change repository internal name ([64f8c17](https://git.sclable.com/sclable-platform/ts-monorepo/commits/64f8c17)), closes [#24](https://git.sclable.com/sclable-platform/ts-monorepo/issues/24) [#23](https://git.sclable.com/sclable-platform/ts-monorepo/issues/23)



# 0.9.0 (2019-02-04)


### Features

* **es-cqrs:** Introduce es-cqrs library for future [@nestjs](https://git.sclable.com/nestjs) projects ([f92551d](https://git.sclable.com/sclable-platform/ts-monorepo/commits/f92551d))





## [0.10.9](https://sclable/sclable-platform/ts-monorepo/compare/v0.10.8...v0.10.9) (2019-03-18)


### Bug Fixes

* **es-cqrs:** make custom property default to empty object ([78524d7](https://sclable/sclable-platform/ts-monorepo/commits/78524d7))





## [0.10.8](https://git.sclable.com/sclable-platform/ts-monorepo/compare/v0.10.7...v0.10.8) (2019-03-15)


### Bug Fixes

* **es-cqrs:** find aggregate without snapshot ([59f850b](https://git.sclable.com/sclable-platform/ts-monorepo/commits/59f850b))





## [0.10.7](https://git.sclable.com/sclable-platform/ts-monorepo/compare/v0.10.4...v0.10.7) (2019-03-13)

**Note:** Version bump only for package @sclable/es-cqrs





## [0.10.4](https://git.sclable.com/sclable-platform/ts-monorepo/compare/v0.10.3...v0.10.4) (2019-03-08)


### Bug Fixes

* **es-cqrs:** restore custom event options from event store ([f55d5bf](https://git.sclable.com/sclable-platform/ts-monorepo/commits/f55d5bf))





## [0.10.3](https://git.sclable.com/sclable-platform/js-essentials-generator/compare/v0.10.2...v0.10.3) (2019-03-07)


### Features

* **es-cqrs:** add option to skip queue, or queue by custom ID ([c30b6b4](https://git.sclable.com/sclable-platform/js-essentials-generator/commits/c30b6b4))





## [0.10.2](https://git.sclable.com/sclable-platform/js-essentials-generator/compare/v0.10.1...v0.10.2) (2019-03-06)


### Features

* **es-cqrs:** rate-limited event bus ([9565078](https://git.sclable.com/sclable-platform/js-essentials-generator/commits/9565078))





## [0.10.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/v0.10.0...v0.10.1) (2019-03-01)

**Note:** Version bump only for package @sclable/es-cqrs





# [0.10.0](https://git.sclable.com/sclable-platform/ts-monorepo/compare/v0.9.1...v0.10.0) (2019-02-28)


### Features

* **es-cqrs:** enable async options ([cf1bb0a](https://git.sclable.com/sclable-platform/ts-monorepo/commits/cf1bb0a))





## [0.9.1](https://git.sclable.com/sclable-platform/ts-monorepo/compare/v0.9.0...v0.9.1) (2019-02-06)


### Bug Fixes

* **es-cqrs:** change repository internal name ([64f8c17](https://git.sclable.com/sclable-platform/ts-monorepo/commits/64f8c17)), closes [#24](https://git.sclable.com/sclable-platform/ts-monorepo/issues/24) [#23](https://git.sclable.com/sclable-platform/ts-monorepo/issues/23)
