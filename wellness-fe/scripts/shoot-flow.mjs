/** 여러 단계를 순서대로 클릭/입력하고 마지막 화면만 찍는다. steps: "click:라벨" | "fill:placeholder=값" */
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

await page.addInitScript(() => {
  window.localStorage.setItem(
    'wellness.auth-session.v2',
    JSON.stringify({ accessToken: 'shoot', userId: 'shoot', mode: 'authenticated', onboardingComplete: true }),
  );
  window.localStorage.setItem('wellness.theme-preference.v1', 'light');
});

await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90_000 });
await page.waitForTimeout(1600);

for (const step of steps) {
  if (step.startsWith('click:')) {
    const label = step.slice(6);
    await page.locator('text=' + label).first().click();
    await page.waitForTimeout(600);
  } else if (step.startsWith('back')) {
    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
  } else if (step.startsWith('wait:')) {
    await page.waitForTimeout(Number(step.slice(5)));
  } else if (step.startsWith('type:')) {
    await page.keyboard.type(step.slice(5), { delay: 20 });
    await page.waitForTimeout(200);
  } else if (step.startsWith('scroll:')) {
    const y = Number(step.slice(7));
    await page.evaluate((yy) => {
      const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 40 && e.clientHeight > 400 && Math.abs(e.clientWidth - 375) < 2);
      if (el) el.scrollTop = yy;
    }, y);
    await page.waitForTimeout(300);
  }
}

const out = join(outDir, `${name}.png`);
await page.screenshot({ path: out });
await browser.close();
console.log(`shot-flow ${route} [${steps.join(' -> ')}] → .design-ref/shots/${name}.png`);
