import { chromium } from 'playwright';
import fs from 'fs';

async function verify() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Start Vite dev server in background and wait for it
  // For simplicity, we assume the server is running on port 5173
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#hemicycle');

    // Screenshot Assembly
    await page.screenshot({ path: 'assembly_view.png' });
    console.log('Assembly screenshot saved.');

    // Switch to Senate
    await page.selectOption('#house-select', 'senateurs');
    await page.waitForTimeout(1000); // Wait for transition
    await page.screenshot({ path: 'senate_view.png' });
    console.log('Senate screenshot saved.');

    // Click on a seat with conviction (Patrick Balkany if present)
    // We search for a seat and hover/click
    const patrickBalkany = await page.evaluate(() => {
        const tooltip = document.querySelector('#tooltip');
        const groups = Array.from(document.querySelectorAll('.seat-group'));
        // Find one with conviction markers
        return groups.find(g => g.querySelector('.conviction-marker')) !== null;
    });
    console.log('Conviction markers found:', patrickBalkany);

  } catch (e) {
    console.error('Verification failed:', e);
  } finally {
    await browser.close();
  }
}

verify();
