// Requires: assert.js, config.js, EventBus.js, ConfigValidator.js, SharedUtils.js, ErrorHandler.js, ResourcePool.js, BitStreamEncoder.js, BitStreamDecoder.js, ImageAnalyzer.js, compressionEngine.js, imageProcessor.js, UIManager.js, SystemManager.js

console.log('--- Running SystemManager.js Tests ---');

try {
    const systemManager = new window.SystemManager();
    systemManager.initialize().then(() => {
        assert.ok(systemManager.state.initialized, 'System should be initialized');
        assert.ok(systemManager.getComponent('eventBus'), 'Should have an eventBus component');
        assert.ok(systemManager.getComponent('config'), 'Should have a config component');
        console.log('✅ SystemManager.js tests passed!');
    }).catch(err => {
        console.error('❌ SystemManager.js tests failed:', err);
    });
} catch (err) {
    console.error('❌ SystemManager.js tests failed:', err);
}