/**
 * 같은 문구를 가진 요소의 위치·크기를 프로토타입과 구현에서 각각 재서 표로 찍는다.
 * 픽셀 눈대중 대신 숫자로 확인할 때 쓴다.
 *
 *   node scripts/measure-el.mjs 홈 "/home" "" "왼쪽 어깨 앞" "오늘의 몸"
 *   node scripts/measure-el.mjs 홈 "/home?state=error" "동기화 오류" "왼쪽 어깨 앞"
 *
 * 3번째 인자는 프로토타입 사이드바에서 추가로 눌러야 하는 상태 라벨 (없으면 "").
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [label = '홈', route = '/home', protoState = '', ...needles] = process.argv.slice(2);

const probe = (needles) => {
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const t = (el.textContent ?? '').trim();
    for (const n of needles) {
      if (!t.startsWith(n)) continue;
      // 같은 문구를 감싸는 바깥 요소는 건너뛰고 가장 안쪽만 남긴다
      if ([...el.children].some((ch) => (ch.textContent ?? '').trim().startsWith(n))) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      out.push({ text: t.slice(0, 22), w: +r.width.toFixed(1), h: +r.height.toFixed(1), top: +r.top.toFixed(1) });
    }
  }
  return out;
};

const clickLabel = async (page, t) => {
  const b = page.locator('button', { hasText: new RegExp(`^\\s*${t}\\s*$`) }).first();
  if (await b.count()) { await b.click(); await page.waitForTimeout(800); }
};

const browser = await chromium.launch();

const p1 = await browser.newPage({ viewport: { width: 1100, height: 1100 } });
await p1.goto(pathToFileURL(resolve(root, '.design-ref', 'momgirok-v8.html')).href, { waitUntil: 'networkidle', timeout: 120_000 });
await p1.waitForTimeout(2500);
await clickLabel(p1, label);
if (protoState) await clickLabel(p1, protoState);
const a = await p1.evaluate(probe, needles);

const p2 = await browser.newPage({ viewport: { width: 375, height: 760 } });
await p2.addInitScript(() => {
  window.localStorage.setItem('wellness.auth-session.v2', JSON.stringify({ accessToken: 'shoot', userId: 'shoot', mode: 'authenticated', onboardingComplete: true }));
});
await p2.goto('http://localhost:8081' + route, { waitUntil: 'networkidle', timeout: 90_000 });
await p2.waitForTimeout(1800);
const b = await p2.evaluate(probe, needles);

// 프로토타입은 프레임이 페이지 안쪽에 있으므로 top 을 프레임 기준으로 보정한다
const frameTop = await p1.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find((d) => {
    const r = d.getBoundingClientRect();
    return Math.round(r.width) === 375 && Math.round(r.height) === 812;
  });
  return el ? el.getBoundingClientRect().top + 52 : 0; // +52 = 상태바
});

const fmt = (rows, off = 0) => rows
  .map((r) => `    ${JSON.stringify(r.text).padEnd(26)} w=${String(r.w).padStart(7)}  h=${String(r.h).padStart(6)}  top=${(r.top - off).toFixed(1)}`)
  .join('\n');

console.log('프로토타입:\n' + (fmt(a, frameTop) || '    (없음)'));
console.log('구현:\n' + (fmt(b) || '    (없음)'));

await browser.close();
