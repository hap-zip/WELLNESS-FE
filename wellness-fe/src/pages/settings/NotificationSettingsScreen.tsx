import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import type { NotificationSettings } from '@/domain/wellness';
import { NOTIFY_ROWS } from '@/pages/me/me.data';
import { notificationService } from '@/services/notification-service';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

const FIELD_BY_ID = { daily: 'dailyCheck', routine: 'routine', weekly: 'weeklyReport', effect: 'nextDayEffect', persist: 'persistentSignal' } as const satisfies Record<string, keyof NotificationSettings>;

export default function NotificationSettingsScreen() {
  const c = usePalette(); const router = useRouter(); const insets = useSafeAreaInsets();
  const scheme = useAppColorScheme();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [showPicker, setShowPicker] = useState(false); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''); const [error, setError] = useState('');

  useEffect(() => { let active = true; void notificationService.getSettings().then((v) => { if (active) setSettings(v); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : '알림 설정을 불러오지 못했어요.'); }); return () => { active = false; }; }, []);

  const persist = async (next: NotificationSettings) => {
    setSettings(next); setBusy(true); setError('');
    try { await notificationService.saveSettings(next); setSettings(await notificationService.getSettings()); }
    catch (e) { setError(e instanceof Error ? e.message : '알림 설정을 저장하지 못했어요.'); }
    finally { setBusy(false); }
  };
  const toggleMaster = async () => {
    if (!settings || busy) return;
    if (!settings.enabled) {
      const permission = await notificationService.requestPermission();
      if (permission !== 'granted') { setSettings({ ...settings, osPermission: permission }); setError('알림 권한이 필요해요. 기기 설정에서 허용해 주세요.'); return; }
      await persist({ ...settings, enabled: true, osPermission: permission });
    } else await persist({ ...settings, enabled: false });
  };
  const toggleRow = async (id: keyof typeof FIELD_BY_ID) => { if (settings && !busy) { const field = FIELD_BY_ID[id]; await persist({ ...settings, [field]: !settings[field] }); } };
  const onTimeChange = async (_event: unknown, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false); if (!selected || !settings) return;
    const reminderTime = `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`;
    await persist({ ...settings, reminderTime });
  };
  const sendTest = async () => { setBusy(true); setMessage(''); setError(''); try { await notificationService.scheduleTestNotification(); setMessage('3초 뒤 테스트 알림을 보낼게요.'); setSettings(await notificationService.getSettings()); } catch (e) { setError(e instanceof Error ? e.message : '테스트 알림을 보내지 못했어요.'); } finally { setBusy(false); } };
  const permissionLabel = settings?.osPermission === 'granted' ? '알림 권한 허용됨' : settings?.osPermission === 'denied' ? '알림 권한 거부됨' : '알림 권한 확인 필요';

  return <SafeAreaView edges={['top']} style={[s.screen,{backgroundColor:c.bg}]}><SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={()=>router.replace('/(tabs)/me')} title="알림 설정"/><ScrollView contentContainerStyle={{paddingBottom:insets.bottom+20}} showsVerticalScrollIndicator={false}>
    <View style={[s.section,{backgroundColor:c.card}]}><View style={[s.osBanner,{backgroundColor:c.g100}]}><View style={[s.dot,{backgroundColor:settings?.osPermission==='granted'?c.pri:c.g400}]}/><Text style={[text({size:12.5,leading:1.6}),s.flex1,{color:c.g700}]}>{permissionLabel}</Text>{settings?.osPermission==='denied'?<Pressable accessibilityRole="button" onPress={()=>void Linking.openSettings()} style={[s.osBtn,{borderColor:c.g300,backgroundColor:c.card}]}><Text style={[text({size:11.5,weight:700}),{color:c.g700}]}>설정 열기</Text></Pressable>:null}</View>
      <View style={s.masterRow}><View style={s.flex1}><Text style={[text({size:15,weight:700}),{color:c.g900}]}>전체 알림</Text><Text style={[text({size:11.5}),s.sub,{color:c.g500}]}>끄면 예약된 기록 알림도 취소돼요.</Text></View><Switch active={Boolean(settings?.enabled)} c={c} disabled={!settings||busy} label="전체 알림" onPress={()=>void toggleMaster()}/></View></View>
    <View style={[s.section,s.rowsSection,{backgroundColor:c.card,opacity:settings?.enabled?1:.5}]}><Text style={[text({size:12.5,weight:700}),{color:c.g500}]}>받을 알림</Text>{NOTIFY_ROWS.map((row,i)=>{const field=FIELD_BY_ID[row.id as keyof typeof FIELD_BY_ID];const active=Boolean(settings?.[field]);return <View key={row.id} style={[s.row,i<NOTIFY_ROWS.length-1&&{borderBottomWidth:1,borderBottomColor:c.g200}]}><View style={s.flex1}><Text style={[text({size:14.5,weight:600}),{color:c.g900}]}>{row.k}</Text><Text style={[text({size:11.5,leading:1.55}),s.sub,{color:c.g500}]}>{row.sub}</Text></View><Switch active={active} c={c} disabled={!settings?.enabled||busy} label={row.k} onPress={()=>void toggleRow(row.id as keyof typeof FIELD_BY_ID)}/></View>;})}</View>
    <View style={[s.section,s.timeSection,{backgroundColor:c.card,opacity:settings?.enabled&&settings.dailyCheck?1:.5}]}><Text style={[text({size:12.5,weight:700}),{color:c.g500}]}>기록 알림 시간</Text><Pressable accessibilityRole="button" disabled={!settings?.enabled||!settings.dailyCheck||busy} onPress={()=>setShowPicker(true)} style={[s.timeButton,{backgroundColor:c.g100,borderColor:c.g200}]}><Text style={[text({size:24,weight:700,tabular:true}),{color:c.g900}]}>{settings?formatTime(settings.reminderTime):'—'}</Text><Text style={[text({size:12,weight:700}),{color:c.priDk}]}>시간 변경</Text></Pressable>
      {showPicker&&settings?<View style={[s.picker,{backgroundColor:c.card,borderColor:c.g200}]}><DateTimePicker display={Platform.OS==='ios'?'spinner':'default'} mode="time" onChange={(e,d)=>void onTimeChange(e,d)} textColor={c.g900} themeVariant={scheme} value={dateForTime(settings.reminderTime)}/>{Platform.OS==='ios'?<Pressable onPress={()=>setShowPicker(false)} style={[s.done,{borderTopColor:c.g200}]}><Text style={[text({size:14,weight:700}),{color:c.priDk}]}>완료</Text></Pressable>:null}</View>:null}
      <Pressable accessibilityRole="button" disabled={busy} onPress={()=>void sendTest()} style={[s.test,{borderColor:c.g300}]}><Text style={[text({size:13.5,weight:700}),{color:c.g800}]}>테스트 알림 보내기</Text></Pressable>{message?<Text accessibilityLiveRegion="polite" style={[s.result,{color:c.priDk}]}>{message}</Text>:null}{error?<Text accessibilityLiveRegion="polite" style={[s.result,{color:c.dangerDk}]}>{error}</Text>:null}</View>
  </ScrollView></SafeAreaView>;
}

