/**
 * `Momgirok v8.dc.html` → 기록 플로우(6단계)의 시연 데이터·좌표·문구를 그대로 옮긴 것.
 * ZONES 좌표는 viewBox 290×448 기준이며 실제 렌더 시 K = 212/290 배율을 곱한다.
 */

export type BodyView = 'front' | 'back';

export type Zone = { id: string; label: string; view: BodyView; left: number; top: number; width: number; height: number };

export const ZONES: Zone[] = [
  { id: 'front-head', label: '머리 앞', view: 'front', left: 117, top: 12, width: 54, height: 54 },
  { id: 'front-shoulder-left', label: '왼쪽 어깨 앞', view: 'front', left: 62, top: 78, width: 70, height: 48 },
  { id: 'front-shoulder-right', label: '오른쪽 어깨 앞', view: 'front', left: 157, top: 78, width: 70, height: 48 },
  { id: 'front-arm-left', label: '왼쪽 팔 앞', view: 'front', left: 44, top: 120, width: 58, height: 116 },
  { id: 'front-arm-right', label: '오른쪽 팔 앞', view: 'front', left: 187, top: 120, width: 58, height: 116 },
  { id: 'front-chest', label: '가슴', view: 'front', left: 105, top: 116, width: 80, height: 62 },
  { id: 'front-abdomen', label: '복부', view: 'front', left: 108, top: 178, width: 74, height: 80 },
  { id: 'front-leg-left', label: '왼쪽 다리 앞', view: 'front', left: 83, top: 258, width: 62, height: 174 },
  { id: 'front-leg-right', label: '오른쪽 다리 앞', view: 'front', left: 146, top: 258, width: 62, height: 174 },
  { id: 'back-head', label: '머리 뒤', view: 'back', left: 117, top: 12, width: 54, height: 54 },
  { id: 'back-neck', label: '목 뒤', view: 'back', left: 119, top: 63, width: 52, height: 48 },
  { id: 'back-shoulder-left', label: '왼쪽 어깨 뒤', view: 'back', left: 62, top: 88, width: 70, height: 50 },
  { id: 'back-shoulder-right', label: '오른쪽 어깨 뒤', view: 'back', left: 157, top: 88, width: 70, height: 50 },
  { id: 'back-arm-left', label: '왼쪽 팔 뒤', view: 'back', left: 44, top: 130, width: 58, height: 110 },
  { id: 'back-arm-right', label: '오른쪽 팔 뒤', view: 'back', left: 187, top: 130, width: 58, height: 110 },
  { id: 'back-upper', label: '등 위', view: 'back', left: 105, top: 116, width: 80, height: 70 },
  { id: 'back-lower', label: '허리', view: 'back', left: 108, top: 186, width: 74, height: 72 },
  { id: 'back-leg-left', label: '왼쪽 다리 뒤', view: 'back', left: 83, top: 258, width: 62, height: 174 },
  { id: 'back-leg-right', label: '오른쪽 다리 뒤', view: 'back', left: 146, top: 258, width: 62, height: 174 },
];
export const ZONE_LABELS: Record<string, string> = Object.fromEntries(ZONES.map((z) => [z.id, z.label]));
export const BODY_MAP_SCALE = 212 / 290;

export type HkState = 'ok' | 'sync' | 'perm' | 'none' | 'err';
export const HK_STATES: { id: HkState; label: string }[] = [
  { id: 'ok', label: '정상' }, { id: 'sync', label: '동기화 중' }, { id: 'perm', label: '권한 부족' },
  { id: 'none', label: '데이터 없음' }, { id: 'err', label: '오류' },
];

export type HkTone = 'ok' | 'muted' | 'warn' | 'err';
export type HkField = 'sleep' | 'steps' | 'energy';
export type HkRow = { key: string; field: HkField; label: string; value: string; source: string; tone: HkTone; icon: 'sleep' | 'steps' | 'flame'; actions?: string[] };

/** 자동 수집 항목의 "직접 입력" — 백엔드가 정수(분/걸음/kcal)를 받아서 문자열 대신 숫자로 든다. */
export type HkManual = { sleep: number | null; steps: number | null; energy: number | null };
export const HK_KEY_FOR: Record<HkField, string> = { sleep: '수면 시간', steps: '걸음 수', energy: '활동 에너지' };

