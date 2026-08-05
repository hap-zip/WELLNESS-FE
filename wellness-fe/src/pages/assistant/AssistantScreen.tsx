import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/navigation-back-button';
import { ChatbotIcon, SendIcon } from '@/components/chatbot-icon';
import type { AssistantMessage, AssistantReply } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';

import { styles } from './assistant.styles';

type ChatItem = AssistantMessage & { action?: AssistantReply['action'] };
const INITIAL_MESSAGE: ChatItem = { id: 'welcome', role: 'assistant', createdAt: new Date().toISOString(), text: '안녕하세요, 몸기록 AI예요. 남겨둔 기록을 함께 살펴보고 이해하기 쉽게 정리해 드릴게요. 무엇이 궁금한가요?' };
const INITIAL_SUGGESTIONS = ['최근 수면 알려줘', '목 불편 기록 알려줘', '오늘 루틴 추천해줘'];

export default function AssistantScreen() {
  const router = useRouter(); const insets = useSafeAreaInsets(); const listRef = useRef<FlatList<ChatItem>>(null);
  const [messages, setMessages] = useState<ChatItem[]>([INITIAL_MESSAGE]); const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS); const [input, setInput] = useState(''); const [pending, setPending] = useState(false); const [failedPrompt, setFailedPrompt] = useState('');
  const send = async (raw: string) => { const text = raw.trim(); if (!text || pending) return; const userMessage: ChatItem = { id: `user-${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() }; const history = [...messages, userMessage]; setMessages(history); setInput(''); setSuggestions([]); setPending(true); setFailedPrompt(''); try { const reply = await wellnessApi.askRecordAssistant(text, history); setMessages(current => [...current, { ...reply.message, action: reply.action }]); setSuggestions(reply.suggestions); } catch { setFailedPrompt(text); } finally { setPending(false); } };
  return <SafeAreaView edges={['top']} style={styles.screen}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={styles.flex}><View style={styles.topBar}><NavigationBackButton accessibilityLabel="오늘 화면으로 돌아가기" fallbackHref="/(tabs)/home" /><View style={styles.headerCopy}><Text style={styles.topTitle}>몸기록 AI</Text><View style={styles.onlineRow}><View style={styles.onlineDot}/><Text style={styles.onlineText}>AI 챗봇 · 온라인</Text></View></View><View style={styles.spacer}/></View>
    <FlatList ref={listRef} data={messages} keyExtractor={item=>item.id} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list} onContentSizeChange={()=>listRef.current?.scrollToEnd({animated:true})} renderItem={({item})=><Message item={item} onAction={route=>router.push(route)}/>} ListFooterComponent={<>{pending?<View accessibilityLiveRegion="polite" style={styles.typing}><BotAvatar/><View style={styles.typingBubble}><ActivityIndicator color="#1257E0" size="small"/><Text style={styles.typingText}>답변을 작성하고 있어요</Text></View></View>:null}{failedPrompt?<View style={styles.errorCard}><Text style={styles.errorText}>답변을 가져오지 못했어요.</Text><Pressable accessibilityRole="button" onPress={()=>void send(failedPrompt)} style={styles.retry}><Text style={styles.retryText}>다시 시도</Text></Pressable></View>:null}</>}/>
    {suggestions.length>0?<View style={styles.suggestionWrap}><FlatList horizontal data={suggestions} keyExtractor={item=>item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions} renderItem={({item})=><Pressable accessibilityRole="button" onPress={()=>void send(item)} style={({pressed})=>[styles.suggestion,pressed&&styles.pressed]}><Text style={styles.suggestionText}>{item}</Text></Pressable>}/></View>:null}
    <View style={[styles.composer,{paddingBottom:Math.max(insets.bottom,10)}]}><TextInput accessibilityLabel="몸기록 AI에게 메시지" blurOnSubmit={false} editable={!pending} maxLength={300} multiline onChangeText={setInput} onSubmitEditing={()=>void send(input)} placeholder="메시지를 입력하세요" placeholderTextColor="#9AA0AA" returnKeyType="send" style={styles.input} value={input}/><Pressable accessibilityLabel="메시지 보내기" accessibilityRole="button" disabled={!input.trim()||pending} onPress={()=>void send(input)} style={[styles.send,(!input.trim()||pending)&&styles.sendDisabled]}><SendIcon/></Pressable></View>
  </KeyboardAvoidingView></SafeAreaView>;
}

function Message({ item, onAction }: { item: ChatItem; onAction: (route: NonNullable<AssistantReply['action']>['route']) => void }) {
  const assistant = item.role === 'assistant';
  return <View style={[styles.messageRow,!assistant&&styles.userRow]}>{assistant?<BotAvatar/>:null}<View style={styles.messageColumn}><View style={[styles.bubble,assistant?styles.assistantBubble:styles.userBubble]}><Text accessibilityLiveRegion={assistant?'polite':'none'} style={[styles.messageText,!assistant&&styles.userText]}>{item.text}</Text></View>{item.action?<Pressable accessibilityRole="button" onPress={()=>onAction(item.action!.route)} style={({pressed})=>[styles.actionButton,pressed&&styles.pressed]}><Text style={styles.actionText}>{item.action.label}</Text><Text style={styles.actionArrow}>›</Text></Pressable>:null}</View></View>;
}

function BotAvatar() { return <View accessibilityLabel="몸기록 AI" style={styles.avatar}><ChatbotIcon size={21}/></View>; }
