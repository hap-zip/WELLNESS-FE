import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function ChatbotIcon({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) {
  return <Svg accessibilityElementsHidden height={size} viewBox="0 0 24 24" width={size}>
    <Path d="M12 2.5v2" stroke={color} strokeLinecap="round" strokeWidth="1.8" /><Circle cx="12" cy="2.5" fill={color} r="1.2" />
    <Rect fill="none" height="13" rx="4" stroke={color} strokeWidth="1.8" width="18" x="3" y="5" />
    <Circle cx="8.5" cy="11" fill={color} r="1.35" /><Circle cx="15.5" cy="11" fill={color} r="1.35" />
    <Path d="M8.5 14.5c1.8 1.4 5.2 1.4 7 0M8 18v2.5l3-2.5" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
  </Svg>;
}

export function SendIcon({ color = '#FFFFFF', size = 21 }: { color?: string; size?: number }) {
  return <Svg accessibilityElementsHidden height={size} viewBox="0 0 24 24" width={size}><Path d="M4 11.4 19.2 4c.7-.3 1.4.4 1.1 1.1L13 20.4c-.3.7-1.3.6-1.5-.1l-1.3-6.5-6.1-1c-.8-.1-.9-1.1-.1-1.4Z" fill="none" stroke={color} strokeLinejoin="round" strokeWidth="1.8" /><Path d="m10.4 13.6 4.3-4.2" stroke={color} strokeLinecap="round" strokeWidth="1.8" /></Svg>;
}
