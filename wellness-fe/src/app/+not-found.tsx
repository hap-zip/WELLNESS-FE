import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import StateNotice from '@/components/state-notice';
import { colors, layout } from '@/theme/tokens';

export default function NotFoundScreen() {
  const router=useRouter();
  return <SafeAreaView edges={['top','bottom']} style={styles.screen}><StateNotice actionLabel="홈으로 이동" description="주소가 바뀌었거나 더 이상 제공하지 않는 화면이에요." onAction={()=>router.replace('/(tabs)/home')} title="화면을 찾을 수 없어요"/></SafeAreaView>;
}

const styles=StyleSheet.create({screen:{flex:1,justifyContent:'center',paddingHorizontal:layout.horizontalPadding,backgroundColor:colors.canvas}});
