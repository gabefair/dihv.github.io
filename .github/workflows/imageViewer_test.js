// Requires: assert.js, config.mock.js, DirectBaseEncoder.js, BitStreamDecoder.js, imageViewer.js

console.log('--- Running imageViewer.js Tests ---');

try {
  const encoder = new window.DirectBaseEncoder(window.CONFIG.SAFE_CHARS);
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 1, 1);
  canvas.toBlob(blob => {
    const reader = new FileReader();
    reader.onload = () => {
      const testData = new Uint8Array(reader.result);
      const encoded = encoder.encode(testData);
      const viewer = new window.ImageViewer(encoded);
      assert.ok(document.querySelector('img'), 'Image should be displayed');
      console.log('✅ imageViewer.js tests passed!');
    };
    reader.readAsArrayBuffer(blob);
  });
} catch (err) {
  console.error('❌ imageViewer.js tests failed:', err);
}