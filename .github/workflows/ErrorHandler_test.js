// Requires: assert.js, EventBus.js, ErrorHandler.js

console.log('--- Running ErrorHandler.js Tests ---');

try {
    const eventBus = new window.EventBus();
    const errorHandler = new window.ErrorHandler(eventBus);
    let errorEventFired = false;

    eventBus.on('error', () => {
        errorEventFired = true;
    });

    errorHandler.handleError('test-category', 'Test error');

    assert.ok(errorEventFired, 'Error event should be fired');

    console.log('✅ ErrorHandler.js tests passed!');
} catch (err) {
    console.error('❌ ErrorHandler.js tests failed:', err);
}