# TypeScript Naming Convention Checker

A lightweight VSCode extension that enforces naming conventions for constants and functions in TypeScript files using AST analysis.


# Features

- Checks naming conventions for `const` declarations with primitive values (string, number, boolean)
- Checks naming conventions for function declarations, arrow functions, and function expressions
- Real-time diagnostics on file open, save, and editor switch
- Supports `.ts` and `.tsx` files
- Fully configurable rules and severity levels


# What Gets Checked

1.Constants (default: `UPPER_SNAKE_CASE`)

Variables declared with `const` and assigned a primitive literal value:

```typescript
// Pass
const MAX_RETRY = 3;
const API_URL = "https://example.com";
const IS_DEBUG = true;

// Fail
const maxRetry = 3;
const apiUrl = "https://example.com";
```

2.Functions (default: `camelCase`)

Function declarations, arrow functions, and function expressions:

```typescript
// Pass
function fetchData() {}
const getData = () => {};
const handleClick = function () {};

// Fail
function FetchData() {}
function fetch_data() {}
const GetData = () => {};
```

3.Ignored Patterns

The following are intentionally skipped:

- Array literals &mdash; `const list = [1, 2, 3];`
- Object literals &mdash; `const config = { key: "value" };`
- Destructuring &mdash; `const { name } = obj;`
- Template literals &mdash; `` const tpl = `hello`; ``
- `as const` assertions &mdash; `const arr = [1, 2] as const;`
- Class methods
- Enum and interface declarations


# Extension Settings

Configure in `settings.json`:

`namingConventionChecker.constantCase` 
default : `UPPER_SNAKE_CASE`
choose : `UPPER_SNAKE_CASE` or `camelCase` or `PascalCase`

`namingConventionChecker.functionCase`
default : `camelCase`
choose : `UPPER_SNAKE_CASE` or `camelCase` or `PascalCase`

`namingConventionChecker.severity`
default : `Warning`
choose : `Error` or `Warning` or `Information` or `Hint`


# Example

```json
{
  "namingConventionChecker.constantCase": "UPPER_SNAKE_CASE",
  "namingConventionChecker.functionCase": "camelCase",
  "namingConventionChecker.severity": "Error"
}
```


# How It Works

This extension parses TypeScript source files into an AST using the TypeScript Compiler API (`ts.createSourceFile`) and walks the tree to classify each declaration. No regex-based source scanning is used — all checks are performed on the parsed syntax tree for accuracy.


# License

MIT
