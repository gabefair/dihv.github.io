// Requires: assert.js, config.mock.js, DirectBaseEncoder.js, BitStreamEncoder.js

console.log('--- Running BitStreamEncoder.js Tests ---');

try {
  const configValidator = {
    getConfig: () => window.CONFIG
  };

  const encoder = new window.BitStreamEncoder(configValidator);
  const testData = new Uint8Array([1, 2, 3, 4, 5]);

  encoder.encodeBits(testData).then(encoded => {
    assert.ok(encoded, 'Should produce an encoded string');
    assert.ok(typeof encoded === 'string', 'Encoded data should be a string');
    console.log('✅ BitStreamEncoder.js tests passed!');
  }).catch(err => {
    console.error('❌ BitStreamEncoder.js tests failed:', err);
  });
} catch (err) {
  console.error('❌ BitStreamEncoder.js tests failed:', err);
}