export function hkRowsFor(state: HkState, manual: HkManual = { sleep: null, steps: null, energy: null }, auto: HkManual = { sleep: null, steps: null, energy: null }): HkRow[] {
  const manualValue = (field: keyof HkManual) => {
    const v = manual[field];
    if (v === null) return null;
    return field === 'sleep' ? fmtSleep(v) : field === 'steps' ? `${v.toLocaleString()}보` : `${v}kcal`;
  };
  const mk = (field: HkField, icon: HkRow['icon'], value: string, source: string, tone: HkTone, actions?: string[]): HkRow => {
    const key = HK_KEY_FOR[field];
    const mv = manualValue(field);
    return mv !== null ? { key, field, label: key, value: mv, source: '직접 입력', tone: 'ok', icon } : { key, field, label: key, value, source, tone, icon, actions };
  };
  if (state === 'sync') return [
    mk('sleep', 'sleep', '· · ·', '동기화 중', 'muted'),
    mk('steps', 'steps', '· · ·', '동기화 중', 'muted'),
    mk('energy', 'flame', '· · ·', '동기화 중', 'muted'),
  ];
  if (state === 'perm') return [
    mk('sleep', 'sleep', '연결 필요', 'Apple 건강 연결 상태를 확인해 주세요', 'warn', ['설정에서 허용', '직접 입력']),
    mk('steps', 'steps', '연결 필요', 'Apple 건강 연결 상태를 확인해 주세요', 'warn', ['설정에서 허용', '직접 입력']),
    mk('energy', 'flame', '연결 필요', 'Apple 건강 연결 상태를 확인해 주세요', 'warn', ['설정에서 허용', '직접 입력']),
  ];
  if (state === 'none') return [
    mk('sleep', 'sleep', '기록 없음', '어젯밤 측정된 데이터가 없어요', 'muted', ['직접 입력']),
    mk('steps', 'steps', '0보', 'Apple 건강', 'ok'),
    mk('energy', 'flame', '기록 없음', '어젯밤 측정된 데이터가 없어요', 'muted', ['직접 입력']),
  ];
  if (state === 'err') return [
    mk('sleep', 'sleep', '불러오기 실패', '동기화 중 오류가 났어요', 'err', ['다시 시도', '직접 입력']),
    mk('steps', 'steps', '불러오기 실패', '동기화 중 오류가 났어요', 'err', ['다시 시도', '직접 입력']),
  ];
  return [
    mk('sleep', 'sleep', auto.sleep !== null ? fmtSleep(auto.sleep) : '기록 없음', 'Apple 건강 · 방금 동기화', auto.sleep !== null ? 'ok' : 'muted', auto.sleep === null ? ['직접 입력'] : undefined),
    mk('steps', 'steps', auto.steps !== null ? `${auto.steps.toLocaleString()}보` : '기록 없음', 'Apple 건강 · 방금 동기화', auto.steps !== null ? 'ok' : 'muted', auto.steps === null ? ['직접 입력'] : undefined),
    mk('energy', 'flame', auto.energy !== null ? `${auto.energy}kcal` : '기록 없음', 'Apple 건강 · 방금 동기화', auto.energy !== null ? 'ok' : 'muted', auto.energy === null ? ['직접 입력'] : undefined),
  ];
}

/** hkRowsFor 의 표시용 문자열과 짝이 맞는 실제 숫자값 — 제출용 DTO 는 정수가 필요해서 따로 든다. */
export function hkAutoNumeric(state: HkState, auto: HkManual = { sleep: null, steps: null, energy: null }): HkManual {
  if (state === 'ok') return auto;
  if (state === 'perm') return { sleep: null, steps: null, energy: null };
  if (state === 'none') return { sleep: null, steps: 0, energy: null };
  return { sleep: null, steps: null, energy: null };
}

/** 수면 시간은 1단계(자동 수집·직접 입력)에서만 정해진다 — 수면 단계는 그 값을 그대로
 * 보여주기만 하고, 자체 입력 수단은 두지 않는다. 그마저 없을 때만 안전한 기본값을 쓴다. */
const DEFAULT_SLEEP_MIN = 0;
export function resolvedSleepMin(state: HkState, manual: HkManual, auto: HkManual = { sleep: null, steps: null, energy: null }): number {
  return manual.sleep ?? hkAutoNumeric(state, auto).sleep ?? DEFAULT_SLEEP_MIN;
}

