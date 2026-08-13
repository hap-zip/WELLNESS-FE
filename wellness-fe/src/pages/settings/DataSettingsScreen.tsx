import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/app-icon';
import { PageHeader } from '@/components/ui/page-header';
import StateNotice from '@/components/state-notice';
import type { DataConsentSettings } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { styles } from './settings.styles';

export default function DataSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, error, isLoading, reload } = useAsyncData<DataConsentSettings | null>(wellnessApi.getDataConsentSettings, null);
  const [form, setForm] = useState<DataConsentSettings | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);

  const updateMarketing = async () => {
    if (!form || busy) return;
    const next = { ...form, marketing: !form.marketing };
    setForm(next); setBusy(true);
    try { await wellnessApi.saveDataConsentSettings(next); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await wellnessApi.deleteAllUserData(); Alert.alert('삭제 완료', '저장된 사용자 데이터를 삭제했어요.', [{ text: '확인', onPress: () => router.dismissTo('/(tabs)/me') }]); }
    catch { Alert.alert('삭제 실패', '잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  };
  const confirmDelete = () => Alert.alert('모든 데이터를 삭제할까요?', '기록, 피부 사진, 루틴, 연결 정보가 삭제되며 복구할 수 없어요.', [{ text: '취소', style: 'cancel' }, { text: '모두 삭제', style: 'destructive', onPress: () => void remove() }]);
  const confirmScoped = (title: string, description: string) => Alert.alert(title, `${description}\n\n선택한 데이터는 복구할 수 없습니다.`, [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive' }]);

  return <SafeAreaView edges={['top']} style={styles.screen}><PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="동의·데이터 관리"/><ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>{isLoading ? <View style={styles.center}><ActivityIndicator color={colors.primary}/></View> : error || !form ? <StateNotice actionLabel="다시 시도" description="동의 정보를 불러오지 못했어요." icon="!" onAction={() => void reload().catch(() => undefined)} title="불러오기 실패" tone="error"/> : <>
    <Text style={styles.sectionTitle}>동의 상태</Text><View style={styles.group}><ConsentDocument label="이용약관" date={form.consentedAtLabel} required/><ConsentDocument label="개인정보 처리방침" date={form.consentedAtLabel} required/><ConsentDocument label="건강정보 처리 동의" date={form.consentedAtLabel} required/><ConsentDocument label="마케팅 정보 수신" date={form.marketing ? form.consentedAtLabel : '동의하지 않음'} onPress={() => void updateMarketing()}/></View>
    <View style={styles.dataSection}><Text style={styles.sectionTitle}>내 데이터</Text><DataMenu label="데이터 내려받기" description="전체 기록을 파일로 받아요" onPress={() => void Share.share({ title: '내 몸기록 데이터', message: '내 데이터 내려받기는 백엔드 내보내기 API 연결 후 제공됩니다.' })}/><DataMenu label="기간별 기록 삭제" description="날짜 범위를 골라 삭제해요" onPress={() => confirmScoped('최근 30일 기록을 삭제할까요?', '최근 30일 기록을 삭제 범위로 선택했습니다.')}/><DataMenu label="피부 사진만 삭제" description="기록은 남기고 사진만 지워요" onPress={() => confirmScoped('피부 사진을 삭제할까요?', '기록의 피부 상태 텍스트는 유지됩니다.')}/><DataMenu danger label="전체 데이터 삭제" description="모든 기록이 지워져요" onPress={confirmDelete}/><Text style={styles.dataCaution}>삭제는 되돌릴 수 없어요. 실행 전에 한 번 더 확인해요.</Text></View>
  </>}</ScrollView>{busy ? <View accessibilityLiveRegion="polite" style={styles.busy}><ActivityIndicator color={colors.primary}/><Text style={styles.busyText}>변경사항을 처리하는 중</Text></View> : null}</SafeAreaView>;
}

function ConsentDocument({ date, label, onPress, required = false }: { date: string; label: string; onPress?: () => void; required?: boolean }) { return <Pressable accessibilityRole={onPress ? 'button' : 'text'} disabled={!onPress} onPress={onPress} style={styles.consentDocument}><View style={styles.consentCopy}><View style={styles.consentTitleRow}><Text style={required ? styles.requiredBadge : styles.optionalBadge}>{required ? '필수' : '선택'}</Text><Text style={styles.consentTitle}>{label}</Text></View><Text style={styles.consentDate}>{date}</Text></View><Text style={styles.consentView}>전문 보기</Text></Pressable>; }
function DataMenu({ danger = false, description, label, onPress }: { danger?: boolean; description: string; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.dataMenu}><View><Text style={[styles.dataMenuText, danger && styles.dataMenuDanger]}>{label}</Text><Text style={styles.dataMenuDescription}>{description}</Text></View><AppIcon color={colors.textMuted} name="chevron-right" size={18}/></Pressable>; }
