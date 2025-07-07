// Requires: assert.js, config.mock.js, SharedUtils.js, ResourcePool.js, ImageAnalyzer.js

console.log('--- Running ImageAnalyzer.js Tests ---');

try {
  const resourcePool = new window.ResourcePool(new window.EventBus());
  const utils = new window.SharedUtils();
  const analyzer = new window.ImageAnalyzer(resourcePool, utils);

  // Create a dummy image file
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 10, 10);
  canvas.toBlob(blob => {
    analyzer.analyzeImage(blob).then(analysis => {
      assert.ok(analysis, 'Should produce an analysis object');
      assert.equal(analysis.dimensions.width, 10, 'Width should be 10');
      assert.equal(analysis.dimensions.height, 10, 'Height should be 10');
      console.log('✅ ImageAnalyzer.js tests passed!');
    }).catch(err => {
      console.error('❌ ImageAnalyzer.js tests failed:', err);
    });
  });
} catch (err) {
  console.error('❌ ImageAnalyzer.js tests failed:', err);
}