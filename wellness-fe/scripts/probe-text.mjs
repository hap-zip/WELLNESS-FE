/** 프로토타입이 실제로 렌더한 문자열을 그대로 뽑아 본다 (공백 포함 확인용). */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const needle = process.argv[2] ?? '불편';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 1100 } });
await page.goto(pathToFileURL(resolve(root, '.design-ref', 'momgirok-v8.html')).href, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(2500);

const out = await page.evaluate((needle) => {
  const res = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    const t = n.nodeValue ?? '';
    if (t.includes(needle)) res.add(JSON.stringify(t));
  }
  return [...res];
}, needle);

console.log(out.join('\n') || '(없음)');
await browser.close();
