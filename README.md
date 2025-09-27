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
import {
  getContexts,
  getProjects,
  getPriority,
  getCreationDate,
  getCompletionDate,
  getKeyValues,
  replaceSpan,
  formatReplacement
} from "todotxt-utils";

const task = "x 2025-01-01 2024-12-31 Fix bug +proj @home rid:1";

// Most helpers return *spans*, not just values:
const contexts = getContexts(task);
// → [{ value: "home", start: 43, end: 48, raw: " @home" }]

const projects = getProjects(task);
// → [{ value: "proj", start: 37, end: 42, raw: " +proj" }]

const priority = getPriority(task);
// → { value: "A", start: 15, end: 19, raw: " (A)" }

const creationDate = getCreationDate(task);
// → { value: "2024-12-31", start: 20, end: 30, raw: " 2024-12-31" }

const completionDate = getCompletionDate(task);
// → { value: "2025-01-01", start: 2, end: 12, raw: "2025-01-01" }

const keyValues = getKeyValues(task);
// → [{ key: "rid", value: "1", start: 49, end: 55, raw: " rid:1" }]

// You can replace spans without worrying about whitespace/keys:
const newTask = replaceSpan(
  task,
  creationDate,
  formatReplacement(creationDate, "2025-02-01")
);
// → "x 2025-01-01 (A) 2025-02-01 Fix bug +proj @home rid:1"
```

## API Design

Most parsing functions return spans, which include not only the extracted value but also information about where in the task string it came from.

A span has this shape:
```json
{
  value: string;   // the parsed logical value, e.g. "home" for "@home"
  start: number;   // inclusive index into the task string
  end: number;     // exclusive index into the task string
  raw: string;     // the exact substring matched, including whitespace/prefix
}
```
- `start` is the index of the first character in the raw match.
- `end` is the index immediately after the last character (exclusive).
- `raw` includes the leading/trailing whitespace or marker `+`, `@`, `key:`) so that replacements are easy.


This design makes it easy to:

- Remove spans (via `removeSpan`) without re-parsing.
- Replace spans using `replaceSpan` and `formatReplacement`.
- Track offsets precisely when manipulating tasks.


#### Example

```js
const task = "(A) 2025-01-01 Write docs +proj @home due:2025-02-01";

const project = getProjects(task)[0];
// → { value: "proj", start: 28, end: 34, raw: " +proj" }

const updated = replaceSpan(
  task,
  project,
  formatReplacement(project, "newproj")
);
// → "(A) 2025-01-01 Write docs +newproj @home due:2025-02-01"
```

## Philosophy

- **Plain text in, plain text out**: every function works on strings, not custom classes.
- **Small utilities**: each function does one thing.
- **Composable**: you can mix and match functions for your own workflows.

## To Do

- Add more utilities
- Make tests more robust
````
