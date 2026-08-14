/** shoot-flow 와 같지만 세션을 심지 않는다 — 로그인 버튼이 실제로 세션을 만드는지 검증용. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [route = '/', name = 'shot', ...steps] = process.argv.slice(2);
const base = process.env.EXPO_WEB_URL ?? 'http://localhost:8081';
const STATUS_BAR = 52;
const HEIGHT = 812 - STATUS_BAR;

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '.design-ref', 'shots');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: HEIGHT }, deviceScaleFactor: 3 });

await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90_000 });
await page.waitForTimeout(1600);

for (const step of steps) {
  if (step.startsWith('click:')) {
    await page.locator('text=' + step.slice(6)).first().click();
    await page.waitForTimeout(700);
  } else if (step.startsWith('wait:')) {
    await page.waitForTimeout(Number(step.slice(5)));
  }
}

const url = page.url();
const storage = await page.evaluate(() => window.localStorage.getItem('wellness.auth-session.v2'));
const out = join(outDir, `${name}.png`);
await page.screenshot({ path: out });
await browser.close();
console.log(`shot-noseed ${route} [${steps.join(' -> ')}] → .design-ref/shots/${name}.png`);
console.log(`final url: ${url}`);
console.log(`session storage: ${storage}`);
