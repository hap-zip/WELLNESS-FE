/**
 * Pretendard 정적 웨이트를 assets/fonts/ 로 받아온다.
 *
 * 프로토타입(`Momgirok v8.dc.html`)이 쓰는 웨이트는 400/500/600/700 네 종뿐이라
 * 그 네 개만 받는다. iOS는 fontWeight 숫자만으로 웨이트별 파일을 고르지 못하므로
 * `src/theme/typography.ts` 가 파일명을 직접 지정한다.
 *
 *   node scripts/download-fonts.mjs
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = 'v1.3.9';
const BASE = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@${VERSION}/packages/pretendard/dist/public/static`;
const FILES = ['Pretendard-Regular.otf', 'Pretendard-Medium.otf', 'Pretendard-SemiBold.otf', 'Pretendard-Bold.otf'];

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts');

const exists = async (p) => access(p).then(() => true, () => false);

await mkdir(outDir, { recursive: true });

for (const file of FILES) {
  const dest = join(outDir, file);
  if (await exists(dest)) {
    console.log(`skip  ${file} (already present)`);
    continue;
  }
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`${file}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`saved ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

console.log(`\nPretendard ${VERSION} → assets/fonts/`);
