// Requires: assert.js, config.mock.js, DirectBaseEncoder.js

console.log('--- Running DirectBaseEncoder.js Tests ---');

// In DirectBaseEncoder_test.js
try {
  const encoder = new window.DirectBaseEncoder(window.CONFIG.SAFE_CHARS);
  const testData = new Uint8Array([1, 2, 3, 4, 5]);
  console.log('Test Data:', testData);

  const encoded = encoder.encode(testData);
  console.log('Encoded Data:', encoded);

  const decoded = encoder.decode(encoded);
  console.log('Decoded Data:', decoded);

  assert.ok(encoded, 'Should produce an encoded string');
  assert.deepEqual(decoded, testData, 'Decoded data should match original data');
  console.log('✅ DirectBaseEncoder.js tests passed!');
} catch (err) {
  console.error('❌ DirectBaseEncoder.js tests failed:', err);
}