const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // 1. Verify Assembly Layout
    console.log('Capturing Assembly layout...');
    await page.screenshot({ path: 'assembly_new_layout.png' });

    // 2. Switch to Senate and verify Year Selector
    console.log('Switching to Senate...');
    await page.selectOption('#house-select', 'senateurs');

    // Wait for the year selector to update and data to load
    await page.waitForTimeout(1000);

    const yearOptions = await page.$$eval('#year-select option', options => options.map(o => o.value));
    console.log('Senate year options:', yearOptions);

    if (yearOptions.includes('2017') && yearOptions.includes('2023')) {
        console.log('Senate year selector updated correctly.');
    } else {
        console.error('Senate year selector failed to update correctly.');
    }

    // Capture Senate layout
    await page.screenshot({ path: 'senate_new_layout.png' });

    // 3. Switch to Senate 2017
    console.log('Switching to Senate 2017...');
    await page.selectOption('#year-select', '2017');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'senate_2017_layout.png' });

    // 4. Verify no significant overlap (visual check later, but check if seats are rendered)
    const seatCount = await page.$$eval('.seat', seats => seats.length);
    console.log(`Number of seats rendered for Senate 2017: ${seatCount}`);

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
})();
