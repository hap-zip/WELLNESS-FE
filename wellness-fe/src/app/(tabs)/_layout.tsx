import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs backgroundColor="#FFFFFF" tintColor="#1257E0">
      <NativeTabs.Trigger name="home"><Icon sf={{ default: 'house', selected: 'house.fill' }} /><Label>홈</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="records"><Icon sf={{ default: 'calendar', selected: 'calendar.circle.fill' }} /><Label>기록</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover"><Icon sf={{ default: 'point.3.connected.trianglepath.dotted', selected: 'point.3.filled.connected.trianglepath.dotted' }} /><Label>커넥션 뷰</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat"><Icon sf={{ default: 'message', selected: 'message.fill' }} /><Label>챗</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="me"><Icon sf={{ default: 'person', selected: 'person.fill' }} /><Label>마이</Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
