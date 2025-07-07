// Requires: assert.js, EventBus.js, SharedUtils.js, UIManager.js

console.log('--- Running UIManager.js Tests ---');

try {
  // Mock DOM elements
  document.body.innerHTML = `
    <div id="status"></div>
    <div id="progressBar"></div>
    <div id="progressText"></div>
    <div id="progressContainer"></div>
    <div id="dropZone"></div>
    <input id="fileInput" type="file" />
    <div id="preview"></div>
    <button id="selectButton"></button>
    <div id="resultContainer"></div>
    <div id="resultUrl"></div>
  `;

  const eventBus = new window.EventBus();
  const utils = new window.SharedUtils();
  const uiManager = new window.UIManager(eventBus, utils);

  uiManager.updateStatus('Test Status', 'success');
  const statusEl = document.getElementById('status');
  assert.equal(statusEl.textContent, 'Test Status', 'Status should be updated');
  assert.ok(statusEl.classList.contains('success'), 'Status should have success class');

  console.log('✅ UIManager.js tests passed!');
} catch (err) {
  console.error('❌ UIManager.js tests failed:', err);
}