function Switch({active,c,disabled,label,onPress}:{active:boolean;c:ReturnType<typeof usePalette>;disabled:boolean;label:string;onPress:()=>void}){return <Pressable accessibilityLabel={label} accessibilityRole="switch" accessibilityState={{checked:active,disabled}} disabled={disabled} onPress={onPress} style={[s.track,{backgroundColor:active?c.pri:c.g300}]}><View style={[s.knob,{left:active?22:3}]}/></Pressable>;}
function dateForTime(value:string){const [h,m]=value.split(':').map(Number);const d=new Date();d.setHours(h||0,m||0,0,0);return d;}
function formatTime(value:string){return new Intl.DateTimeFormat('ko-KR',{hour:'numeric',minute:'2-digit'}).format(dateForTime(value));}

const s=StyleSheet.create({screen:{flex:1},flex1:{flex:1,minWidth:0},section:{padding:16,paddingHorizontal:20},osBanner:{flexDirection:'row',alignItems:'center',gap:11,padding:14,paddingHorizontal:16,borderRadius:16},dot:{width:7,height:7,borderRadius:4},osBtn:{minHeight:34,paddingHorizontal:12,borderWidth:1,borderRadius:18,alignItems:'center',justifyContent:'center'},masterRow:{minHeight:68,marginTop:10,flexDirection:'row',alignItems:'center',gap:14},rowsSection:{marginTop:10,paddingBottom:10},row:{minHeight:66,flexDirection:'row',alignItems:'center',gap:14},sub:{marginTop:3},track:{width:50,height:31,borderRadius:16,position:'relative'},knob:{position:'absolute',top:3,width:25,height:25,borderRadius:13,backgroundColor:'#fff'},timeSection:{marginTop:10,paddingBottom:22},timeButton:{minHeight:72,marginTop:14,paddingHorizontal:18,borderWidth:1,borderRadius:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},picker:{marginTop:10,borderWidth:1,borderRadius:18,overflow:'hidden'},done:{minHeight:44,borderTopWidth:StyleSheet.hairlineWidth,alignItems:'center',justifyContent:'center'},test:{minHeight:48,marginTop:14,borderWidth:1,borderRadius:24,alignItems:'center',justifyContent:'center'},result:{marginTop:10,fontSize:12,lineHeight:18,fontWeight:'600',textAlign:'center'}});
