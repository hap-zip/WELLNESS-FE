import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs backgroundColor="#FFFFFF" tintColor="#1257E0">
      <NativeTabs.Trigger name="home"><Icon sf={{ default: 'house', selected: 'house.fill' }} /><Label>오늘</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="records"><Icon sf={{ default: 'calendar', selected: 'calendar.circle.fill' }} /><Label>기록</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover"><Icon sf={{ default: 'sparkles', selected: 'sparkles' }} /><Label>발견</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="me"><Icon sf={{ default: 'person', selected: 'person.fill' }} /><Label>나</Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
