// Requires: assert.js, config.mock.js, EventBus.js, ConfigValidator.js, compressionEngine.js, ImageAnalyzer.js, ResourcePool.js, imageProcessor.js

console.log('--- Running imageProcessor.js Tests ---');

try {
  const eventBus = new window.EventBus();
  const configValidator = new window.ConfigValidator();
  const resourcePool = new window.ResourcePool(eventBus);
  const analyzer = new window.ImageAnalyzer(resourcePool, new window.SharedUtils());
  const encoder = new window.BitStreamEncoder(configValidator);
  const compressionEngine = new window.CompressionEngine(encoder, eventBus, configValidator, new window.SharedUtils());
  const processor = new window.ImageProcessor(eventBus, configValidator, compressionEngine, analyzer, resourcePool);

  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, 10, 10);

  canvas.toBlob(blob => {
    eventBus.on('processing:completed', result => {
      assert.ok(result.resultURL, 'Should produce a result URL');
      console.log('✅ imageProcessor.js tests passed!');
    });
    processor.processFile(blob);
  });
} catch (err) {
  console.error('❌ imageProcessor.js tests failed:', err);
}