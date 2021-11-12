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
