/**
 * 375×812 (iPhone 13 mini) 뷰포트로 Expo Web 화면을 찍는다.
 *
 * 프로토타입이 375×812 로 그려져 있으므로 같은 크기로 찍어야 나란히 겹쳐볼 수 있다.
 * iOS 시뮬레이터를 쓸 수 없는 환경에서 비율·레이아웃을 검증하는 용도다.
 * (그림자·폰트 힌팅은 RN Web 과 iOS 가 미세하게 다르다 — 최종 확인은 실기기에서.)
 *
 *   node scripts/shoot.mjs /home home
 *   node scripts/shoot.mjs /home home --full     # 전체 스크롤 높이
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [route = '/', name = 'shot', ...flags] = process.argv.slice(2);
const fullPage = flags.includes('--full');
const dark = flags.includes('--dark');
const scroll = Number(flags.find((f) => f.startsWith('--scroll='))?.slice(9) ?? 0);
const base = process.env.EXPO_WEB_URL ?? 'http://localhost:8081';

// 프로토타입 프레임은 375×812 이고 그 안 맨 위 52px 은 상태바다. 실기기에서도
// 앱이 그리는 영역은 상태바 아래 760px 이다. 웹에는 SafeArea 가 없으므로
// 뷰포트를 760 으로 잡아야 프로토타입과 같은 구간을 찍게 된다.
const STATUS_BAR = 52;
const HEIGHT = 812 - STATUS_BAR;

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '.design-ref', 'shots');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 375, height: HEIGHT },
  deviceScaleFactor: 3,
  colorScheme: dark ? 'dark' : 'light',
});

// 탭 화면은 로그인 게이트 뒤에 있다. 웹 세션은 localStorage 에 있으므로
// 첫 렌더 전에 심어 두면 로그인 화면을 거치지 않고 바로 찍을 수 있다.
// 화면 모드도 시스템이 아니라 설정에서 고른 값을 저장소에서 읽으므로
// --dark 는 OS colorScheme 이 아니라 이 앱의 저장된 선택값을 심어야 반영된다.
await page.addInitScript((isDark) => {
  window.localStorage.setItem(
    'wellness.auth-session.v2',
    JSON.stringify({ accessToken: 'shoot', userId: 'shoot', mode: 'authenticated', onboardingComplete: true }),
  );
  window.localStorage.setItem('wellness.theme-preference.v1', isDark ? 'dark' : 'light');
}, dark);

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90_000 });
// 등장 애니메이션(450ms)과 진행바 채움(700ms + 200ms 지연)이 끝난 뒤에 찍는다.
await page.waitForTimeout(1600);

if (scroll) {
  await page.evaluate((y) => {
    const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 40 && e.clientHeight > 400 && Math.abs(e.clientWidth - 375) < 2);
    if (el) el.scrollTop = y;
  }, scroll);
  await page.waitForTimeout(400);
}

const out = join(outDir, `${name}.png`);
await page.screenshot({ path: out, fullPage });
await browser.close();

console.log(`shot  ${route} → .design-ref/shots/${name}.png  (375×${HEIGHT}${fullPage ? ', full' : ''}${dark ? ', dark' : ''})`);
if (errors.length) {
  console.log(`\n${errors.length} console error(s):`);
  for (const e of errors.slice(0, 10)) console.log('  ' + e.split('\n')[0].slice(0, 200));
}
