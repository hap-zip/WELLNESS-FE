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
