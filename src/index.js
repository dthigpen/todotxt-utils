/**
 * Extract contexts from a todo.txt task.
 * @param {string} task - The todo.txt line.
 * @returns {string[]|{value:string,raw:string,start:number,end:number}[]}
 */
function getContexts(task) {
    const regex = /(\s|^)(@[^\s]+)/g;
    const results = [];
    let match;

    while ((match = regex.exec(task)) !== null) {
        const raw = match[0]; // includes leading space (if any)
        const value = match[2].slice(1); // drop "@"
        const start = match.index;
        const end = start + raw.length; // exclusive
        results.push({ value, raw, start, end });
    }

    return results;
}

/**
 * Extract projects from a todo.txt task.
 * @param {string} task - The todo.txt line.
 * @returns {string[]|{value:string,raw:string,start:number,end:number}[]}
 */
export function getProjects(task) {
    const regex = /(\s|^)(\+[^\s]+)/g;
    const results = [];
    let match;

    while ((match = regex.exec(task)) !== null) {
        const raw = match[0]; // includes leading space if any
        const value = match[2].slice(1); // drop "+"
        const start = match.index;
        const end = start + raw.length;
        results.push({ value, raw, start, end });
    }

    return results;
}

/**
 * Extract key:value pairs from a todo.txt task.
 * @param {string} task - The todo.txt line.
 * @param {object} [options]
 * @param {boolean} [options.allowEmptyValue=false] - Allows a key with a colon but no value. E.g. "color:".
 * @returns {{key:string,value:string}[]|{key:string,value:string,raw:string,start:number,end:number}[]}
 */
export function getKeyValues(task, { allowEmptyValue = false } = {}) {
    const regex = allowEmptyValue
        ? /(\s|^)([a-zA-Z]+:[^\s]*)/g
        : /(\s|^)([a-zA-Z]+:[^\s]+)/g;
    const results = [];
    let match;

    while ((match = regex.exec(task)) !== null) {
        const raw = match[0]; // includes leading space if any
        const [key, val] = match[2].split(':', 2);
        const start = match.index;
        const end = start + raw.length;
        results.push({ key, value: val, raw, start, end });
    }

    return results;
}

/**
 * Check if a task is completed (starts with "x ").
 * @param {string} task - A todo.txt task line.
 * @returns {boolean} True if the task is marked completed.
 */
export function isCompleted(task) {
    return /^\s*x\s/.test(task);
}

/**
 * Extract the completion date (if present).
 * @param {string} task - A todo.txt task line.
 * @returns {{ value: string, raw: string, start: number, end: number } | null}
 */
export function getCompletionDate(task) {
    const match = /^\s*x\s(\d{4}-\d{2}-\d{2})/.exec(task);
    if (!match) return null;

    const start = match.index + match[0].indexOf(match[1]);
    const end = start + match[1].length;
    return {
        value: match[1],
        raw: match[0],
        start,
        end,
    };
}

/**
 * Extract the creation date (if present).
 * @param {string} task - A todo.txt task line.
 * @returns {{ value: string, raw: string, start: number, end: number } | null}
 */
export function getCreationDate(task) {
    // Skip leading "x date" if completed
    const strippedPrefix = task.match(/^(?:\s*x\s\d{4}-\d{2}-\d{2}\s*)?/)[0];
    const stripped = task.slice(strippedPrefix.length);

    const match = /^\s*(\d{4}-\d{2}-\d{2})/.exec(stripped);
    if (!match) return null;

    const start =
        strippedPrefix.length + match.index + match[0].indexOf(match[1]);
    const end = start + match[1].length;

    return {
        value: match[1],
        raw: match[0],
        start,
        end,
    };
}

/**
 * Get priority (if present, in form "(A)").
 * @param {string} task - A todo.txt task line.
 * @returns {{ value: string, raw: string, start: number, end: number } | null}
 */
