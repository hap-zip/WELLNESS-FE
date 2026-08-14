/** shoot.mjs 와 같지만 애니메이션 중간 프레임을 잡기 위해 대기시간을 짧게 잡는다. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [route = '/', name = 'shot', waitMs = '900', scroll = '0'] = process.argv.slice(2);
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
if (Number(scroll)) {
  await page.evaluate((y) => {
    const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 40 && e.clientHeight > 400 && Math.abs(e.clientWidth - 375) < 2);
    if (el) el.scrollTop = y;
  }, Number(scroll));
}
await page.waitForTimeout(Number(waitMs));

const out = join(outDir, `${name}.png`);
await page.screenshot({ path: out });
await browser.close();
console.log(`shot-early ${route} @${waitMs}ms → .design-ref/shots/${name}.png`);
