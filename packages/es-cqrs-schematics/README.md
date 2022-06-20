# Schematics try-out and generator for the ES/CQRS library

## Usage

Create a JSON file with your configuration. Check the schema: `src/es-cqrs/schema.json`.

Example: new-command.json

```json
{
  "moduleName": "main",
  "verb": "do",
  "subject": "stuff again",
  "parameters": [
    {
      "name": "param1",
      "type": "string"
    },
    {
      "name": "param2",
      "type": "ImportedParameter",
      "importPath": "imported-params"
    }
  ]
}
```

Install schematics and this project:

```bash
npm i -g @angular-devkit/schematics-cli
npm i @sclable/es-cqrs-schematics
```

Run `schematics` in your code to create a command-event chain

```bash
schematics @sclable/es-cqrs-schematics:json new-command.json all
```

There are targets other than `all` but they may need a different
*JSON Schema* which can be read from the source.

Example: to only create a command, you can use the upper mentioned
JSON file with the `command` target or check `src/es-cqrs/command/command.schema.json`
and run your JSON with the `command-standalone` target.

## Additional features

### REST-API generation

Use the collection `all-rest` to create *nestjs controllers* as well. For create operation it will generate
`Post` endpoints that returns the new ID, for other modification it will `Put` endpoint with `/:id` as parameter
and returns nothing

### Graphql generation

TBD

## Examples and recommendations

### Aggregate creation

Usually there is no ID associated with a creation, only a user, so the system can assign and return a new ID.
To help with this logic this schematics can generate create component with UUID generation. It will create such
components if the `verb` is one of `[add, create, new, insert]` and the `subject` is the same as the `moduleName`

### Aggregate member generation

If needed this schematics can generate member properties for the aggregate and will set their value from the
events (otherwise handler contain just `/* no-op */` placeholder). To achieve this, set `isMember` to `true`
for the parameter that needs a member created.

### Using object parameters

If the mutation uses a single object parameter and not a list of primitive types, set `isExistingObject` to `true`.
This will generate proper value assignments.
