const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');
const path =require('path');
const fs = require('fs');

const port = 8080;
let server;
let browser;
let hasErrors = false;

// --- Test Cases ---

/**
 * Test the main page (index.html)
 */
async function testMainPage() {
  console.log('--- Testing Main Page (index.html) ---');
  const page = await browser.newPage();
  let pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`❌ Console Error: ${msg.text()}`);
      pageErrors.push(msg.text());
    } else {
      console.log(`💬 Console Log: ${msg.text()}`);
    }
  });

  await page.goto(`http://localhost:${port}/index.html`, {
    waitUntil: 'networkidle0'
  });

  // Check for critical UI elements
  const criticalElements = ['#dropZone', '#fileInput', '#selectButton', '#resultContainer'];
  for (const selector of criticalElements) {
    const element = await page.$(selector);
    if (!element) {
      pageErrors.push(`Missing critical element: ${selector}`);
    }
  }

  // Simulate file upload
  const fileInput = await page.$('#fileInput');
  const testImagePath = path.join(__dirname, 'test-image.png'); // Create a dummy test image
  fs.writeFileSync(testImagePath, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  await fileInput.uploadFile(testImagePath);

  // Wait for processing to complete
  await page.waitForSelector('#resultUrl:not(:empty)', { timeout: 10000 });

  // Check if a result URL was generated
  const resultUrl = await page.$eval('#resultUrl', el => el.textContent);
  if (!resultUrl || resultUrl.length === 0) {
    pageErrors.push('Result URL was not generated after file upload.');
  }

  fs.unlinkSync(testImagePath); // Clean up the dummy image

  if (pageErrors.length > 0) {
    console.error(`❌ Main Page Test Failed: ${pageErrors.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('✅ Main Page Test Passed!');
  }

  await page.close();
}

/**
 * Test the character test page (char_test.html)
 */
async function testCharTestPage() {
  console.log('--- Testing Character Test Page (char_test.html) ---');
  const page = await browser.newPage();
  let pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`❌ Console Error: ${msg.text()}`);
      pageErrors.push(msg.text());
    } else {
      console.log(`💬 Console Log: ${msg.text()}`);
    }
  });

  await page.goto(`http://localhost:${port}/char_test.html`, {
    waitUntil: 'networkidle0'
  });

  // Check if the character set from config.js is displayed
  const currentCharSet = await page.$eval('#currentCharSet', el => el.textContent);
  if (!currentCharSet || currentCharSet.length === 0) {
    pageErrors.push('Current character set is not displayed.');
  }

  // Simulate analyzing a new character set
  await page.type('#proposedCharSet', 'ABCDEFG');
  await page.click('button.button'); // Click the "Analyze Proposed Set" button

  // Check if the analysis results are displayed
  const analysisResult = await page.$eval('#proposalAnalysis', el => el.textContent);
  if (!analysisResult || analysisResult.length === 0) {
    pageErrors.push('Analysis results are not displayed after proposing a new set.');
  }

  if (pageErrors.length > 0) {
    console.error(`❌ Character Test Page Failed: ${pageErrors.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('✅ Character Test Page Passed!');
  }

  await page.close();
}

/**
 * Test the 404 page / image viewer (404.html)
 */
async function test404Page() {
  console.log('--- Testing 404 Page / Image Viewer (404.html) ---');
  const page = await browser.newPage();
  let pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`❌ Console Error: ${msg.text()}`);
      pageErrors.push(msg.text());
    } else {
      console.log(`💬 Console Log: ${msg.text()}`);
    }
  });

  // Test with a sample encoded string
  const encodedString = 'A'; // A simple encoded string
  await page.goto(`http://localhost:${port}/${encodedString}`, {
    waitUntil: 'networkidle0'
  });

  // Check if the image is displayed
  const image = await page.$('img');
  if (!image) {
    pageErrors.push('Image was not displayed for a valid encoded string.');
  }

  // Test with invalid data
  await page.goto(`http://localhost:${port}/invalid-data`, {
    waitUntil: 'networkidle0'
  });

  // Check for an error message
  const errorMessage = await page.$('.status-error');
  if (!errorMessage) {
    pageErrors.push('Error message was not displayed for invalid data.');
  }

  if (pageErrors.length > 0) {
    console.error(`❌ 404 Page Test Failed: ${pageErrors.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('✅ 404 Page Test Passed!');
  }

  await page.close();
}


// --- Test Runner ---

async function runAllTests() {
  try {
    // Start a local server
    server = spawn('npx', ['http-server', '-p', port]);
    console.log('Started server...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Launch Puppeteer
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Run all test cases
    await testMainPage();
    await testCharTestPage();
    await test404Page();

  } catch (error) {
    console.error(`An error occurred during testing: ${error}`);
    hasErrors = true;
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill();
    }
  }

  if (hasErrors) {
    console.error('Integration tests failed! Aborting deployment.');
    process.exit(1);
  } else {
    console.log('✅ All integration tests passed!');
    process.exit(0);
  }
}

runAllTests();
