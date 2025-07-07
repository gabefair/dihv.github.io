// Requires: assert.js, EventBus.js, DebugManager.js

console.log('--- Running DebugManager.js Tests ---');

try {
    const eventBus = new window.EventBus();
    const debugManager = new window.DebugManager(eventBus);

    debugManager.logEvent('test-event', { data: 'test' });
    const report = debugManager.getDebugReport();

    assert.equal(report.recentEvents.length, 1, 'Should log one event');
    assert.equal(report.recentEvents[0].eventType, 'test-event', 'Logged event type should be correct');

    console.log('✅ DebugManager.js tests passed!');
} catch (err) {
    console.error('❌ DebugManager.js tests failed:', err);
}