export function hkNoteFor(state: HkState) {
  return state === 'ok' ? '값이 다르면 각 항목을 눌러 직접 수정할 수 있어요.'
    : state === 'sync' ? '오래 걸리면 건너뛰고 직접 입력해도 괜찮아요.'
    : state === 'perm' ? '허용하지 않아도 직접 입력으로 기록을 완성할 수 있어요.'
    : state === 'none' ? '자동으로 잡히지 않은 값만 직접 채우면 돼요.'
    : '연결이 불안정해요. 직접 입력한 값은 그대로 저장됩니다.';
}

export const FEELS = ['뻐근함', '찌릿함', '당김', '묵직함', '화끈함'];

/** 백엔드 posture enum 과 1:1로 맞춘 7종. */
export type PoseId = 'straight' | 'left' | 'right' | 'facedown' | 'curled' | 'propped' | 'unknown';
export const SLEEP_POSES: { id: PoseId; label: string; backend: string }[] = [
  { id: 'straight', label: '똑바로', backend: '똑바로' },
  { id: 'left', label: '왼쪽으로', backend: '왼쪽으로' },
  { id: 'right', label: '오른쪽으로', backend: '오른쪽으로' },
  { id: 'facedown', label: '엎드려서', backend: '엎드려서' },
  { id: 'curled', label: '웅크려서', backend: '웅크려서' },
  { id: 'propped', label: '상체를 세우고', backend: '상체를 세우고' },
  { id: 'unknown', label: '잘 모르겠어요', backend: '잘 모르겠어요' },
];

export const PILLOW_LABELS = ['낮음', '보통', '높음'];
/** 화면 라벨은 짧게 두고, 백엔드로 보낼 때만 이 문장형으로 바꾼다. */
export const PILLOW_BACKEND = ['낮았어요', '적당했어요', '높았어요'];

/** 백엔드 satisfaction 은 1~5 정수 — index 0(가장 좋음)이 5점, index 4가 1점. */
export const SLEEP_QUALITY_LABELS = ['아주 잘 잤어요', '잘 잤어요', '보통이에요', '설쳤어요', '거의 못 잤어요'];

export const SIT_LABELS_LONG = ['1시간 미만', '1~3시간', '3~5시간', '5~8시간', '8시간 이상'];
export const SIT_LABELS_SHORT = ['<1h', '1–3h', '3–5h', '5–8h', '8h+'];
export const SKIN_STATES = ['좋음', '보통', '건조', '번들거림'];
export const TROUBLE_SPOTS = ['이마', '볼', '턱', '목', '등'];

/** 백엔드 condition enum. */
export type ConditionId = 'great' | 'good' | 'okay' | 'bad' | 'awful';
export const CONDITION_OPTIONS: { id: ConditionId; label: string }[] = [
  { id: 'great', label: '아주 좋아요' },
  { id: 'good', label: '좋아요' },
  { id: 'okay', label: '보통이에요' },
  { id: 'bad', label: '안 좋아요' },
  { id: 'awful', label: '최악이에요' },
];
export const CONDITION_TAGS = ['피곤함', '스트레스', '활기참', '집중 잘됨', '편안함', '예민함'];

/** 제목의 `\n` 은 강제 줄바꿈이다 — 2줄 고정으로 화면 높이를 안정시킨다(B-1). */
export const STEP_META = [
  { label: '1 / 5 오늘의 시작', title: '어젯밤 데이터를\n가져왔어요', desc: '자동으로 가져온 값을 확인하고, 오늘 컨디션도 함께 남겨요.' },
  { label: '2 / 5 불편한 곳', title: '불편한 부위가\n있나요?', desc: '부위를 고르면 바로 아래에서 강도와 느낌을 남길 수 있어요. 없다면 건너뛰어도 괜찮아요.' },
  { label: '3 / 5 수면', title: '어젯밤 잠은\n어땠나요?', desc: '시간과 만족도, 자세와 베개 높이를 함께 남겨요.' },
  { label: '4 / 5 활동·피부', title: '오늘 하루는\n어땠나요?', desc: '앉아 있던 시간과 피부 상태를 골라주세요.' },
  { label: '5 / 5 검토', title: '이렇게 저장할까요?', desc: '수정할 항목은 오른쪽 수정을 눌러 해당 단계로 돌아가요.' },
];

export function fmtSleep(min: number) {
  const h = Math.floor(min / 60), r = min % 60;
  return r ? `${h}시간 ${r}분` : `${h}시간`;
}
