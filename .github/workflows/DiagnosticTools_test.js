// Requires: assert.js, SystemManager.js, DebugManager.js, DiagnosticTools.js

console.log('--- Running DiagnosticTools.js Tests ---');

try {
    const systemManager = new window.SystemManager();
    const debugManager = new window.DebugManager(new window.EventBus());
    const diagnosticTools = new window.DiagnosticTools(systemManager, debugManager);

    diagnosticTools.runFullDiagnostics().then(results => {
        assert.ok(results, 'Should return diagnostic results');
        assert.ok(results.overall, 'Results should have an overall status');
        console.log('✅ DiagnosticTools.js tests passed!');
    }).catch(err => {
        console.error('❌ DiagnosticTools.js tests failed:', err);
    });
} catch (err) {
    console.error('❌ DiagnosticTools.js tests failed:', err);
}