export function getPriority(task) {
    const match = /^\s*\(([A-Z])\)\s/.exec(task);
    if (!match) return null;

    const start = match.index + match[0].indexOf(match[1]);
    const end = start + match[1].length;

    return {
        value: match[1],
        raw: match[0],
        start,
        end,
    };
}
/**
 * Replace or add a key:value pair in the task string.
 * @param {string} task - A todo.txt task line.
 * @param {string} key - Key name.
 * @param {string} value - New value.
 * @returns {string} Updated task string.
 */
export function setKeyValue(task, key, value) {
    const kvs = getKeyValues(task);
    const span = kvs.find((kv) => kv.key === key);
    if (span) {
        task = replaceSpan(task, span, value);
    } else {
        task = task + ` ${key}:${value}`;
    }
    return task;
}

/**
 * Mark a task as completed.
 * Adds "x" and optionally a completion date (YYYY-MM-DD).
 * @param {string} task - A todo.txt task line.
 * @param {object} [options]
 * @param {Date|null} [options.date=new Date()] - Completion date, defaults to today. A null date will not add a completion date .
 * @param {boolean} [options.date=null] - Completion date, defaults to today.
 * @returns {string} Updated task string.
 */
export function markCompleted(task, { date = new Date() } = {}) {
    if (isCompleted(task)) return task; // already done
    if (date) {
        const dateStr = date.toISOString().slice(0, 10);
        return `x ${dateStr} ${task}`;
    }
    return `x ${task}`;
}

/**
 * Mark a completed task as not completed (remove leading "x" and dates).
 * @param {string} task - A todo.txt task line.
 * @returns {string} Updated task string.
 */
export function markIncomplete(task) {
    return task
        .replace(/^\s*x\s\d{4}-\d{2}-\d{2}\s*/, '') // x + date
        .replace(/^\s*x\s/, ''); // bare x
}

/**
 * Set or change the priority of a task.
 * @param {string} task - A todo.txt task line.
 * @param {string|null} priority - Single uppercase letter (A–Z) or null to remove.
 * @returns {string} Updated task string.
 */
export function setPriority(task, priority) {
    // remove existing priority
    let newTask = task.replace(/^\(([A-Z])\)\s/, '');
    if (priority) {
        newTask = `(${priority}) ${newTask}`;
    }
    return newTask.trim();
}

/**
 * Add a project tag (e.g. +project) if not already present.
 * @param {string} task - A todo.txt task line.
 * @param {string} project - Project name without '+'.
 * @returns {string} Updated task string.
 */
export function addProject(task, project) {
    const tag = `+${project}`;
    if (task.includes(tag)) return task;
    return `${task} ${tag}`.trim();
}

/**
 * Add a context tag (e.g. @context) if not already present.
 * @param {string} task - A todo.txt task line.
 * @param {string} context - Context name without '@'.
 * @returns {string} Updated task string.
 */
export function addContext(task, context) {
    const tag = `@${context}`;
    if (task.includes(tag)) return task;
    return `${task} ${tag}`.trim();
}

/**
 * Remove a project tag.
 * @param {string} task - A todo.txt task line.
 * @param {string} project - Project name without '+'.
 * @returns {string} Updated task string.
 */
export function removeProject(task, project) {
    const projects = getProjects(task);
    const span = projects.find((p) => p.value === project);
    if (span) {
        task = removeSpans(task, [span]);
    }
    return task;
}

/**
 * Remove a context tag.
 * @param {string} task - A todo.txt task line.
 * @param {string} context - Context name without '@'.
 * @returns {string} Updated task string.
 */
export function removeContext(task, context) {
    const contexts = getContexts(task);
    const span = contexts.find((c) => c.value === context);
    if (span) {
        task = removeSpans(task, [span]);
    }
    return task;
}

/**
 * Formats a replacement string for a given span.
 * For key/value spans, it replaces the value inside raw.
 * For contexts/projects, it preserves the leading "@" or "+".
 * Otherwise, falls back to keeping leading whitespace.
 *
 * @param {{ raw: string, value?: string }} span
 * @param {string} newValue
 * @returns {string}
 */
