import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { styles } from './splash.styles';

export default function SplashScreen() {
  const router = useRouter(); const { isRestoring, session } = useAuth();
  useEffect(() => { if (isRestoring) return; const target = !session ? '/(auth)/login' : session.onboardingComplete === false ? '/(onboarding)/intro' : '/(tabs)/home'; const timer = setTimeout(() => router.replace(target), 900); return () => clearTimeout(timer); }, [isRestoring, router, session]);
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}><StatusBar style="dark"/><View accessibilityLabel="몸기록" accessibilityRole="image" style={styles.symbol}><View style={styles.appIcon}><View style={styles.leaf}/><View style={styles.egg}/></View><Text style={styles.wordmark}>몸기록</Text></View></SafeAreaView>;
}
