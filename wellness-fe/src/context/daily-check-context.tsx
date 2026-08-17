import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

import type { BodyView, ConditionId, HkManual, HkState, PoseId } from '@/pages/check/check.data';

/**
 * `Momgirok v8.dc.html` 의 `state` 를 그대로 옮긴 초안 모델 + 백엔드 DailyCheckRequest
 * DTO 에 맞추기 위해 새로 추가한 필드(condition·bedtime·skippedSteps 등). 단계는
 * 0오늘의 시작(자동수집+컨디션)/1불편한 곳(부위+강도·느낌)/2수면/3활동피부/4검토 5단계를 쓴다.
 * 부위 선택과 강도·느낌은 원래 별도 단계였지만 늘 짝으로 붙어 있어서 한 단계로
 * 합쳤다 — 그 김에 부위별 강도(levels)와 중복이던 "전체 강도" 슬라이더도 뺐다.
 */

export type PhotoStatus = 'up' | 'fail' | 'done';
export type CheckPhoto = { id: string; pct: number; status: PhotoStatus; uri: string };

export type DailyCheckDraft = {
  targetDate: string | null;
  mode: 'create' | 'edit';
  step: number;
  /** 진행바가 이어서 채워지도록, 이번 단계로 넘어오기 직전 단계를 든다. 최초 진입은 -1(빈 진행바). */
  prevStep: number;
  hk: HkState;
  hkAuto: HkManual;
  hkManual: HkManual;
  condition: ConditionId | null;
  conditionTags: string[];
  view: BodyView;
  parts: string[];
  levels: Record<string, number>;
  feels: Record<string, string[]>;
  headache: boolean;
  /** 실제 취침 시각을 알 때만 채워진다(분 단위, 자정 기준) — 지금은 어떤 화면도 이 값을
   * 채우지 않는다. 나중에 건강 데이터 자동 수집이 실제 취침 시각을 줄 때를 위해 남겨둔다. */
  bedtime: number | null;
  sleepQ: number | null;
  pose: PoseId | null;
  pillow: number | null;
  sit: number | null;
  skin: string[];
  trouble: boolean;
  spots: string[];
  photos: CheckPhoto[];
  photoSeq: number;
  memo: string;
  /** 명시적으로 건너뛴 단계 이름(백엔드 skippedSteps) — 그냥 비워둔 것과 구분한다. */
  skippedSteps: string[];
};

const initialDraft: DailyCheckDraft = {
  targetDate: null,
  mode: 'create',
  step: 0,
  prevStep: -1,
  hk: 'ok',
  hkAuto: { sleep: null, steps: null, energy: null },
  hkManual: { sleep: null, steps: null, energy: null },
  condition: null,
  conditionTags: [],
  view: 'front',
  parts: [],
  levels: {},
  feels: {},
  headache: false,
  bedtime: null,
  sleepQ: null,
  pose: null,
  pillow: null,
  sit: null,
  skin: [],
  trouble: false,
  spots: [],
  photos: [],
  photoSeq: 0,
  memo: '',
  skippedSteps: [],
};

type DailyCheckContextValue = {
  draft: DailyCheckDraft;
  updateDraft: (changes: Partial<DailyCheckDraft>) => void;
  togglePart: (id: string) => void;
  setLevel: (id: string, level: number) => void;
  toggleFeel: (id: string, feel: string) => void;
  toggleSkin: (skin: string) => void;
  toggleSpot: (spot: string) => void;
  toggleConditionTag: (tag: string) => void;
  markStepSkipped: (stepName: string) => void;
  addPhoto: () => void;
  retryPhoto: (id: string) => void;
  removePhoto: (id: string) => void;
  startDraft: (date: string, mode: 'create' | 'edit') => void;
  resetDraft: () => void;
};

const DailyCheckContext = createContext<DailyCheckContextValue | null>(null);

