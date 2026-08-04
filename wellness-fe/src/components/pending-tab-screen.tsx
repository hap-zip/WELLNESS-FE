import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PendingTabScreen({ title, description }: { title: string; description: string }) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
        <Text style={{ color: '#17191C', fontSize: 28, lineHeight: 38, fontWeight: '800' }}>{title}</Text>
        <View style={{ marginTop: 24, padding: 20, borderRadius: 16, backgroundColor: '#F7F8FA' }}>
          <Text style={{ color: '#4A4F58', fontSize: 15, lineHeight: 23 }}>{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
