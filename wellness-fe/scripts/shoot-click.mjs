import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [route = '/', name = 'shot', label = '', ...flags] = process.argv.slice(2);
const base = process.env.EXPO_WEB_URL ?? 'http://localhost:8081';
const STATUS_BAR = 52;
const HEIGHT = 812 - STATUS_BAR;

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '.design-ref', 'shots');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: HEIGHT }, deviceScaleFactor: 3 });

await page.addInitScript(() => {
  window.localStorage.setItem(
    'wellness.auth-session.v2',
    JSON.stringify({ accessToken: 'shoot', userId: 'shoot', mode: 'authenticated', onboardingComplete: true }),
  );
  window.localStorage.setItem('wellness.theme-preference.v1', 'light');
});

await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90_000 });
await page.waitForTimeout(1600);

if (label) {
  const btn = page.locator('text=' + label).first();
  await btn.click();
  await page.waitForTimeout(500);
}

const out = join(outDir, `${name}.png`);
await page.screenshot({ path: out });
await browser.close();
console.log(`shot-click ${route} [${label}] → .design-ref/shots/${name}.png`);
