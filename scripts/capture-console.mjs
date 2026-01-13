import puppeteer from 'puppeteer';

const BASE = process.env.URL || 'http://localhost:3002';
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const errors = [];
  const consoleMsgs = [];

  page.on('console', msg => {
    consoleMsgs.push({type: msg.type(), text: msg.text()});
  });

  page.on('pageerror', err => {
    errors.push({type: 'pageerror', message: err.message, stack: err.stack});
  });

  page.on('requestfailed', req => {
    consoleMsgs.push({type: 'requestfailed', url: req.url(), err: req.failure().errorText});
  });

  console.log('Visiting', BASE);
  await page.goto(BASE, {waitUntil: 'networkidle2', timeout: 30000});
  await page.waitForTimeout(500);

  // Collect internal links and try to click a subset
  const links = await page.$$eval('a[href^="/"]', els => Array.from(new Set(els.map(e => e.getAttribute('href')))));
  console.log('Found internal links:', links.length);

  for (const href of links.slice(0, 20)) {
    try {
      console.log('Clicking', href);
      // Try to click the element matching the href
      const clicked = await page.evaluate(async h => {
        const el = document.querySelector(`a[href="${h}"]`);
        if (!el) return false;
        el.scrollIntoView();
        el.click();
        return true;
      }, href);

      await page.waitForTimeout(800);
    } catch (e) {
      errors.push({type: 'click', href, message: e.message, stack: e.stack});
    }
  }

  // Wait a bit for any pending async errors
  await page.waitForTimeout(1000);

  if (consoleMsgs.length) {
    console.log('\n--- Console messages ---');
    for (const m of consoleMsgs) console.log(m.type, '-', m.text || JSON.stringify(m));
  }

  if (errors.length) {
    console.log('\n--- Runtime errors captured ---');
    for (const e of errors) console.log(e.type, '-', e.message, e.stack ? `\n${e.stack}` : '');
    await page.screenshot({path: 'capture-error.png', fullPage: true});
    await browser.close();
    process.exit(1);
  }

  console.log('\nNo runtime errors captured.');
  await browser.close();
  process.exit(0);
})();