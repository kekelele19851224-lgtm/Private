// Simple test to verify serialization works
const { toJsonString } = require('./lib/serialize.ts');

console.log('Testing serialization...');

// Test cases
const testCases = [
  { input: null, expected: null, description: 'null value' },
  { input: undefined, expected: null, description: 'undefined value' },
  { input: 'string', expected: 'string', description: 'string value' },
  { input: { foo: 'bar', num: 123 }, expected: '{"foo":"bar","num":123}', description: 'object value' },
  { input: [1, 2, 3], expected: '[1,2,3]', description: 'array value' },
  { input: 42, expected: '42', description: 'number value' },
];

testCases.forEach((test, index) => {
  const result = toJsonString(test.input);
  const passed = result === test.expected;
  console.log(`Test ${index + 1} (${test.description}): ${passed ? 'PASS' : 'FAIL'}`);
  if (!passed) {
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Got: ${result}`);
  }
});

console.log('Serialization test complete.');

module.exports = { testCases };