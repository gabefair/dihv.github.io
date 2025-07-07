// Requires: assert.js, WebGLManager.js

console.log('--- Running WebGLManager.js Tests ---');

try {
    const webGLManager = new window.WebGLManager();
    const capabilities = webGLManager.detectCapabilities();
    assert.ok(capabilities, 'Should detect WebGL capabilities');

    if (capabilities.webgl2) {
        const context = webGLManager.getWebGL2Context('test');
        assert.ok(context, 'Should get a WebGL2 context');
    }

    console.log('✅ WebGLManager.js tests passed!');
} catch (err) {
    console.error('❌ WebGLManager.js tests failed:', err);
}