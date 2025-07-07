// Requires: assert.js, EventBus.js, ResourcePool.js

console.log('--- Running ResourcePool.js Tests ---');

try {
    const eventBus = new window.EventBus();
    const resourcePool = new window.ResourcePool(eventBus);

    const canvasResource = resourcePool.get2DCanvas(10, 10);
    assert.ok(canvasResource.canvas, 'Should return a canvas resource');
    assert.ok(canvasResource.ctx, 'Should return a canvas context');
    canvasResource.release();

    console.log('✅ ResourcePool.js tests passed!');
} catch (err) {
    console.error('❌ ResourcePool.js tests failed:', err);
}