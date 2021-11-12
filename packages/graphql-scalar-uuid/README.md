# nestjs-graphql-scalar-uuid

UUID validation for @nestjs/graphql

## Install

```shell
npm install @sclable/nestjs-graphql-scalar-uuid
```

## Usage

Add scalar to graphql file

```graphql
scalar UUIDv4
```

Add to providers

```typescript
@Module({
  ...
  providers: [UUIDv4Scalar]
})
```
