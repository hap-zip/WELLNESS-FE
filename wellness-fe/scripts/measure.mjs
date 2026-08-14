/** 프로토타입과 구현의 스크롤 컨테이너 크기를 나란히 재서 전체 높이가 맞는지 본다. */
import { chromium } from 'playwright';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const label = process.argv[2] ?? '홈';
const route = process.argv[3] ?? '/home';

const probe = () => {
  const list = [...document.querySelectorAll('*')]
    .filter((e) => e.scrollHeight > e.clientHeight + 20 && e.clientHeight > 300)
    .map((e) => ({
      tag: e.tagName,
      cls: (e.className || '').toString().slice(0, 40),
      clientHeight: e.clientHeight,
      scrollHeight: e.scrollHeight,
    }));
  return list;
};

const browser = await chromium.launch();

// 프로토타입
const p1 = await browser.newPage({ viewport: { width: 1100, height: 1100 } });
await p1.goto(pathToFileURL(resolve(root, '.design-ref', 'momgirok-v8.html')).href, { waitUntil: 'networkidle', timeout: 120_000 });
await p1.waitForTimeout(2500);
const btn = p1.locator('button', { hasText: new RegExp(`^\\s*${label}\\s*$`) }).first();
if (await btn.count()) { await btn.click(); await p1.waitForTimeout(900); }
console.log('프로토타입:', JSON.stringify(await p1.evaluate(probe), null, 1));

// 구현
const p2 = await browser.newPage({ viewport: { width: 375, height: 760 } });
await p2.addInitScript(() => {
  window.localStorage.setItem('wellness.auth-session.v2', JSON.stringify({ accessToken: 'shoot', userId: 'shoot', mode: 'authenticated', onboardingComplete: true }));
});
await p2.goto('http://localhost:8081' + route, { waitUntil: 'networkidle', timeout: 90_000 });
await p2.waitForTimeout(1800);
console.log('구현:', JSON.stringify(await p2.evaluate(probe), null, 1));

await browser.close();
