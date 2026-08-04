import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { styles } from './consent.styles';

export default function ConsentScreen() {
  const router = useRouter();
  const [healthConsent, setHealthConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.backButton}><NavigationBackButton accessibilityLabel="서비스 안내로 돌아가기" confirmDiscard={healthConsent || photoConsent} fallbackHref="/(onboarding)/intro" /></View>

        <View style={styles.header}>
          <Text style={styles.title}>
            민감정보 동의가{`\n`}필요해요
          </Text>
          <Text style={styles.description}>건강정보 수집·이용에 대한 동의를 받아요.</Text>
        </View>

        <View style={styles.consentList}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: healthConsent }} onPress={() => setHealthConsent((current) => !current)} style={({ pressed }) => [styles.consentRow, pressed && styles.pressed]}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>
                건강정보 수집·이용 <Text style={styles.required}>(필수)</Text>
              </Text>
              <Text style={styles.rowDescription}>불편·수면·활동 기록</Text>
            </View>
            <View style={[styles.uncheckedBox, healthConsent && styles.checkedBox]}>
              {healthConsent ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: photoConsent }}
            onPress={() => setPhotoConsent((current) => !current)}
            style={({ pressed }) => [styles.consentRow, styles.optionalRow, pressed && styles.pressed]}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>
                피부 사진 저장 <Text style={styles.optional}>(선택)</Text>
              </Text>
              <Text style={styles.deleteNotice}>언제든 삭제할 수 있어요</Text>
            </View>
            <View style={[styles.uncheckedBox, photoConsent && styles.checkedBox]}>
              {photoConsent && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => Alert.alert('건강정보 수집·이용', '불편 부위, 수면, 활동 및 피부 상태 기록을 개인화된 패턴 분석을 위해 저장합니다. 선택한 피부 사진은 별도 동의를 받은 경우에만 저장합니다.')} style={styles.detailButton}>
          <Text style={styles.detailText}>동의 상세 보기</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !healthConsent }}
          disabled={!healthConsent}
          onPress={() => router.push('/(onboarding)/baseline')}
          style={({ pressed }) => [styles.continueButton, !healthConsent && styles.disabledButton, pressed && styles.pressed]}>
          <Text style={styles.continueText}>동의하고 계속</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
