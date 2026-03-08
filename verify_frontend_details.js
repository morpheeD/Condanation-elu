import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#hemicycle');

    // Find a seat with conviction (it should have a circle with class 'conviction-marker' near it)
    // Actually, markers are in the same group as the seat.
    const seatWithConviction = await page.locator('.seat-group:has(.conviction-marker)').first();

    if (await seatWithConviction.count() > 0) {
        await seatWithConviction.click();
        await page.waitForTimeout(500); // Wait for panel to update
        await page.screenshot({ path: 'detail_panel_view.png' });
        console.log('Detail panel screenshot saved.');
    } else {
        console.log('No seats with convictions found to click.');
    }

    // Switch to Senate
    await page.selectOption('#house-select', 'senateurs');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'senate_view.png' });
    console.log('Senate screenshot saved.');

  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await browser.close();
  }
}

verify();
