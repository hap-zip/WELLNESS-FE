/** shoot-noseed 에 type/tab 스텝을 추가한 버전 — 실제 폼 입력 검증용. */
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
    await page.waitForTimeout(600);
  } else if (step.startsWith('fill:')) {
    const [placeholder, value] = step.slice(5).split('=');
    await page.getByPlaceholder(placeholder).fill(value);
    await page.waitForTimeout(200);
  } else if (step.startsWith('wait:')) {
    await page.waitForTimeout(Number(step.slice(5)));
  }
}

const url = page.url();
const storage = await page.evaluate(() => window.localStorage.getItem('wellness.auth-session.v2'));
const out = join(outDir, `${name}.png`);
await page.screenshot({ path: out });
await browser.close();
console.log(`→ .design-ref/shots/${name}.png`);
console.log(`final url: ${url}`);
console.log(`session storage: ${storage}`);
