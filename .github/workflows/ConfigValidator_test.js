// Requires: assert.js, config.js, ConfigValidator.js

console.log('--- Running ConfigValidator.js Tests ---');

try {
    const validator = new window.ConfigValidator();
    const config = validator.getConfig();

    assert.ok(config, 'Should return a config object');
    assert.ok(config.MAX_URL_LENGTH, 'Config should have MAX_URL_LENGTH');
    assert.ok(config.SAFE_CHARS, 'Config should have SAFE_CHARS');

    console.log('✅ ConfigValidator.js tests passed!');
} catch (err) {
    console.error('❌ ConfigValidator.js tests failed:', err);
}