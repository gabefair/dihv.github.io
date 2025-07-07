// Requires: assert.js, config.mock.js, SharedUtils.js, EventBus.js, BitStreamEncoder.js, compressionEngine.js

console.log('--- Running compressionEngine.js Tests ---');

try {
  const eventBus = new window.EventBus();
  const configValidator = { getConfig: () => window.CONFIG };
  const encoder = new window.BitStreamEncoder(configValidator);
  const utils = new window.SharedUtils();
  const engine = new window.CompressionEngine(encoder, eventBus, configValidator, utils);

  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 100, 100);

  canvas.toBlob(blob => {
    const analysisResults = {
      recommendations: {
        formatRankings: [{ format: 'image/webp', quality: 0.8 }]
      }
    };
    engine.compressImageHeuristic(blob, analysisResults, 1000).then(result => {
      assert.ok(result.success, 'Compression should be successful');
      assert.ok(result.data.encoded, 'Should produce encoded data');
      console.log('✅ compressionEngine.js tests passed!');
    }).catch(err => {
      console.error('❌ compressionEngine.js tests failed:', err);
    });
  });
} catch (err) {
  console.error('❌ compressionEngine.js tests failed:', err);
}