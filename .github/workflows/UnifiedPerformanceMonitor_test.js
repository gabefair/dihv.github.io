// Requires: assert.js, EventBus.js, UnifiedPerformanceMonitor.js

console.log('--- Running UnifiedPerformanceMonitor.js Tests ---');

try {
    const eventBus = new window.EventBus();
    const monitor = new window.UnifiedPerformanceMonitor(eventBus);

    monitor.startMonitoring();
    monitor.recordOperation({ type: 'test-operation' });
    monitor.stopMonitoring();

    const metrics = monitor.getMetrics();
    assert.equal(metrics.operations.length, 1, 'Should record one operation');

    console.log('✅ UnifiedPerformanceMonitor.js tests passed!');
} catch (err) {
    console.error('❌ UnifiedPerformanceMonitor.js tests failed:', err);
}