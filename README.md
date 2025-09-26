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
  isCompleted,
  getProjects,
  getKeyValues,
  markCompleted,
  setPriority,
} from "todotxt-utils";

const task = "(A) 2025-05-01 Buy soil +garden due:2025-05-07";

// Check if completed
console.log(isCompleted(task)); // false

// Extract project tags
console.log(getProjects(task)); // ["+garden"]

// Extract key:value pairs
console.log(getKeyValues(task)); // { due: "2025-05-07" }

// Mark task completed (adds today's date)
console.log(markCompleted(task));
// -> "x 2025-09-25 (A) 2025-05-01 Buy soil +garden due:2025-05-07"

// Change priority
console.log(setPriority(task, "B"));
// -> "(B) 2025-05-01 Buy soil +garden due:2025-05-07"
```

## API Overview

### Parsing

- `isCompleted(task): boolean`
- `getCompletionDate(task): string|null`
- `getCreationDate(task): string|null`
- `getPriority(task): string|null`
- `getProjects(task): string[]``
- `getContexts(task): string[]``
- `getKeyValues(task): Record<string,string>``
- `getValue(task, key): string|null`

### Modification

- `markCompleted(task, date?)`
- `markIncomplete(task)`
- `setPriority(task, letter|null)`
- `addProject(task, project) / removeProject(task, project)`
- `addContext(task, context) / removeContext(task, context)`
- `setKey(task, key, value) / removeKey(task, key)`

## Philosophy

- **Plain text in, plain text out**: every function works on strings, not custom classes.
- **Small utilities**: each function does one thing.
- **Composable**: you can mix and match functions for your own workflows.

## To Do

- Add more utilities
- Make tests more robust
