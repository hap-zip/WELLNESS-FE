import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from './consent.styles';

export default function ConsentScreen() {
  const router = useRouter();
  const [photoConsent, setPhotoConsent] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          accessibilityLabel="서비스 안내로 돌아가기"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>
            민감정보 동의가{`\n`}필요해요
          </Text>
          <Text style={styles.description}>건강정보 수집·이용에 대한 동의를 받아요.</Text>
        </View>

        <View style={styles.consentList}>
          <View style={styles.consentRow}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>
                건강정보 수집·이용 <Text style={styles.required}>(필수)</Text>
              </Text>
              <Text style={styles.rowDescription}>불편·수면·활동 기록</Text>
            </View>
            <View accessibilityLabel="필수 동의 완료" style={styles.checkedBox}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>

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

        <Pressable accessibilityRole="button" style={styles.detailButton}>
          <Text style={styles.detailText}>동의 상세 보기</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(onboarding)/baseline')}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <Text style={styles.continueText}>동의하고 계속</Text>
        </Pressable>
      </View>
    </View>
  );
}
