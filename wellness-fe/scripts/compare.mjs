/**
 * 프로토타입 스크린샷과 RN 스크린샷을 나란히 + 겹쳐서 비교한다.
 *
 *   node scripts/compare.mjs proto-home tabbar-01 cmp-tabbar --crop=bottom:82
 *   node scripts/compare.mjs proto-home home-01 cmp-home --crop=top:300
 *
 * --crop=bottom:N / top:N / y:A-B  (CSS px 기준, deviceScaleFactor 는 자동 보정)
 * 출력: 좌 = 프로토타입, 중 = 구현, 우 = 차이(빨강일수록 다름)
 */
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [aName, bName, outName = 'cmp', ...flags] = process.argv.slice(2);
const cropArg = flags.find((f) => f.startsWith('--crop='))?.slice(7);
// 폰트 힌팅·안티에일리어싱 차이를 걸러내는 임계값. 레이아웃이 밀린 것은 이걸 올려도 남는다.
const threshold = Number(flags.find((f) => f.startsWith('--threshold='))?.slice(12) ?? 36);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shots = join(root, '.design-ref', 'shots');
await mkdir(shots, { recursive: true });

const dataUrl = async (n) =>
  'data:image/png;base64,' + (await readFile(join(shots, `${n}.png`))).toString('base64');

const [aUrl, bUrl] = await Promise.all([dataUrl(aName), dataUrl(bName)]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const result = await page.evaluate(
  async ({ aUrl, bUrl, cropArg, threshold }) => {
    const load = (src) => new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
    });
    const [a, b] = await Promise.all([load(aUrl), load(bUrl)]);

    // 두 이미지 모두 375 CSS px 폭으로 찍혔다고 보고 배율을 각각 계산한다.
    const sa = a.width / 375, sb = b.width / 375;

    const region = (img, s) => {
      const hCss = img.height / s;
      if (!cropArg) return { sy: 0, sh: img.height, hCss };
      const [mode, val] = cropArg.split(':');
      if (mode === 'bottom') { const n = +val; return { sy: (hCss - n) * s, sh: n * s, hCss: n }; }
      if (mode === 'top') { const n = +val; return { sy: 0, sh: n * s, hCss: n }; }
      if (mode === 'y') { const [p, q] = val.split('-').map(Number); return { sy: p * s, sh: (q - p) * s, hCss: q - p }; }
      return { sy: 0, sh: img.height, hCss };
    };

    const ra = region(a, sa), rb = region(b, sb);
    const W = 375, H = Math.max(ra.hCss, rb.hCss);
    const S = 2; // 출력 배율

    const draw = (img, r) => {
      const c = document.createElement('canvas');
      c.width = W * S; c.height = H * S;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, r.sy, img.width, r.sh, 0, 0, W * S, r.hCss * S);
      return c;
    };

    const ca = draw(a, ra), cb = draw(b, rb);

    // 차이 맵
    const cd = document.createElement('canvas');
    cd.width = W * S; cd.height = H * S;
    const xd = cd.getContext('2d');
    const da = ca.getContext('2d').getImageData(0, 0, cd.width, cd.height);
    const db = cb.getContext('2d').getImageData(0, 0, cd.width, cd.height);
    const out = xd.createImageData(cd.width, cd.height);
    let diffPx = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
      const hit = d > threshold;
      if (hit) diffPx++;
      // 배경은 원본을 흐리게, 차이는 빨강
      out.data[i] = hit ? 255 : 240 + da.data[i] * 0.06;
      out.data[i + 1] = hit ? 30 : 240 + da.data[i + 1] * 0.06;
      out.data[i + 2] = hit ? 30 : 240 + da.data[i + 2] * 0.06;
      out.data[i + 3] = 255;
    }
    xd.putImageData(out, 0, 0);

    const gap = 16 * S;
    const total = document.createElement('canvas');
    total.width = W * S * 3 + gap * 2; total.height = H * S;
    const xt = total.getContext('2d');
    xt.fillStyle = '#DDE1E6'; xt.fillRect(0, 0, total.width, total.height);
    xt.drawImage(ca, 0, 0);
    xt.drawImage(cb, W * S + gap, 0);
    xt.drawImage(cd, (W * S + gap) * 2, 0);

    document.body.style.margin = '0';
    document.body.appendChild(total);
    return {
      dataUrl: total.toDataURL('image/png'),
      diffPct: ((diffPx / (cd.width * cd.height)) * 100).toFixed(2),
      w: total.width, h: total.height,
    };
  },
  { aUrl, bUrl, cropArg, threshold },
);

const buf = Buffer.from(result.dataUrl.split(',')[1], 'base64');
await (await import('node:fs/promises')).writeFile(join(shots, `${outName}.png`), buf);
await browser.close();

console.log(`compare ${aName} vs ${bName} → .design-ref/shots/${outName}.png`);
console.log(`  좌=프로토타입  중=구현  우=차이   |  다른 픽셀 ${result.diffPct}%`);