export function formatReplacement(span, newValue) {
    if (!span || typeof span.raw !== 'string') return newValue;

    const raw = span.raw;
    const val = span.value;

    // If raw contains the value, just replace it
    if (val && raw.includes(val)) {
        return raw.replace(val, newValue);
    }

    // Fallback: preserve leading whitespace
    const leadingWs = raw.match(/^\s*/)[0] || '';
    return `${leadingWs}${newValue}`;
}

/**
 * Replace a single span in a string with a new semantic value.
 * This uses formatReplacement(span, newValue) to build the replacement text.
 *
 * @param {string} task - original todo.txt line
 * @param {{ raw: string, value?: string, start: number, end: number }} span
 * @param {string} newValue - semantic new value (eg "2025-06-10")
 * @returns {string} updated task string
 */
export function replaceSpan(task, span, newValue) {
    if (
        !span ||
        typeof span.start !== 'number' ||
        typeof span.end !== 'number'
    ) {
        throw new Error('replaceSpan: span must have numeric start and end');
    }
    const replacement = formatReplacement(span, newValue);
    return task.slice(0, span.start) + replacement + task.slice(span.end);
}

/**
 * Replace multiple spans/regions in a string.
 *
 * Accepts edits in two forms:
 * - { span, newValue }  // preferred: span has { raw, value, start, end }
 * - { start, end, replacement } // direct replacement string
 *
 * Edits will be applied in descending start order to keep indexes valid.
 *
 * @param {string} task
 * @param {Array.<{span?:object,newValue?:string,start?:number,end?:number,replacement?:string}>} edits
 * @returns {string} updated task string
 */
export function replaceSpans(task, edits) {
    if (!Array.isArray(edits))
        throw new Error('replaceSpans: edits must be an array');

    // Normalize edits to { start, end, replacement }
    const normalized = edits.map((edit) => {
        if (
            edit.span &&
            typeof edit.span.start === 'number' &&
            typeof edit.span.end === 'number'
        ) {
            return {
                start: edit.span.start,
                end: edit.span.end,
                replacement: formatReplacement(
                    edit.span,
                    edit.newValue === undefined ? '' : edit.newValue
                ),
            };
        }

        if (typeof edit.start === 'number' && typeof edit.end === 'number') {
            return {
                start: edit.start,
                end: edit.end,
                replacement:
                    edit.replacement === undefined ? '' : edit.replacement,
            };
        }

        throw new Error(
            'replaceSpans: each edit must contain either a span or start/end'
        );
    });

    // Sort descending by start so earlier edits (higher indices) don't break later ones
    normalized.sort((a, b) => b.start - a.start);

    let result = task;
    for (const { start, end, replacement } of normalized) {
        if (start < 0 || end < start || end > result.length) {
            throw new Error(
                `replaceSpans: invalid span start=${start} end=${end}`
            );
        }
        result = result.slice(0, start) + replacement + result.slice(end);
    }

    return result;
}

/**
 * Remove one or more spans from a string.
 * Spans should not overlap; if they do, merge them first.
 * @param {string} task - Original todo.txt line.
 * @param {{start:number,end:number}[]} spans - Array of spans to remove.
 * @returns {string} Updated task string.
 */
export function removeSpans(task, spans) {
    // Sort spans descending so earlier indices aren't invalidated
    const sorted = [...spans].sort((a, b) => b.start - a.start);

    let result = task;
    for (const span of sorted) {
        result = result.slice(0, span.start) + result.slice(span.end);
    }

    return result;
}

/**
 * Remove a span from a string.
 * @param {string} task - Original todo.txt line.
 * @param {{start:number,end:number}} span - Span to remove.
 * @returns {string} Updated task string.
 */
export function removeSpan(task, span) {
    return removeSpans(task, [span]);
}