export function DailyCheckProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<DailyCheckDraft>(initialDraft);

  const updateDraft = useCallback((changes: Partial<DailyCheckDraft>) => setDraft((cur) => ({ ...cur, ...changes })), []);

  const togglePart = useCallback((id: string) => setDraft((cur) => ({
    ...cur,
    parts: cur.parts.includes(id) ? cur.parts.filter((v) => v !== id) : [...cur.parts, id],
  })), []);

  const setLevel = useCallback((id: string, level: number) => setDraft((cur) => ({ ...cur, levels: { ...cur.levels, [id]: level } })), []);

  const toggleFeel = useCallback((id: string, feel: string) => setDraft((cur) => {
    const list = cur.feels[id] ?? [];
    return { ...cur, feels: { ...cur.feels, [id]: list.includes(feel) ? list.filter((v) => v !== feel) : [...list, feel] } };
  }), []);

  const toggleSkin = useCallback((skin: string) => setDraft((cur) => ({ ...cur, skin: cur.skin.includes(skin) ? cur.skin.filter((v) => v !== skin) : [...cur.skin, skin] })), []);
  const toggleSpot = useCallback((spot: string) => setDraft((cur) => ({ ...cur, spots: cur.spots.includes(spot) ? cur.spots.filter((v) => v !== spot) : [...cur.spots, spot] })), []);
  const toggleConditionTag = useCallback((tag: string) => setDraft((cur) => ({ ...cur, conditionTags: cur.conditionTags.includes(tag) ? cur.conditionTags.filter((v) => v !== tag) : [...cur.conditionTags, tag] })), []);
  const markStepSkipped = useCallback((stepName: string) => setDraft((cur) => (cur.skippedSteps.includes(stepName) ? cur : { ...cur, skippedSteps: [...cur.skippedSteps, stepName] })), []);

  const pickPhoto = useCallback(async (source: 'camera' | 'library') => {
    const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 권한이 필요해요', source === 'camera' ? '피부 사진을 촬영하려면 카메라 접근을 허용해 주세요.' : '피부 사진을 선택하려면 사진 보관함 접근을 허용해 주세요.', [
        { text: '취소', style: 'cancel' }, { text: '설정 열기', onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, selectionLimit: 1 });
    if (result.canceled || !result.assets[0]?.uri) return;
    const uri = result.assets[0].uri;
    setDraft((cur) => {
      const id = `p${cur.photoSeq + 1}`;
      return { ...cur, photoSeq: cur.photoSeq + 1, photos: [...cur.photos, { id, pct: 100, status: 'done', uri }] };
    });
  }, []);

  const addPhoto = useCallback(() => {
    if (Platform.OS === 'web') { void pickPhoto('library'); return; }
    Alert.alert('피부 사진 추가', '사진을 가져올 방법을 선택해 주세요.', [
      { text: '카메라로 촬영', onPress: () => void pickPhoto('camera') },
      { text: '사진에서 선택', onPress: () => void pickPhoto('library') },
      { text: '취소', style: 'cancel' },
    ]);
  }, [pickPhoto]);

  const retryPhoto = useCallback((_id: string) => { void pickPhoto('library'); }, [pickPhoto]);

  const removePhoto = useCallback((id: string) => setDraft((cur) => ({ ...cur, photos: cur.photos.filter((v) => v.id !== id) })), []);

  const startDraft = useCallback((date: string, mode: 'create' | 'edit') => setDraft({ ...initialDraft, targetDate: date, mode }), []);
  const resetDraft = useCallback(() => setDraft(initialDraft), []);

  const value = useMemo(() => ({
    draft, updateDraft, togglePart, setLevel, toggleFeel, toggleSkin, toggleSpot, toggleConditionTag, markStepSkipped,
    addPhoto, retryPhoto, removePhoto, startDraft, resetDraft,
  }), [draft, updateDraft, togglePart, setLevel, toggleFeel, toggleSkin, toggleSpot, toggleConditionTag, markStepSkipped, addPhoto, retryPhoto, removePhoto, startDraft, resetDraft]);

  return <DailyCheckContext.Provider value={value}>{children}</DailyCheckContext.Provider>;
}

export function useDailyCheck() {
  const context = useContext(DailyCheckContext);
  if (!context) throw new Error('useDailyCheck must be used inside DailyCheckProvider');
  return context;
}
