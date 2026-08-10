import { ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/ui/page-header';
import StateNotice from '@/components/state-notice';

import { styles } from './settings.styles';

export default function EmptyStatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <SafeAreaView edges={['top']} style={styles.screen}>
    <PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="상태 안내" />
    <ScrollView contentContainerStyle={[styles.content,{paddingBottom:insets.bottom+36}]}>
      <Text accessibilityRole="header" style={styles.guideTitle}>멈추지 않고 이어갈 수 있게</Text><Text style={styles.guideDescription}>데이터가 없거나 문제가 생기면 이유와 다음 행동을 함께 안내합니다.</Text>
      <Text style={styles.sectionTitle}>기록 없음</Text><StateNotice actionLabel="오늘 상태 기록하기" description="첫 기록을 남기면 날짜별 변화가 이곳에 표시돼요." icon="＋" onAction={()=>router.push('/check/auto')} title="아직 기록이 없어요"/>
      <Text style={styles.sectionTitle}>건강 데이터 연결 필요</Text><StateNotice actionLabel="건강 데이터 설정" description="연결하지 않아도 직접 입력으로 오늘 기록을 계속할 수 있어요." onAction={()=>router.push('/settings/health')} onSecondaryAction={()=>router.push('/check/auto')} secondaryActionLabel="직접 입력으로 계속" title="자동으로 가져올 데이터가 없어요"/>
      <Text style={styles.sectionTitle}>일시적 오류</Text><StateNotice actionLabel="다시 시도" description="네트워크 상태를 확인하고 다시 시도해 주세요. 작성 중인 내용은 유지돼요." icon="!" onAction={()=>router.back()} title="불러오지 못했어요" tone="error"/>
      <Text style={styles.sectionTitle}>완료</Text><StateNotice description="변경한 설정이 안전하게 반영됐어요." icon="✓" title="저장됐어요" tone="success"/>
    </ScrollView>
  </SafeAreaView>;
}
