import { Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import StateNotice from '@/components/state-notice';
import { styles } from './settings.styles';

const STATES=[
  ['03 · 빈 상태','아직 기록이 없어요','첫 기록을 남기면 날짜별 변화가 이곳에 표시돼요.','＋','default'],
  ['04 · 검색 결과 없음',"'어깨 통증'에 맞는 기록이 없어요",'검색어를 지우거나 전체 기간에서 찾아보세요.','⌕','default'],
  ['05 · 이 날 기록 없음','이 날의 기록이 없어요','원하면 지나간 날짜도 직접 기록할 수 있어요.','○','default'],
  ['06 · 건강 데이터 없음','어젯밤 측정된 데이터가 없어요','Apple Watch를 착용하지 않은 날일 수 있어요. 직접 입력으로 계속할 수 있어요.','♡','default'],
  ['07 · 권한 없음','건강 데이터 접근이 꺼져 있어요','걸음과 활동 항목만 막혀 있어요. 설정에서 허용하거나 직접 입력하세요.','▣','default'],
  ['08 · 오프라인','인터넷에 연결되지 않았어요','기록은 기기에 저장했다가 연결되면 자동으로 올려요.','↯','default'],
  ['09 · 네트워크 오류','연결이 불안정해요','입력한 값은 사라지지 않았어요. 연결을 확인하고 다시 시도해 주세요.','!','error'],
  ['10 · 서버 오류','일시적인 문제가 생겼어요','입력 내용은 안전하게 남아 있어요. 오류 코드 503','!','error'],
  ['11 · 30일 미충족','18일 기록했어요','해석까지 12일 남았지만 추이 차트는 지금도 볼 수 있어요.','☺','default'],
  ['12 · 저장 중','기록을 저장하는 중','잠시만 기다려 주세요.','···','default'],
  ['13 · 저장 성공','8월 13일 기록을 저장했어요','오늘의 기록이 안전하게 반영됐어요.','✓','success'],
  ['14 · 저장 실패','저장하지 못했어요','입력한 값은 기기에 남겨뒀어요. 다시 시도할 수 있어요.','×','error'],
  ['15 · 동기화 중','Apple 건강에서 가져오는 중','어젯밤 데이터를 확인하고 있어요.','···','default'],
  ['16 · 동기화 완료','오전 7:02 기준으로 동기화됐어요','3개 항목을 가져왔어요.','✓','success'],
] as const;

export default function EmptyStatesScreen(){
  const router=useRouter(); const insets=useSafeAreaInsets(); const [selected,setSelected]=useState(0);
  const labels=['최초 로딩','부분 로딩',...STATES.map(([label])=>label.replace(/^\d+ · /,''))];
  const state=selected>=2?STATES[selected-2]:null;
  return <SafeAreaView edges={['top']} style={styles.screen}><View style={styles.stateHeader}><Text accessibilityRole="header" style={styles.stateHeaderTitle}>공통 상태</Text><Text style={styles.stateCount}>{selected+1} / 16</Text></View><ScrollView horizontal contentContainerStyle={styles.stateTabs} showsHorizontalScrollIndicator={false}>{labels.map((label,index)=><Pressable key={label} onPress={()=>setSelected(index)} style={[styles.stateTab,index===selected&&styles.stateTabSelected]}><Text style={[styles.stateTabText,index===selected&&styles.stateTabTextSelected]}>{label}</Text></Pressable>)}</ScrollView><ScrollView contentContainerStyle={[styles.stateContent,{paddingBottom:insets.bottom+36}]}>{selected===0?<Skeleton rows={4}/>:selected===1?<Skeleton rows={3}/>:state?<StateNotice actionLabel={state[4]==='success'?undefined:state[0].startsWith('11')?'추이 차트 보기':state[0].startsWith('06')||state[0].startsWith('07')?'직접 입력하기':'다시 시도'} description={state[2]} icon={state[3]} onAction={state[4]==='success'?undefined:()=>state[0].startsWith('06')||state[0].startsWith('07')?router.push('/check/auto'):router.back()} title={state[1]} tone={state[4]==='default'?'neutral':state[4]}/>:null}</ScrollView></SafeAreaView>;
}
function Skeleton({rows}:{rows:number}){return <View accessibilityLabel="불러오는 중" accessibilityRole="progressbar" style={styles.skeleton}>{Array.from({length:rows},(_,index)=><View key={index} style={[styles.skeletonLine,index===0&&styles.skeletonShort,index===1&&styles.skeletonLong]}/>)}</View>;}
