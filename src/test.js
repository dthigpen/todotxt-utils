// test.js
import assert from 'node:assert/strict';
import {
    isCompleted,
    markCompleted,
    getProjects,
    setPriority,
    getKeyValues,
} from './index.js';

// isCompleted
assert.equal(isCompleted('x 2025-09-25 Buy soil'), true);
assert.equal(isCompleted('(A) Buy soil'), false);

// markCompleted
const completed = markCompleted('(A) Buy soil', {
    date: new Date('2025-09-25'),
});
assert.ok(completed.startsWith('x 2025-09-25'), completed);

// getProjects
assert.deepEqual(
    getProjects('Buy soil +garden +yard').map((s) => s.value),
    ['garden', 'yard']
);

// setPriority
assert.equal(setPriority('Buy soil', 'A'), '(A) Buy soil');
assert.equal(setPriority('(B) Buy soil', null), 'Buy soil');

// getKeyValues
assert.deepEqual(
    getKeyValues('Buy soil due:2025-10-01').map(({ key, value }) => ({
        key,
        value,
    })),
    [{ key: 'due', value: '2025-10-01' }]
);

console.log('All tests passed!');
