// Requires: assert.js, SharedUtils.js

console.log('--- Running SharedUtils.js Tests ---');

try {
    const utils = new window.SharedUtils();

    // Test formatBytes
    assert.equal(utils.formatBytes(1024), '1.00 KB', 'formatBytes should format kilobytes correctly');
    assert.equal(utils.formatBytes(1048576), '1.00 MB', 'formatBytes should format megabytes correctly');

    // Test formatTime
    assert.equal(utils.formatTime(1000), '1.0s', 'formatTime should format seconds correctly');
    assert.equal(utils.formatTime(60000), '1m 0s', 'formatTime should format minutes correctly');

    // Test validate
    const validation = utils.validate(10, 'integer', { min: 5, max: 15 });
    assert.ok(validation.valid, 'validate should return valid for correct input');
    const invalidValidation = utils.validate(20, 'integer', { min: 5, max: 15 });
    assert.ok(!invalidValidation.valid, 'validate should return invalid for incorrect input');

    console.log('✅ SharedUtils.js tests passed!');
} catch (err) {
    console.error('❌ SharedUtils.js tests failed:', err);
}