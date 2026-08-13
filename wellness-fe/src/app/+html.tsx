import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const globalCss = `
html, body, #root { width: 100%; min-height: 100%; margin: 0; overflow-x: hidden; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
*, *::before, *::after { box-sizing: border-box; }
body { background: #F1F3F5; font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
input, textarea, button { font: inherit; }
[role="heading"] { text-wrap: balance; }
p, label { text-wrap: pretty; }
button, [role="button"], [role="tab"] { touch-action: manipulation; }
`;

export default function Root({ children }: PropsWithChildren) {
  return <html lang="ko"><head><meta charSet="utf-8"/><meta content="width=device-width, initial-scale=1" name="viewport"/><ScrollViewStyleReset/><style dangerouslySetInnerHTML={{ __html: globalCss }}/></head><body>{children}</body></html>;
}
