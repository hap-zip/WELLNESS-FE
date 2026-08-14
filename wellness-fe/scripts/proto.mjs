/**
 * 프로토타입(`Momgirok v8.dc.html`) 자체를 브라우저에서 렌더해 375×812 프레임만 잘라 찍는다.
 * 내가 만든 RN 화면 스크린샷과 나란히 놓고 비교하기 위한 "정답지" 생성기다.
 *
 *   node scripts/proto.mjs 홈 proto-home
 *   node scripts/proto.mjs 홈 proto-home-empty --state=기록전
 *   node scripts/proto.mjs 기록 proto-records --dark
 *
 * 좌측 사이드바 버튼의 라벨로 화면을 고른다 (TABS / FLOW / 마이 하위 / ENTRY 섹션).
 * `--state=` 는 홈 화면의 '홈 상태' 세그먼트 라벨 (기록 완료 / 기록 전 / 동기화 중 / 동기화 오류).
 *
 * 프레임 맨 위 52px 은 프로토타입이 그린 가짜 상태바다. RN 쪽 웹 스크린샷에는
 * 상태바가 없으므로 기본으로 잘라내 높이를 맞춘다 (--with-status 로 남길 수 있음).
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [label = '홈', name = 'proto', ...flags] = process.argv.slice(2);
const dark = flags.includes('--dark');
const withStatus = flags.includes('--with-status');
const state = flags.find((f) => f.startsWith('--state='))?.slice(8);
const scroll = Number(flags.find((f) => f.startsWith('--scroll='))?.slice(9) ?? 0);
const clicks = flags.filter((f) => f.startsWith('--click=')).map((f) => f.slice(8));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, '.design-ref', 'momgirok-v8.html');
const outDir = join(root, '.design-ref', 'shots');
await mkdir(outDir, { recursive: true });

const STATUS_BAR = 52;

/** React 가 style 속성을 다시 직렬화하므로 문자열 매칭 대신 실제 크기로 프레임을 찾는다. */
const findFrame = () => {
  const el = [...document.querySelectorAll('div')].find((d) => {
    const r = d.getBoundingClientRect();
    return Math.round(r.width) === 375 && Math.round(r.height) === 812;
  });
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1100 }, deviceScaleFactor: 3 });

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForFunction(findFrame, { timeout: 60_000 });

const clickLabel = async (t) => {
  const btn = page.locator('button', { hasText: new RegExp(`^\\s*${t}\\s*$`) }).first();
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(450); }
  else console.warn(`  (버튼 없음: ${t})`);
};

if (dark) await clickLabel('다크');
await clickLabel(label);
if (state) await clickLabel(state);
for (const t of clicks) await clickLabel(t);

// 등장 450ms + 진행바 700ms(200ms 지연) 이후
await page.waitForTimeout(1600);

if (scroll) {
  await page.evaluate((y) => {
    const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 40 && e.clientHeight > 400 && Math.abs(e.clientWidth - 375) < 2);
    if (el) el.scrollTop = y;
  }, scroll);
  await page.waitForTimeout(400);
}

const box = await page.evaluate(findFrame);
const crop = withStatus ? 0 : STATUS_BAR;
const out = join(outDir, `${name}.png`);
await page.screenshot({
  path: out,
  clip: { x: box.x, y: box.y + crop, width: box.width, height: box.height - crop },
});

await browser.close();
console.log(`proto ${label}${state ? ` / ${state}` : ''} → .design-ref/shots/${name}.png  (375×${812 - crop}${dark ? ', dark' : ''})`);
