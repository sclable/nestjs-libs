# NestJS Library Collection
This [monolithic repository][monolithic_repository] provides essential packages for developing NestJS based applications.

To manage packages in this repository, we use [Lerna][lerna.js]. Consider reading the docs.

## Packages
* [Authentication](./packages/auth/README.md) (@sclable/nestjs-auth)
* [Storage](./packages/storage/README.md) (@sclable/nestjs-storage)
* [Queue](./packages/queue/README.md) (@sclable/nestjs-queue)

## Setup GitHub registry

Create a github [Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)

Edit local `~/.npmrc`. You have to comment out our Sclable registry with `#`
```
@sclable:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken="<token>"
```

## Contribution

See our [CONTRIBUTING](CONTRIBUTING.md) guide!

[monolithic_repository]: https://en.wikipedia.org/wiki/Codebase#Distinct_and_monolithic_codebases
[lerna.js]: https://lernajs.io
