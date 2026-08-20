import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * `Momgirok v8.dc.html` 안에 인라인으로 박힌 아이콘들. path·획 굵기·크기를 그대로 옮긴다.
 * 화면에서 새 아이콘이 필요해지면 프로토타입에서 읽어 여기에 추가한다.
 */

type IconProps = { size?: number; color: string };

/** 홈 헤더 — 말풍선 + 점 3개 */
export function ChatGlyph({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.4 6.4a2.1 2.1 0 0 1 2.1-2.1h11a2.1 2.1 0 0 1 2.1 2.1v7.4a2.1 2.1 0 0 1-2.1 2.1h-6.1L7 19.8V16h-.5a2.1 2.1 0 0 1-2.1-2.1Z"
        stroke={color} strokeWidth={1.85} strokeLinejoin="round"
      />
      <Circle cx={8.8} cy={10.1} r={1.15} fill={color} />
      <Circle cx={12} cy={10.1} r={1.15} fill={color} />
      <Circle cx={15.2} cy={10.1} r={1.15} fill={color} />
    </Svg>
  );
}

/** 홈 헤더 — 알림 벨 */
export function BellGlyph({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 9.4c0-3.4-2.7-6.1-6-6.1s-6 2.7-6 6.1c0 6.6-2.8 6.6-2.8 8.6h17.6c0-2-2.8-2-2.8-8.6" />
      <Path d="M10.1 20.8h3.8" />
    </Svg>
  );
}

