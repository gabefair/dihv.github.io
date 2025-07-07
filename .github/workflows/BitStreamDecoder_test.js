// Requires: assert.js, config.mock.js, DirectBaseEncoder.js, BitStreamEncoder.js, BitStreamDecoder.js

console.log('--- Running BitStreamDecoder.js Tests ---');

try {
  const configValidator = {
    getConfig: () => window.CONFIG
  };

  const encoder = new window.BitStreamEncoder(configValidator);
  const decoder = new window.BitStreamDecoder(window.CONFIG.SAFE_CHARS);
  const testData = new Uint8Array([1, 2, 3, 4, 5]);

  encoder.encodeBits(testData).then(encoded => {
    decoder.decodeBits(encoded).then(decoded => {
      assert.deepEqual(new Uint8Array(decoded), testData, 'Decoded data should match original data');
      console.log('✅ BitStreamDecoder.js tests passed!');
    }).catch(err => {
      console.error('❌ BitStreamDecoder.js tests failed:', err);
    });
  }).catch(err => {
    console.error('❌ BitStreamDecoder.js tests failed:', err);
  });
} catch (err) {
  console.error('❌ BitStreamDecoder.js tests failed:', err);
}