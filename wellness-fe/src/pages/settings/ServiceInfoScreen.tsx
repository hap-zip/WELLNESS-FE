import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { PageHeader } from '@/components/ui/page-header';
import { colors } from '@/theme/tokens';

import { styles } from './account-settings.styles';

const ITEMS = [
  { title: '서비스 안내', body: '몸기록은 몸과 생활 기록의 흐름을 스스로 이해하도록 돕는 웰니스 서비스입니다.' },
  { title: '개인정보처리방침', body: '건강·생활 기록은 사용자가 동의한 목적 안에서만 처리하며 설정에서 철회하거나 삭제할 수 있습니다.' },
  { title: '이용약관', body: '몸기록의 정보는 의료 진단이나 처방을 대신하지 않으며 긴급 상황에는 전문 기관의 도움을 받아야 합니다.' },
];

export default function ServiceInfoScreen() {
  const insets = useSafeAreaInsets();
  const [openTitle, setOpenTitle] = useState<string | null>('서비스 안내');
  return <SafeAreaView edges={['top']} style={styles.screen}>
    <PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="서비스 정보" />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <Text style={styles.sectionTitle}>안내 및 정책</Text>
      <View style={styles.disclosureGroup}>{ITEMS.map(item => { const open = openTitle === item.title; return <View key={item.title} style={styles.disclosureItem}><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenTitle(open ? null : item.title)} style={styles.disclosureButton}><Text style={styles.menuText}>{item.title}</Text><AppIcon color={colors.textMuted} name={open ? 'minus' : 'plus'} size={18}/></Pressable>{open ? <Text style={styles.disclosureBody}>{item.body}</Text> : null}</View>; })}</View>
      <Text style={styles.sectionTitle}>문의하기</Text><Pressable accessibilityRole="link" onPress={() => void Linking.openURL('mailto:support@momgiro.app?subject=몸기록 문의')} style={styles.menu}><Text style={styles.menuText}>support@momgiro.app</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}
