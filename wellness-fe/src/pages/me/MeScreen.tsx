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
      <Text accessibilityRole="header" style={styles.pageTitle}>마이</Text>
      <Pressable accessibilityRole="button" onPress={()=>router.push('/settings/account')} style={({pressed})=>[styles.identity,pressed&&styles.pressed]}><View style={styles.avatar}><Text style={styles.avatarText}>{data.name.slice(0,1)}</Text></View><View style={styles.identityCopy}><Text style={styles.name}>{data.name}</Text><Text style={styles.email}>{data.email}</Text></View><AppIcon color={colors.textMuted} name="chevron-right" size={19}/></Pressable>
      <View accessibilityLabel="내 활동 요약" style={styles.stats}><Stat label="기록한 날" value={`${data.recordDays}일`}/><Stat label="완료한 루틴" value={`${data.routineCount}회`}/><Stat label="함께한 기간" value={data.joinedLabel}/></View>
      <Section title="건강 관리"><Menu description="기기에서 수집한 건강 기록" icon="heart" label="건강 데이터" onPress={()=>router.push('/settings/health')} value={data.healthConnected?'연결됨':'연결 안 됨'}/><Menu description="기록과 루틴 알림 시간" icon="bell" label="알림 설정" onPress={()=>router.push('/settings/notifications')} value={data.notificationEnabled?'사용 중':'꺼짐'}/></Section>
      <Section title="기록과 정보"><Menu description="선택한 기간을 공유용으로 정리" icon="document" label="기록 요약 만들기" onPress={()=>router.push('/reports/setup')}/><Menu description="동의 내역과 저장된 데이터" icon="check" label="동의·데이터 관리" onPress={()=>router.push('/settings/data')}/><Menu description="비밀번호와 로그인 상태" icon="lock" label="계정 관리" onPress={()=>router.push('/settings/account')}/><Menu description="약관, 버전, 문의 채널" icon="info" label="서비스 정보·문의" onPress={()=>router.push('/settings/info')}/></Section>
      <Text style={styles.version}>MOMGIROK · VERSION 1.0.0</Text>
    </>}
  </ScrollView></SafeAreaView>;
}
function Section({children,title}:{children:React.ReactNode;title:string}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.menuGroup}>{children}</View></View>}
function Stat({label,value}:{label:string;value:string}){return <View style={styles.stat}><Text numberOfLines={1} style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>}
function Menu({description,icon,label,onPress,value}:{description:string;icon:React.ComponentProps<typeof AppIcon>['name'];label:string;onPress:()=>void;value?:string}){return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>[styles.menu,pressed&&styles.pressed]}><View style={styles.menuIcon}><AppIcon color={colors.primary} name={icon} size={20}/></View><View style={styles.menuCopy}><View style={styles.menuTitleRow}><Text style={styles.menuLabel}>{label}</Text>{value?<Text style={styles.menuValue}>{value}</Text>:null}</View><Text style={styles.menuDescription}>{description}</Text></View><AppIcon color={colors.textMuted} name="chevron-right" size={18}/></Pressable>}
