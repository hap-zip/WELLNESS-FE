import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/app-icon';
import StateNotice from '@/components/state-notice';
import type { UserProfileSummary } from '@/domain/wellness';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { styles } from './me.styles';

export default function MeScreen(){
  const router=useRouter(); const insets=useSafeAreaInsets();
  const{data,error,isLoading,reload}=useAsyncData<UserProfileSummary|null>(wellnessApi.getUserProfile,null);
  useFocusEffect(useCallback(()=>{void reload().catch(()=>undefined)},[reload]));
  return <SafeAreaView edges={['top']} style={styles.screen}><ScrollView contentContainerStyle={[styles.content,{paddingBottom:insets.bottom+76}]} showsVerticalScrollIndicator={false}>
    {isLoading?<View style={styles.center}><ActivityIndicator color={colors.primary}/></View>:error||!data?<StateNotice actionLabel="다시 시도" description="네트워크 상태를 확인한 뒤 다시 시도해 주세요." icon="!" onAction={()=>void reload().catch(()=>undefined)} title="내 정보를 불러오지 못했어요" tone="error"/>:<>
      <Text style={styles.pageTitle}>마이</Text>
      <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{data.name.slice(0,1)}</Text></View><View style={styles.profileCopy}><Text style={styles.name}>{data.name}</Text><Text style={styles.email}>{data.email}</Text></View></View>
      <View style={styles.stats}><Stat label="기록한 날" value={`${data.recordDays}일`}/><View style={styles.divider}/><Stat label="완료한 루틴" value={`${data.routineCount}회`}/><View style={styles.divider}/><Stat label="함께한 기간" value={data.joinedLabel}/></View>
      <Section title="건강 관리"><Menu label="건강 데이터" onPress={()=>router.push('/settings/health')} value={data.healthConnected?'연결됨':'연결 안 됨'}/><Menu label="알림 설정" onPress={()=>router.push('/settings/notifications')} value={data.notificationEnabled?'사용 중':'꺼짐'}/></Section>
      <Section title="기록과 정보"><Menu label="기록 요약 만들기" onPress={()=>router.push('/reports/setup')}/><Menu label="동의·데이터 관리" onPress={()=>router.push('/settings/data')}/><Menu label="계정 관리" onPress={()=>router.push('/settings/account')}/><Menu label="서비스 정보·문의" onPress={()=>router.push('/settings/info')}/></Section>
      <Text style={styles.version}>몸기록 1.0.0</Text>
    </>}
  </ScrollView></SafeAreaView>;
}
function Section({children,title}:{children:React.ReactNode;title:string}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.menuGroup}>{children}</View></View>}
function Stat({label,value}:{label:string;value:string}){return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>}
function Menu({label,onPress,value}:{label:string;onPress:()=>void;value?:string}){return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>[styles.menu,pressed&&styles.pressed]}><Text style={styles.menuLabel}>{label}</Text>{value?<Text style={styles.menuValue}>{value}</Text>:null}<AppIcon color={colors.textMuted} name="chevron-right" size={18}/></Pressable>}