/** 리스트 행 끝 — 획 2 */
export function ChevronGlyph({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

/** 섹션 헤더의 "전체 →" 같은 텍스트 버튼 — 획 2.2 */
export function ChevronSmallGlyph({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** CTA 안의 오른쪽 화살표 */
export function ArrowRightGlyph({ size = 17, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14" />
      <Path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

/** 루틴 시작 CTA */
export function PlayGlyph({ size = 17, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m8 5 10 7-10 7Z" />
    </Svg>
  );
}

/** 동기화 오류 카드 */
export function WarningGlyph({ size = 17, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3.6 21 19.4H3Z" />
      <Path d="M12 9v4.4" />
      <Circle cx={12} cy={16.6} r={1.1} fill={color} stroke="none" />
    </Svg>
  );
}

/**
 * `Momgirok v8.dc.html` → `hkIcon()` 그대로. 날짜별 상세의 그룹 아이콘 5종
 * (자동 수집/불편/수면/피부/루틴)에 공용으로 쓴다.
 */
const HK_PATHS: Record<string, string[]> = {
  sleep: ['M20.4 14.6A8.7 8.7 0 0 1 9.4 3.6 8.7 8.7 0 1 0 20.4 14.6Z'],
  steps: ['M12 3c2.9 0 4.9 2.6 4.9 6.2S15 15.3 12 15.3 7.1 12.8 7.1 9.2 9.1 3 12 3Z', 'M12 16.9c2 0 3.4 1.1 3.4 2.6s-1.3 2.7-3.4 2.7-3.4-1.2-3.4-2.7 1.4-2.6 3.4-2.6Z'],
  flame: ['M12 3.2c.6 3.2 2.2 4.4 3.9 6 1.8 1.7 2.9 3.3 2.9 5.6a6.8 6.8 0 0 1-13.6 0c0-2 .8-3.4 2-4.6.3 1.4.9 2.2 1.9 2.6-.3-3.9.8-7.2 2.9-9.6Z'],
  health: ['M12 20.4C7.4 17.3 3.6 14.2 3.6 10.4A4.4 4.4 0 0 1 12 8.3a4.4 4.4 0 0 1 8.4 2.1c0 3.8-3.8 6.9-8.4 10.1Z'],
  ache: ['M15.8 8.4a5.3 5.3 0 0 1 0 7.2', 'M18.6 5.6a9.3 9.3 0 0 1 0 12.8'],
  skin: ['M12 3.4c3.9 0 6.9 3.6 6.8 8.2-.1 4.5-2.6 7.7-6.8 7.7s-6.7-3.2-6.8-7.7C5.1 7 8.1 3.4 12 3.4Z'],
  routine: ['M20.3 12a8.3 8.3 0 1 1-2.6-6', 'M20.6 4.4v4.4h-4.4', 'M10.4 9.6 15 12l-4.6 2.4Z'],
};
const HK_DOTS: Record<string, [number, number][]> = { ache: [[10.4, 12]], skin: [[10, 9.8], [14.4, 12.6], [10.8, 14.2]] };
const HK_DOT_R: Record<string, number> = { ache: 2.4, skin: 1.2 };

export type HkIconId = keyof typeof HK_PATHS;

export function HkGlyph({ id, size = 19, color }: { id: HkIconId; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {(HK_PATHS[id] ?? HK_PATHS.health).map((d, i) => (
        <Path key={`p${i}`} d={d} fill="none" stroke={color} strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {(HK_DOTS[id] ?? []).map(([cx, cy], i) => <Circle key={`c${i}`} cx={cx} cy={cy} r={HK_DOT_R[id] ?? 1.2} fill={color} />)}
    </Svg>
  );
}

/** 캘린더 — 이전 달 화살표 */
export function MonthPrevGlyph({ size = 19, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 5 8 12l7 7" />
    </Svg>
  );
}

/** 캘린더 — 다음 달 화살표 */
export function MonthNextGlyph({ size = 19, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

/** "이 날 기록 전체 보기" 버튼 끝의 화살표 — 획 2.1 */
export function ChevronMediumGlyph({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

/** 빈 상태 점선원 안의 플러스 */
export function PlusOutlineGlyph({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round">
      <Path d="M12 6v12M6 12h12" />
    </Svg>
  );
}

/** 커넥션 — 30일 게이트 잠금 카드 아이콘 */
export function LockGlyph({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect height={9.4} rx={2.4} width={14} x={5} y={10.6} />
      <Path d="M8.4 10.6V8a3.6 3.6 0 0 1 7.2 0v2.6" />
    </Svg>
  );
}

/** 커넥션 히어로 카드의 "자세히 →" 화살표 — 흰색, 획 2.3 */
export function HeroChevronGlyph({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** 비밀번호 표시 토글 — 보임 */
export function EyeGlyph({ size = 19, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={1.8} viewBox="0 0 24 24" width={size}>
      <Path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <Circle cx={12} cy={12} r={2.5} />
    </Svg>
  );
}
/** 비밀번호 표시 토글 — 가림 */
export function EyeOffGlyph({ size = 19, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={1.8} viewBox="0 0 24 24" width={size}>
      <Path d="M4 5 20 19" />
      <Path d="M9.6 6.4A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.6 3.2" />
      <Path d="M6.1 8A15 15 0 0 0 2.5 12S6 18 12 18a9.7 9.7 0 0 0 2.8-.4" />
    </Svg>
  );
}

/** 계정 관리 — 비밀번호 오류 경고 원 */
export function WarningCircleGlyph({ size = 14, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={2.2} viewBox="0 0 24 24" width={size}>
      <Circle cx={12} cy={12} r={8.6} />
      <Path d="M12 8v4.6" />
      <Circle cx={12} cy={16} fill={color} r={1} stroke="none" />
    </Svg>
  );
}

/** 요약 카드 — 링크 복사 */
export function CopyGlyph({ size = 15, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} viewBox="0 0 24 24" width={size}>
      <Rect height={11} rx={2.4} width={11} x={8.6} y={8.6} />
      <Path d="M15.4 5.4H6.8a2.4 2.4 0 0 0-2.4 2.4v8.6" />
    </Svg>
  );
}

/** 챗 입력창 — 보내기 화살표 */
export function SendArrowGlyph({ size = 17, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} viewBox="0 0 24 24" width={size}>
      <Path d="M12 19V5" />
      <Path d="m6 11 6-6 6 6" />
    </Svg>
  );
}

/** 몸기록 앱 아이콘 — 조약돌(몸) + 새싹. 스플래시·로그인에서 공용으로 쓴다. */
export function AppMarkGlyph({ size = 76 }: { size?: number }) {
  return (
    <Svg height={size} viewBox="0 0 120 120" width={size}>
      <Rect fill="#93C90F" height={120} rx={27} width={120} />
      <Path d="M60 30c16 0 28 14.6 27.5 33.4C87 81.7 76.5 94.5 60 94.5S33 81.7 32.5 63.4C32 44.6 44 30 60 30Z" fill="#FFFDF7" />
      <Path d="M61.5 30.5c-1.5-9.5 2-16 10.5-17 3 8-1.5 16-10.5 17Z" fill="#4F6D08" />
      <Path d="M58.5 30.5c-4-6.5-10.5-9-17-6.5 1 6.5 7.5 10.5 17 6.5Z" fill="#4F6D08" opacity={0.72} />
    </Svg>
  );
}

/** `Momgirok v8.dc.html` → `stateIcon()` 그대로. 공통 상태 16종 화면 전용. */
export type StateIconId = 'search' | 'lock' | 'health' | 'offline' | 'wifi' | 'server' | 'plus' | 'gate';
export function StateIconGlyph({ id, color, size = 28 }: { id: StateIconId; color: string; size?: number }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body = {
    search: <><Circle cx={11} cy={11} r={6.4} {...p} /><Path d="M15.8 15.8 20.4 20.4" {...p} /></>,
    lock: <><Rect height={9.4} rx={2.4} width={14} x={5} y={10.6} {...p} /><Path d="M8.4 10.6V8a3.6 3.6 0 0 1 7.2 0v2.6" {...p} /></>,
    health: <Path d="M12 20.4C7.4 17.3 3.6 14.2 3.6 10.4A4.4 4.4 0 0 1 12 8.3a4.4 4.4 0 0 1 8.4 2.1c0 3.8-3.8 6.9-8.4 10.1Z" {...p} />,
    offline: <>
      <Path d="M4 5 20 19" {...p} />
      <Path d="M2.6 8.8A14 14 0 0 1 8 5.6" {...p} />
      <Path d="M6.4 12.4a9 9 0 0 1 2.4-1.4" {...p} />
      <Path d="M15.4 11.2a9 9 0 0 1 2.2 1.2" {...p} />
      <Path d="M16.6 6a14 14 0 0 1 4.8 2.8" {...p} />
      <Circle cx={12} cy={17.6} fill={color} r={1.4} stroke="none" />
    </>,
    wifi: <>
      <Path d="M2.6 8.8a14 14 0 0 1 18.8 0" {...p} />
      <Path d="M6.4 12.6a9 9 0 0 1 11.2 0" {...p} />
      <Path d="M12 19.4v.01" {...p} />
      <Path d="M9.6 16.2a3.6 3.6 0 0 1 4.8 0" {...p} />
    </>,
    server: <>
      <Rect height={6} rx={2} width={16} x={4} y={4.4} {...p} />
      <Rect height={6} rx={2} width={16} x={4} y={13.6} {...p} />
      <Circle cx={8} cy={7.4} fill={color} r={1.1} stroke="none" />
      <Circle cx={8} cy={16.6} fill={color} r={1.1} stroke="none" />
    </>,
    plus: <>
      <Circle cx={12} cy={12} r={8.4} strokeDasharray="3 3.2" {...p} />
      <Path d="M12 8.4v7.2M8.4 12h7.2" {...p} />
    </>,
    gate: <>
      <Circle cx={12} cy={12} r={8.4} strokeOpacity={0.3} {...p} />
      <Path d="M12 3.6a8.4 8.4 0 0 1 7.3 12.6" {...p} />
      <Path d="M12 7.6V12l3 1.8" {...p} />
    </>,
  }[id];
  return <Svg height={size} viewBox="0 0 24 24" width={size}>{body}</Svg>;
}

/** 프로필 선택 드롭다운 화살표 */
export function DropdownGlyph({ size = 15, color }: IconProps) {
  return <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} viewBox="0 0 24 24" width={size}><Path d="m6 9 6 6 6-6" /></Svg>;
}

/** Apple 건강 연결 안내 — 방패+체크 */
export function ShieldCheckGlyph({ size = 16, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} viewBox="0 0 24 24" width={size}>
      <Path d="M12 3.2 19.4 6v5.6c0 4.4-3 7.8-7.4 9.2-4.4-1.4-7.4-4.8-7.4-9.2V6Z" />
      <Path d="M9.2 12.2 11.4 14.4 15 10.6" />
    </Svg>
  );
}

/** 카카오 로고 (원형 말풍선) */
export function KakaoGlyph({ size = 17 }: { size?: number }) {
  return <Svg fill="#191919" height={size} viewBox="0 0 24 24" width={size}><Path d="M12 3C6.9 3 3 6.3 3 10.3c0 2.6 1.7 4.9 4.3 6.2l-1 3.7c-.1.3.3.6.5.4l4.4-2.9c.3 0 .5.1.8.1 5.1 0 9-3.3 9-7.5S17.1 3 12 3Z" /></Svg>;
}

/** 로그인 화면 로고 마크 안의 3선 */
export function LogoMarkGlyph({ size = 64 }: { size?: number }) {
  return (
    <Svg height={size} viewBox="0 0 120 120" width={size}>
      <Rect fill="#93C90F" height={120} rx={27} width={120} />
      <Path d="M34 40h52M34 60h52M34 80h32" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth={9} />
    </Svg>
  );
}

/** 기록 플로우 헤더 — 닫기(X), 획 2.1 */
export function CloseGlyph({ size = 19, color }: IconProps) {
  return <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={2.1} viewBox="0 0 24 24" width={size}><Path d="M5 5 19 19M19 5 5 19" /></Svg>;
}

/** 웰니스 챗 — 근거 카드 헤더의 문서 아이콘 */
export function DocGlyph({ size = 13, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13.5 3.5H7a1.6 1.6 0 0 0-1.6 1.6v13.8A1.6 1.6 0 0 0 7 20.5h10a1.6 1.6 0 0 0 1.6-1.6V8.1Z" />
      <Path d="M13.5 3.5v4.6h4.6" />
      <Path d="M8.6 13h6.8M8.6 16.4h6.8" />
    </Svg>
  );
}

/** 웰니스 챗 헤더 — 더보기(세로 점 3개) */
export function MoreDotsGlyph({ size = 19, color }: IconProps) {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={12} cy={5} r={1.8} />
      <Circle cx={12} cy={12} r={1.8} />
      <Circle cx={12} cy={19} r={1.8} />
    </Svg>
  );
}

/** 기록 플로우 — 수면 스테퍼 −/+ */
export function StepMinusGlyph({ size = 19, color }: IconProps) {
  return <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={2.2} viewBox="0 0 24 24" width={size}><Path d="M6 12h12" /></Svg>;
}
export function StepPlusGlyph({ size = 19, color }: IconProps) {
  return <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={2.2} viewBox="0 0 24 24" width={size}><Path d="M12 6v12M6 12h12" /></Svg>;
}

/** "취침·기상 시각 직접 고르기" 시계 아이콘 */
export function ClockGlyph({ size = 15, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={1.9} viewBox="0 0 24 24" width={size}>
      <Circle cx={12} cy={12} r={8.6} />
      <Path d="M12 7.6V12l3 1.8" />
    </Svg>
  );
}

/** 사진 추가 — 카메라 */
export function CameraGlyph({ size = 20, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} viewBox="0 0 24 24" width={size}>
      <Path d="M4 7.4h3.2L9 4.6h6l1.8 2.8H20v12H4Z" />
      <Circle cx={12} cy={13.2} r={3.6} />
    </Svg>
  );
}

/** 사진 업로드 실패 — 재시도 */
export function RetryGlyph({ size = 17, color }: IconProps) {
  return (
    <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} viewBox="0 0 24 24" width={size}>
      <Path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <Path d="M20.3 4.6v4.2h-4.2" />
    </Svg>
  );
}

/** 사진 삭제 X (작은 크기, 굵은 획) */
export function SmallCloseGlyph({ size = 10, color }: IconProps) {
  return <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeWidth={3.2} viewBox="0 0 24 24" width={size}><Path d="M5 5 19 19M19 5 5 19" /></Svg>;
}

/** 부위 칩의 x 버튼 (18×18 원 안, 흰 획 3.4) */
export function ChipRemoveGlyph({ size = 9 }: { size?: number }) {
  return <Svg fill="none" height={size} stroke="#fff" strokeLinecap="round" strokeWidth={3.4} viewBox="0 0 24 24" width={size}><Path d="M5 5 19 19M19 5 5 19" /></Svg>;
}

/** 기록 완료 / 루틴 완료의 큰 체크 */
export function BigCheckGlyph({ size = 30, color = '#fff', strokeWidth = 2.8 }: { size?: number; color?: string; strokeWidth?: number }) {
  return <Svg fill="none" height={size} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} viewBox="0 0 24 24" width={size}><Path d="M4 12.5 9.5 18 20 6.5" /></Svg>;
}

/**
 * 루틴 동작 자리표시 일러스트 (목 뒤 늘이기).
 * 핸드오프 문서상 실제 일러스트로 교체 예정인 자리다.
 */
export function RoutineFigureGlyph({ size = 70, ink, accent }: { size?: number; ink: string; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityRole="image" accessibilityLabel="목 뒤 늘이기 동작">
      <Circle cx={60} cy={26} r={13} fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Path d="M60 39v30" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Path d="M60 48 38 58M60 48l22 10" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Path d="M60 69 46 100M60 69l14 31" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Path d="M74 20a13 13 0 0 1 0 13" fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round" />
      <Path d="M82 14a21 21 0 0 1 0 25" fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

/** `Momgirok v8.dc.html` → `moveIcon()` 그대로. 루틴 동작 3종 (목/어깨/가슴). */
export type MovePose = 'neck' | 'shrug' | 'chest';
export function MoveGlyph({ pose, size = 46, ink, accent }: { pose: MovePose; size?: number; ink: string; accent: string }) {
  const p = { fill: 'none', stroke: ink, strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const a = { fill: 'none', stroke: accent, strokeWidth: 4, strokeLinecap: 'round' as const };
  const body = {
    neck: <>
      <Circle cx={56} cy={26} r={13} {...p} />
      <Path d="M58 39v30" {...p} />
      <Path d="M58 48 38 58M58 48l20 10" {...p} />
      <Path d="M58 69 46 100M58 69l12 31" {...p} />
      <Path d="M74 18a13 13 0 0 1 0 14" {...a} />
      <Path d="M84 12a22 22 0 0 1 0 26" {...a} opacity={0.45} />
    </>,
    shrug: <>
      <Circle cx={60} cy={30} r={13} {...p} />
      <Path d="M60 43v28" {...p} />
      <Path d="M36 48q10-10 24-2q14-8 24 2" {...a} />
      <Path d="M60 71 48 100M60 71l12 29" {...p} />
    </>,
    chest: <>
      <Circle cx={60} cy={26} r={13} {...p} />
      <Path d="M60 39v30" {...p} />
      <Path d="M60 50q-16 4-22 16M60 50q16 4 22 16" {...a} />
      <Path d="M60 69 48 100M60 69l12 31" {...p} />
    </>,
  }[pose];
  return <Svg height={size} viewBox="0 0 120 120" width={size}>{body}</Svg>;
}

/** 효과 피드백 — 위/평평/아래 추세 아이콘 */
export type TrendKind = 'up' | 'flat' | 'down';
export function TrendGlyph({ kind, size = 18, color }: { kind: TrendKind; size?: number; color: string }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'up') return <Svg height={size} viewBox="0 0 24 24" width={size}><Path d="M4 17 10 11l4 4 6-7" {...p} /><Path d="M15 8h5v5" {...p} /></Svg>;
  if (kind === 'down') return <Svg height={size} viewBox="0 0 24 24" width={size}><Path d="M4 7 10 13l4-4 6 7" {...p} /><Path d="M15 16h5v-5" {...p} /></Svg>;
  return <Svg height={size} viewBox="0 0 24 24" width={size}><Path d="M4 12h16" {...p} /></Svg>;
}

/** 최근 기록 카드의 기분 아이콘 — 다른 곳처럼 손그림 SVG 로, 이모지를 쓰지 않는다. */
export type MoodTone = 'ok' | 'mid' | 'bad';
export function MoodGlyph({ tone, size = 18, color }: { tone: MoodTone; size?: number; color: string }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const mouth = tone === 'ok' ? 'M9 14.5c1 1.3 5 1.3 6 0' : tone === 'bad' ? 'M9 15.8c1-1.3 5-1.3 6 0' : 'M9 15h6';
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={9.3} cy={10} r={1.05} fill={color} stroke="none" />
      <Circle cx={14.7} cy={10} r={1.05} fill={color} stroke="none" />
      <Path d={mouth} {...p} />
    </Svg>
  );
}
