import { useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import NavigationBackButton from '@/components/navigation-back-button';
import type { AssistantMessage, AssistantReply } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { colors } from '@/theme/tokens';

import { styles } from './assistant.styles';

type ChatItem = AssistantMessage & {
  action?: AssistantReply['action'];
  references?: AssistantReply['references'];
  officialInfo?: AssistantReply['officialInfo'];
  photoUri?: string;
};

const INITIAL_SUGGESTIONS = ['최근 수면 흐름을 정리해줘', '목이 불편했던 날을 찾아줘', '오늘 할 루틴을 추천해줘'];

export default function AssistantScreen({ asTab = false }: { asTab?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatItem>>(null);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [input, setInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [failedPrompt, setFailedPrompt] = useState('');

  const send = async (raw: string) => {
    const text = raw.trim() || (photoUri ? '포장 사진으로 약 정보 확인해줘' : '');
    if (!text || pending) return;
    const userMessage: ChatItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      photoUri: photoUri ?? undefined,
      createdAt: new Date().toISOString(),
    };
    const history = [...messages, userMessage];
    const attached = photoUri;
    setMessages(history);
    setInput('');
    setPhotoUri(null);
    setSuggestions([]);
    setPending(true);
    setFailedPrompt('');
    try {
      const reply = await wellnessApi.askRecordAssistant(attached ? `${text} 포장사진` : text, history);
      setMessages((current) => [...current, { ...reply.message, action: reply.action, references: reply.references, officialInfo: reply.officialInfo }]);
      setSuggestions(reply.suggestions);
    } catch {
      setFailedPrompt(text);
      setInput(text);
    } finally {
      setPending(false);
    }
  };

  const attachMedicinePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 접근 권한이 필요해요', '약 포장 사진을 첨부하려면 기기 설정에서 사진 접근을 허용해 주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      if (!input) setInput('이 약 정보를 확인해줘');
    }
  };

  const reportButton = (
    <Pressable accessibilityLabel="기록 요약 만들기" accessibilityRole="button" onPress={() => router.push('/reports/setup')} style={({ pressed }) => [styles.reportButton, pressed && styles.pressed]}>
      <AppIcon color={colors.text} name="document" size={20} />
    </Pressable>
  );

  const header = asTab ? (
    <View style={styles.tabHeader}>
      <View>
        <Text accessibilityRole="header" style={styles.tabTitle}>웰니스 챗</Text>
        <Text style={styles.scope}>최근 14일 기록을 참고해요</Text>
      </View>
      {reportButton}
    </View>
  ) : (
    <View style={styles.topBar}>
      <NavigationBackButton accessibilityLabel="이전 화면으로 돌아가기" fallbackHref="/(tabs)/home" />
      <View style={styles.compactHeaderCopy}>
        <Text accessibilityRole="header" style={styles.compactTitle}>웰니스 챗</Text>
        <Text style={styles.compactScope}>최근 14일 기록</Text>
      </View>
      {reportButton}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        {header}
        <FlatList
          ref={listRef}
          contentContainerStyle={[styles.list, messages.length === 0 && styles.emptyList]}
          data={messages}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<ConversationStart onSelect={(value) => void send(value)} suggestions={suggestions} />}
          ListFooterComponent={(
            <>
              {pending ? <View accessibilityLiveRegion="polite" style={styles.reading}><View style={styles.readingLine} /><Text style={styles.readingText}>기록을 읽는 중</Text></View> : null}
              {failedPrompt ? <View style={styles.errorRow}><Text style={styles.errorText}>답변을 가져오지 못했어요.</Text><Pressable accessibilityRole="button" onPress={() => void send(failedPrompt)} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : null}
            </>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <Message item={item} onAction={(route) => router.push(route)} />}
          showsVerticalScrollIndicator={false}
        />
        {messages.length > 0 && suggestions.length > 0 ? <FollowUpList onSelect={(value) => void send(value)} suggestions={suggestions} /> : null}
        {photoUri ? <Attachment onRemove={() => setPhotoUri(null)} uri={photoUri} /> : null}
        <View style={[styles.composer, { paddingBottom: asTab ? 10 : Math.max(insets.bottom, 10) }]}>
          <Text style={styles.composerLabel}>기록이나 의약품 정보에 관해 물어보세요</Text>
          <View style={styles.composerRow}>
            <Pressable accessibilityLabel="약 포장 사진 첨부" accessibilityRole="button" onPress={() => void attachMedicinePhoto()} style={({ pressed }) => [styles.attach, pressed && styles.pressed]}>
              <AppIcon color={colors.text} name="camera" size={21} />
            </Pressable>
            <TextInput
              accessibilityLabel="웰니스 챗 질문"
              blurOnSubmit={false}
              editable={!pending}
              maxLength={300}
              multiline
              onChangeText={setInput}
              onSubmitEditing={() => void send(input)}
              placeholder="궁금한 내용을 입력하세요"
              placeholderTextColor={colors.placeholder}
              returnKeyType="send"
              style={styles.input}
              value={input}
            />
            <Pressable accessibilityLabel="메시지 보내기" accessibilityRole="button" accessibilityState={{ busy: pending, disabled: (!input.trim() && !photoUri) || pending }} disabled={(!input.trim() && !photoUri) || pending} onPress={() => void send(input)} style={({ pressed }) => [styles.send, ((!input.trim() && !photoUri) || pending) && styles.sendDisabled, pressed && styles.pressed]}>
              <AppIcon color={colors.white} name="arrow-up" size={20} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConversationStart({ suggestions, onSelect }: { suggestions: string[]; onSelect: (value: string) => void }) {
  return (
    <View style={styles.start}>
      <Text accessibilityRole="header" style={styles.startTitle}>기록에서 무엇을{`\n`}찾아볼까요?</Text>
      <Text style={styles.startDescription}>수면, 불편 부위, 활동과 루틴 기록을 함께 읽어 정리해 드려요. 진단이나 처방은 제공하지 않아요.</Text>
      <Text style={styles.indexTitle}>바로 물어보기</Text>
      <View style={styles.questionIndex}>
        {suggestions.map((suggestion) => (
          <Pressable accessibilityRole="button" key={suggestion} onPress={() => onSelect(suggestion)} style={({ pressed }) => [styles.questionRow, pressed && styles.questionPressed]}>
            <View style={styles.questionIcon}><AppIcon color={colors.primary} name="message" size={17} /></View>
            <Text style={styles.questionText}>{suggestion}</Text>
            <AppIcon color={colors.textMuted} name="chevron-right" size={18} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FollowUpList({ suggestions, onSelect }: { suggestions: string[]; onSelect: (value: string) => void }) {
  return (
    <View style={styles.followUp}>
      <Text style={styles.followUpTitle}>이어서 물어보기</Text>
      {suggestions.slice(0, 2).map((suggestion) => (
        <Pressable accessibilityRole="button" key={suggestion} onPress={() => onSelect(suggestion)} style={({ pressed }) => [styles.followUpRow, pressed && styles.questionPressed]}>
          <Text style={styles.followUpText}>{suggestion}</Text>
          <AppIcon color={colors.textMuted} name="chevron-right" size={17} />
        </Pressable>
      ))}
    </View>
  );
}

function Attachment({ uri, onRemove }: { uri: string; onRemove: () => void }) {
  return (
    <View style={styles.attachment}>
      <Image accessibilityLabel="첨부한 약 포장 사진" source={{ uri }} style={styles.attachmentImage} />
      <View style={styles.attachmentCopy}><Text style={styles.attachmentTitle}>약 포장 사진</Text><Text style={styles.attachmentHint}>제품명과 표기 내용을 확인해요</Text></View>
      <Pressable accessibilityLabel="첨부 사진 제거" accessibilityRole="button" onPress={onRemove} style={styles.attachmentRemove}><AppIcon color={colors.text} name="close" size={18} /></Pressable>
    </View>
  );
}

function Message({ item, onAction }: { item: ChatItem; onAction: (route: NonNullable<AssistantReply['action']>['route']) => void }) {
  if (item.role === 'user') {
    return (
      <View style={styles.userEntry}>
        {item.photoUri ? <Image accessibilityLabel="사용자가 첨부한 약 포장 사진" source={{ uri: item.photoUri }} style={styles.messagePhoto} /> : null}
        <View style={styles.userBlock}><Text style={styles.userText}>{item.text}</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.answerEntry}>
      <View style={styles.answerHeading}><View style={styles.assistantIcon}><AppIcon color={colors.primary} name="message" size={16}/></View><Text style={styles.answerHeadingText}>기록을 바탕으로 정리했어요</Text></View>
      <View style={styles.answerBody}><Text accessibilityLiveRegion="polite" style={styles.answerText}>{item.text}</Text></View>
      {item.references?.length ? <View style={styles.referenceLedger}><Text style={styles.referenceTitle}>참고한 기록</Text>{item.references.map((reference) => <View key={reference.label} style={styles.referenceRow}><Text style={styles.referenceLabel}>{reference.label}</Text><Text style={styles.referenceValue}>{reference.value}</Text></View>)}</View> : null}
      {item.officialInfo ? <MedicineSheet info={item.officialInfo} /> : null}
      {item.action ? <Pressable accessibilityRole="button" onPress={() => onAction(item.action!.route)} style={({ pressed }) => [styles.actionRow, pressed && styles.questionPressed]}><Text style={styles.actionText}>{item.action.label}</Text><AppIcon color={colors.data} name="arrow-up-right" size={18} /></Pressable> : null}
    </View>
  );
}

function MedicineSheet({ info }: { info: NonNullable<AssistantReply['officialInfo']> }) {
  return (
    <View style={styles.medicineSheet}>
      <View style={styles.medicineHeader}><Text style={styles.medicineSource}>공식 의약품 정보</Text><Text style={styles.medicineName}>{info.productName}</Text><Text style={styles.medicineIngredient}>{info.ingredient}</Text></View>
      <View style={styles.medicineSection}><Text style={styles.medicineLabel}>효능·효과</Text><Text style={styles.medicineText}>{info.efficacy}</Text></View>
      <View style={styles.medicineSection}><Text style={styles.medicineLabel}>복용 전 확인</Text>{info.cautions.map((caution) => <Text key={caution} style={styles.caution}>— {caution}</Text>)}</View>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(info.sourceUrl)} style={({ pressed }) => [styles.sourceRow, pressed && styles.questionPressed]}><Text style={styles.sourceText}>{info.sourceLabel}</Text><AppIcon color={colors.data} name="arrow-up-right" size={17} /></Pressable>
      <Text style={styles.medicineLimit}>사진만으로 제품이나 복용 가능 여부를 확정하지 않습니다.</Text>
    </View>
  );
}
