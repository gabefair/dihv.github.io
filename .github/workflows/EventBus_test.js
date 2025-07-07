// Requires: assert.js, EventBus.js

console.log('--- Running EventBus.js Tests ---');

try {
    const eventBus = new window.EventBus();
    let eventFired = false;
    let eventData = null;

    eventBus.on('test-event', (data) => {
        eventFired = true;
        eventData = data;
    });

    eventBus.emit('test-event', { detail: 'test' });

    assert.ok(eventFired, 'Event should be fired');
    assert.deepEqual(eventData, { detail: 'test' }, 'Event data should be correct');

    console.log('✅ EventBus.js tests passed!');
} catch (err) {
    console.error('❌ EventBus.js tests failed:', err);
}