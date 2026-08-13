import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Momi } from '@/components/momi';
import { useAsyncData } from '@/hooks/use-async-data';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';
import { completeStyles as styles } from './routine-complete.styles';

export default function RoutineCompleteScreen() {
  const router=useRouter(); const insets=useSafeAreaInsets(); const params=useLocalSearchParams<{routineId?:string;seconds?:string;steps?:string}>();
  const routineId=typeof params.routineId==='string'?params.routineId:''; const seconds=Number(params.seconds??0); const steps=Number(params.steps??0);
  const save=useCallback(()=>wellnessApi.saveRoutineCompletion(routineId,seconds,steps),[routineId,seconds,steps]); const {data,error,isLoading,reload}=useAsyncData(save,null);
  return <SafeAreaView edges={['top','bottom']} style={styles.screen}><ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>{isLoading?<><ActivityIndicator color={colors.primary}/><Text style={styles.status}>완료 기록을 저장하는 중</Text></>:error||!data?<><Text style={styles.errorTitle}>완료 기록을 저장하지 못했어요</Text><Pressable onPress={()=>void reload().catch(()=>undefined)} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></Pressable></>:<><View accessibilityLabel="루틴 완료" style={styles.check}><Momi mood="cheer" showShadow size={104}/></View><Text style={styles.eyebrow}>이번 주 3번째 루틴</Text><Text accessibilityRole="header" style={styles.title}>루틴을 마쳤어요</Text><View style={styles.summary}><Summary label="실행 시간" value={`${Math.floor(seconds/60)}분 ${seconds%60}초`}/><View style={styles.divider}/><Summary label="완료한 동작" value={`${steps}개`}/><View style={styles.divider}/><Summary label="적용 부위" value="목·어깨"/></View><View style={styles.feelingBlock}><Text style={styles.feelingTitle}>지금 몸은 어떤가요?</Text><View style={styles.feelings}><Text style={styles.feeling}>한결 편해요</Text><Text style={styles.feeling}>비슷해요</Text><Text style={styles.feeling}>더 불편해요</Text></View></View><Text style={styles.description}>내일 아침에 “어제 루틴이 도움이 됐나요?”라고 한 번 더 물어볼게요. 답을 모아 다음 추천에 반영해요.</Text></>}</ScrollView>{!isLoading&&!error&&data?<View style={[styles.actions,{paddingBottom:Math.max(insets.bottom,12)}]}><Pressable accessibilityRole="button" onPress={()=>router.replace({pathname:'/routine/feedback',params:{routineId}})} style={styles.laterButton}><Text numberOfLines={1} style={styles.laterText}>효과 미리 답하기</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.dismissTo('/(tabs)/home')} style={styles.primaryButton}><Text style={styles.primaryText}>홈으로</Text></Pressable></View>:null}</SafeAreaView>;
}
function Summary({label,value}:{label:string;value:string}){return <View style={styles.summaryItem}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;}
