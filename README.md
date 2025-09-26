# todotxt-utils

Utility functions for working with the todo.txt format.
Provides simple helpers for parsing, inspecting, and modifying todo.txt task strings.

This package is plain ESM JavaScript — no dependencies, no frameworks.

## Installation

```bash
npm install todotxt-utils
```

or with pnpm:

```bash
pnpm add todotxt-utils
```

## Usage

````js
import { getContexts, getProjects, getKeyValues } from "todotxt-utils";

const task = "Call Bob @home @phone +work due:2025-06-07";

// Extract simple lists
console.log(getContexts(task)); // ["home", "phone"]
console.log(getProjects(task)); // ["work"]
console.log(getKeyValues(task)); 
// [{key:"due", value:"2025-06-07"}]

// Extract spans (with start/end positions and raw text)
console.log(getContexts(task, { withSpans: true }));
/* [
  { value:"home", raw:" @home", start:8, end:14 },
  { value:"phone", raw:" @phone", start:14, end:21 }
] */
```

## API Overview

### Parsing

- `isCompleted(task): boolean`
- `getCompletionDate(task): string|null`
- `getCreationDate(task): string|null`
- `getPriority(task): string|null`
- `getProjects(task): string[]`
- `getContexts(task): string[]`
- `getKeyValues(task): Record<string,string>`
- `getValue(task, key): string|null`

### Modification

- `markCompleted(task, date?)`
- `markIncomplete(task)`
- `setPriority(task, letter|null)`
- `addProject(task, project) / removeProject(task, project)`
- `addContext(task, context) / removeContext(task, context)`
- `setKey(task, key, value) / removeKey(task, key)`

## Advanced: Span-Based Editing

These helpers let you edit task strings safely using spans extracted from getContexts, getProjects, or getKeyValues.

### `formatReplacement(span, newValue)`

Formats a new semantic value according to the span’s raw string:

```js
import { formatReplacement } from "todotxt-utils";

const span = { raw: " due:2025-06-07", value: "2025-06-07" };
formatReplacement(span, "2025-06-10");
// " due:2025-06-10"
```

### `replaceSpan(task, span, newValue)`

Replaces a single span in a task string using formatReplacement:

```js
import { replaceSpan } from "todotxt-utils";

const task = "Call Bob @home @phone due:2025-06-07";
const span = { raw: " due:2025-06-07", value: "2025-06-07", start:21, end:37 };

const updated = replaceSpan(task, span, "2025-06-10");
console.log(updated);
// "Call Bob @home @phone due:2025-06-10"
```

### `replaceSpans(task, edits)`

Replace multiple spans or regions safely in a single pass. Edits can be:

`{ span, newValue }` — preferred method

`{ start, end, replacement }` — direct replacement

```js
import { replaceSpans, getContexts, getKeyValues } from "todotxt-utils";

const task = "Call Bob @home @phone due:2025-06-07";

const contexts = getContexts(task, { withSpans: true });
const kvs = getKeyValues(task, { withSpans: true });

const updated = replaceSpans(task, [
  { span: contexts[0], newValue: "work" },      // @home → @work
  { span: kvs[0], newValue: "2025-06-10" }     // due date
]);

console.log(updated);
// "Call Bob @work @phone due:2025-06-10"
```

### `removeSpans(task, spans)`

Removes spans from a task string. Useful for deleting contexts, projects, or key/value pairs:

```js
import { removeSpans, getContexts } from "todotxt-utils";

const task = "Call Bob @home @phone";
const contexts = getContexts(task, { withSpans: true });

const updated = removeSpans(task, contexts);
console.log(updated);
// "Call Bob"
```

**Tip**: Always use the `withSpans: true` option if you plan to manipulate tasks programmatically. It ensures you have accurate start/end indices for safe string editing.


## Philosophy

- **Plain text in, plain text out**: every function works on strings, not custom classes.
- **Small utilities**: each function does one thing.
- **Composable**: you can mix and match functions for your own workflows.

## To Do

- Add more utilities
- Make tests more robust
