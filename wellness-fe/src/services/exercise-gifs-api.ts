/**
 * ExerciseGymGifsDB(https://github.com/JahelCuadrado/ExerciseGymGifsDB) 연동.
 * API 키·가입 없이 GitHub + jsDelivr CDN에 정적으로 올라간 JSON/GIF 를 그대로 fetch 한다.
 * "stretching" 카테고리 전체(56개 안팎)를 한 번 받아 메모리에 캐싱하고, 우리 앱의 한글
 * 부위 라벨(목/어깨/손목/허리 등)은 이 API의 bodyPart·muscle 필드로 매핑해 걸러낸다.
 */

const STRETCHING_URL = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/api/en/categories/stretching.json';

export type StretchExercise = {
  id: string;
  slug: string;
  name: string;
  muscle: string;
  bodyPart: string;
  equipment: string;
  category: string;
  secondaryMuscles?: string[];
  instructions: string[];
  gifUrl: string;
};

/** 앱에서 쓰는 부위 라벨 → API 의 muscle/bodyPart 값 매칭 키워드. */
export const STRETCH_BODY_PARTS: { label: string; keywords: string[] }[] = [
  { label: '목', keywords: ['neck', 'levator-scapulae', 'traps'] },
  { label: '어깨', keywords: ['shoulders', 'delts'] },
  { label: '팔꿈치·팔', keywords: ['triceps', 'biceps', 'forearms'] },
  { label: '손목', keywords: ['forearms', 'wrist'] },
  { label: '허리·등', keywords: ['back', 'lats', 'lower-back', 'upper-back', 'spine'] },
  { label: '가슴', keywords: ['chest', 'pectorals'] },
  { label: '고관절·엉덩이', keywords: ['glutes', 'adductors', 'abductors', 'hip-flexors'] },
  { label: '다리', keywords: ['legs', 'hamstrings', 'calves', 'quads'] },
  { label: '코어', keywords: ['core', 'abs'] },
];

let cache: Promise<StretchExercise[]> | null = null;

async function fetchAllStretches(): Promise<StretchExercise[]> {
  const res = await fetch(STRETCHING_URL);
  if (!res.ok) throw new Error(`stretching.json 요청 실패 (${res.status})`);
  const data = (await res.json()) as { exercises?: StretchExercise[] };
  if (!Array.isArray(data.exercises)) throw new Error('stretching.json 형식이 예상과 달라요');
  return data.exercises;
}

/** 앱 세션 동안 한 번만 받아오고 재사용한다 — 화면을 오갈 때마다 다시 받을 필요 없다. */
export function getAllStretches(): Promise<StretchExercise[]> {
  if (!cache) cache = fetchAllStretches().catch((err) => { cache = null; throw err; });
  return cache;
}

export function matchesBodyPart(item: StretchExercise, label: string): boolean {
  const part = STRETCH_BODY_PARTS.find((p) => p.label === label);
  if (!part) return false;
  const haystack = `${item.bodyPart} ${item.muscle} ${(item.secondaryMuscles ?? []).join(' ')}`.toLowerCase();
  return part.keywords.some((k) => haystack.includes(k));
}

/** 텍스트(백엔드가 준 루틴/동작 이름 등)에서 몸 부위 라벨을 찾아낸다 — "목·어깨" 처럼
 * 라벨 자체가 "·"로 묶인 복합어라, 각 조각이 문장 어디에 들어 있는지로 판단한다. */
function findBodyPartLabel(text: string): string | undefined {
  return STRETCH_BODY_PARTS.find((part) => part.label.split('·').some((word) => text.includes(word)))?.label;
}

/**
 * 실제 루틴 텍스트(동작 이름·설명, 부위)에 맞는 스트레칭 GIF를 고른다. 백엔드가 정확한
 * slug를 주지 않아서 부위 키워드로 최선의 후보를 찾는다 — 맞는 후보가 없으면 undefined를
 * 돌려주고, 화면은 이때만 손그림/도형으로 대체해야 한다(엉뚱한 운동을 보여주면 안 된다).
 */
export function pickStretchFor(exercises: StretchExercise[], text: string, seedIndex = 0): StretchExercise | undefined {
  const label = findBodyPartLabel(text);
  if (!label) return undefined;
  const candidates = exercises.filter((item) => matchesBodyPart(item, label));
  if (candidates.length === 0) return undefined;
  return candidates[seedIndex % candidates.length];
}

/**
 * 문자열(보통 routineId·targetArea)에서 고정된 인덱스를 뽑아낸다. `pickStretchFor`의
 * seedIndex를 단계 번호(i, moveIndex)로 주면 한 루틴 안에서 단계마다 서로 다른(엉뚱한)
 * 운동 GIF가 튀어나온다 — 백엔드 stepsData는 "서로 다른 동작"이 아니라 "하나의 스트레칭을
 * 설명하는 문장 4개"라서, 같은 루틴이면 항상 같은 GIF를 보여줘야 한다.
 */
export function stableSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}
