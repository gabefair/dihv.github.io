// .github/workflows/run-tests.js

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = 8080;
const testTimeout = 15000; // Increased timeout
let server;
let browser;
const testResults = [];

// --- Test Runner ---

async function runTest(name, testFn) {
    console.log(`--- Running Test: ${name} ---`);
    let page;
    try {
        page = await browser.newPage();
        await page.setDefaultTimeout(testTimeout);

        const consoleMessages = [];
        page.on('console', msg => {
            const log = `[${msg.type()}] ${msg.text()}`;
            console.log(`  ${log}`);
            consoleMessages.push(log);
        });

        await testFn(page);
        testResults.push({ name, status: '✅ Passed' });
        console.log(`✅ ${name} Passed!`);
    } catch (error) {
        testResults.push({ name, status: '❌ Failed', error: error.toString() });
        console.error(`❌ ${name} Failed: ${error}`);
    } finally {
        if (page) {
            await page.close();
        }
    }
}

// --- Test Cases ---

async function testMainPage(page) {
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#dropZone', { visible: true });
    
    const fileInput = await page.$('#fileInput');
    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    await fileInput.uploadFile(testImagePath);
    await page.waitForSelector('#resultUrl:not(:empty)', { timeout: testTimeout });
    
    const resultUrl = await page.$eval('#resultUrl', el => el.textContent);
    if (!resultUrl) {
        throw new Error('Result URL was not generated.');
    }
    fs.unlinkSync(testImagePath);
}

async function testCharTestPage(page) {
    await page.goto(`http://localhost:${port}/char_test.html`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#currentCharSet', { visible: true });
    
    const currentCharSet = await page.$eval('#currentCharSet', el => el.textContent);
    if (!currentCharSet) {
        throw new Error('Current character set is not displayed.');
    }
}

async function test404Page(page) {
    const encodedString = 'A'; // A simple valid encoded string
    await page.goto(`http://localhost:${port}/${encodedString}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('img', { visible: true });
}

// --- Main Execution ---

async function runAllTests() {
    try {
        // Correctly configure http-server to use the 404.html page for any 404 error.
        server = spawn('npx', ['http-server', '-p', port, '-c-1', '--proxy', `http://localhost:${port}/?`]);
        console.log('Started server...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        await runTest('Main Page', testMainPage);
        await runTest('Character Test Page', testCharTestPage);
        await runTest('404 Page Viewer', test404Page);

    } catch (error) {
        console.error(`An error occurred during test setup: ${error}`);
        testResults.push({ name: 'Setup', status: '❌ Failed', error: error.toString() });
    } finally {
        if (browser) await browser.close();
        if (server) server.kill();

        console.log('\n--- Test Summary ---');
        let failed = false;
        testResults.forEach(result => {
            console.log(`${result.name}: ${result.status}`);
            if (result.status.includes('Failed')) {
                failed = true;
                console.log(`  Error: ${result.error}`);
            }
        });

        if (failed) {
            console.error('\nIntegration tests failed!');
            process.exit(1);
        } else {
            console.log('\n✅ All integration tests passed!');
            process.exit(0);
        }
    }
}

runAllTests();