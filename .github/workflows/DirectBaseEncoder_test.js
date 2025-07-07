// Requires: assert.js, config.mock.js, DirectBaseEncoder.js

console.log('--- Running DirectBaseEncoder.js Tests ---');

try {
  const encoder = new window.DirectBaseEncoder(window.CONFIG.SAFE_CHARS);
  const testData = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = encoder.encode(testData);
  const decoded = encoder.decode(encoded);

  assert.ok(encoded, 'Should produce an encoded string');
  assert.deepEqual(decoded, testData, 'Decoded data should match original data');
  console.log('✅ DirectBaseEncoder.js tests passed!');
} catch (err) {
  console.error('❌ DirectBaseEncoder.js tests failed:', err);
}