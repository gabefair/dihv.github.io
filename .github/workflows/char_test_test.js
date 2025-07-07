// Requires: assert.js, char_test.js

console.log('--- Running char_test.js Tests ---');

try {
    const validator = new window.CharacterSetValidator();
    assert.ok(validator, 'Should create a validator instance');
    // We can't easily test the output to the console, but we can check if the methods run without errors
    validator.runValidation();

    console.log('✅ char_test.js tests passed!');
} catch (err) {
    console.error('❌ char_test.js tests failed:', err);
}