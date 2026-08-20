import type { StateIconId } from '@/components/glyphs';

/** `Momgirok v8.dc.html` → `STATES` 를 그대로 옮긴 것. 16종 + 스켈레톤 2종 = 18개 탭. */

export type StateKind = 'skeleton' | 'message' | 'toast';
export type StateTone = 'err' | 'warn' | 'ok' | 'busy' | undefined;

export type StateDef = {
  id: string;
  label: string;
  kind: StateKind;
  rows?: number[];
  icon?: StateIconId;
  tone?: StateTone;
  title: string;
  body: string;
  ctas?: string[];
};

export const STATES: StateDef[] = [
  { id: 'boot', label: '최초 로딩', kind: 'skeleton', rows: [22, 132, 58, 58], title: '', body: '' },
  { id: 'partial', label: '부분 로딩', kind: 'skeleton', rows: [22, 58, 58], title: '', body: '' },
  { id: 'empty', label: '빈 상태', kind: 'message', icon: 'plus', title: '아직 기록이 없어요', body: '오늘 몸 상태를 남기면 여기에 쌓여요.', ctas: ['오늘 기록하기'] },
  { id: 'nosearch', label: '검색 결과 없음', kind: 'message', icon: 'search', title: '"어깨 통증"에 맞는 기록이 없어요', body: '다른 낱말이나 기간으로 다시 찾아보세요.', ctas: ['전체 기간에서 찾기', '검색어 지우기'] },
  { id: 'norecord', label: '기록 없음', kind: 'message', icon: 'plus', title: '이 날의 기록이 없어요', body: '기억나는 상태를 지금 남길 수 있어요.', ctas: ['이 날 기록하기'] },
  { id: 'nohealth', label: '건강 데이터 없음', kind: 'message', icon: 'health', title: '어젯밤 측정된 데이터가 없어요', body: 'Apple Watch를 착용하지 않은 날일 수 있어요. 직접 입력해도 기록은 완성돼요.', ctas: ['직접 입력하기'] },
  { id: 'noperm', label: '권한 없음', kind: 'message', icon: 'lock', tone: 'warn', title: '건강 데이터 접근이 꺼져 있어요', body: '걸음과 활동 항목만 막혀 있어요. 허용하지 않아도 직접 입력할 수 있어요.', ctas: ['설정에서 허용', '직접 입력하기'] },
  { id: 'offline', label: '오프라인', kind: 'message', icon: 'offline', tone: 'warn', title: '인터넷에 연결되지 않았어요', body: '기록은 기기에 저장했다가 연결되면 자동으로 올려요.', ctas: ['다시 연결 시도'] },
  { id: 'neterr', label: '네트워크 오류', kind: 'message', icon: 'wifi', tone: 'err', title: '연결이 불안정해요', body: '잠시 후 다시 시도해주세요. 입력한 값은 사라지지 않아요.', ctas: ['다시 시도'] },
  { id: 'servererr', label: '서버 오류', kind: 'message', icon: 'server', tone: 'err', title: '일시적인 문제가 생겼어요', body: '문제가 계속되면 고객지원으로 알려주세요. (오류 코드 503)', ctas: ['다시 시도', '고객지원 문의'] },
  { id: 'gate30', label: '30일 미충족', kind: 'message', icon: 'gate', title: '18일 기록했어요', body: '30일이 모이면 패턴 해석이 열려요. 추이 차트는 지금도 볼 수 있어요.', ctas: ['추이 차트 보기'] },
  { id: 'saving', label: '저장 중', kind: 'toast', tone: 'busy', title: '기록을 저장하는 중', body: '저장이 끝나기 전에 화면을 닫아도 이어서 올려요.' },
  { id: 'saved', label: '저장 성공', kind: 'toast', tone: 'ok', title: '8월 13일 기록을 저장했어요', body: '홈과 캘린더에 바로 반영됐어요.' },
  { id: 'savefail', label: '저장 실패', kind: 'toast', tone: 'err', title: '저장하지 못했어요', body: '입력한 값은 기기에 남겨뒀어요. 다시 시도하면 그대로 올라가요.', ctas: ['다시 시도'] },
  { id: 'syncing', label: '동기화 중', kind: 'toast', tone: 'busy', title: 'Apple 건강에서 가져오는 중', body: '오래 걸리면 건너뛰고 직접 입력해도 괜찮아요.' },
  { id: 'synced', label: '동기화 완료', kind: 'toast', tone: 'ok', title: '오전 7:02 기준으로 동기화됐어요', body: '수면·걸음·활동 3개 항목을 가져왔어요.' },
];
