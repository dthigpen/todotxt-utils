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
 * @returns {string|null} Completion date (YYYY-MM-DD) or null.
 */
export function getCompletionDate(task) {
  const match = /^\s*x\s(\d{4}-\d{2}-\d{2})/.exec(task);
  return match ? match[1] : null;
}

/**
 * Extract the creation date (if present).
 * @param {string} task - A todo.txt task line.
 * @returns {string|null} Creation date (YYYY-MM-DD) or null.
 */
export function getCreationDate(task) {
  // Skip leading "x date" if completed, then look for next date
  const stripped = task.replace(/^\s*x\s\d{4}-\d{2}-\d{2}\s*/, "");
  const match = /^\s*(\d{4}-\d{2}-\d{2})/.exec(stripped);
  return match ? match[1] : null;
}

/**
 * Get priority (if present, in form "(A)").
 * @param {string} task - A todo.txt task line.
 * @returns {string|null} Priority letter, e.g. "A", or null if none.
 */
export function getPriority(task) {
  const match = /^\s*\(([A-Z])\)\s/.exec(task);
  return match ? match[1] : null;
}

/**
 * Extract all project tags (e.g. +project).
 * @param {string} task - A todo.txt task line.
 * @returns {string[]} Array of project tags.
 */
export function getProjects(task) {
  return task.match(/\+\S+/g) || [];
}

/**
 * Extract all context tags (e.g. @context).
 * @param {string} task - A todo.txt task line.
 * @returns {string[]} Array of context tags.
 */
export function getContexts(task) {
  return task.match(/@\S+/g) || [];
}

/**
 * Extract all key:value pairs (metadata).
 * @param {string} task - A todo.txt task line.
 * @returns {Object<string,string>} Map of key:value pairs.
 */
export function getKeyValues(task) {
  const kv = {};
  const regex = /\b(\w+):(\S+)/g;
  let match;
  while ((match = regex.exec(task))) {
    kv[match[1]] = match[2];
  }
  return kv;
}

/**
 * Get the value for a specific key.
 * @param {string} task - A todo.txt task line.
 * @param {string} key - Key to search for.
 * @returns {string|null} Value if found, otherwise null.
 */
export function getValue(task, key) {
  const kv = getKeyValues(task);
  return kv[key] || null;
}

/**
 * Remove a key:value pair from the task string.
 * @param {string} task - A todo.txt task line.
 * @param {string} key - Key to remove.
 * @returns {string} New task string without the key.
 */
export function removeKey(task, key) {
  return task.replace(new RegExp(`\\b${key}:\\S+`), "").trim();
}

/**
 * Replace or add a key:value pair in the task string.
 * @param {string} task - A todo.txt task line.
 * @param {string} key - Key name.
 * @param {string} value - New value.
 * @returns {string} Updated task string.
 */
export function setKeyValue(task, key, value) {
  if (getValue(task, key)) {
    return task.replace(new RegExp(`\\b${key}:\\S+`), `${key}:${value}`);
  }
  return `${task} ${key}:${value}`.trim();
}


/**
 * Mark a task as completed.
 * Adds "x" and optionally a completion date (YYYY-MM-DD).
 * @param {string} task - A todo.txt task line.
 * @param {string|null} [date=null] - Completion date, defaults to today if not provided.
 * @returns {string} Updated task string.
 */
export function markCompleted(task, date = null) {
  if (isCompleted(task)) return task; // already done
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = date || today;
  return `x ${dateStr} ${task}`;
}

/**
 * Mark a completed task as not completed (remove leading "x" and dates).
 * @param {string} task - A todo.txt task line.
 * @returns {string} Updated task string.
 */
export function markIncomplete(task) {
  return task
    .replace(/^\s*x\s\d{4}-\d{2}-\d{2}\s*/, "") // x + date
    .replace(/^\s*x\s/, ""); // bare x
}

/**
 * Set or change the priority of a task.
 * @param {string} task - A todo.txt task line.
 * @param {string|null} priority - Single uppercase letter (A–Z) or null to remove.
 * @returns {string} Updated task string.
 */
export function setPriority(task, priority) {
  // remove existing priority
  let newTask = task.replace(/^\(([A-Z])\)\s/, "");
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
  const tag = `+${project}`;
  return task.replace(new RegExp(`\\s*\\${tag}\\b`), "").trim();
}

/**
 * Remove a context tag.
 * @param {string} task - A todo.txt task line.
 * @param {string} context - Context name without '@'.
 * @returns {string} Updated task string.
 */
export function removeContext(task, context) {
  const tag = `@${context}`;
  return task.replace(new RegExp(`\\s*\\${tag}\\b`), "").trim();
}
