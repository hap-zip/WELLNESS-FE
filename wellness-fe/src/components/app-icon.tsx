import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

export type AppIconName = 'alert' | 'bell' | 'calendar' | 'camera' | 'check' | 'chevron-left' | 'chevron-right' | 'close' | 'connection' | 'copy' | 'document' | 'download' | 'heart' | 'help' | 'home' | 'image' | 'info' | 'message' | 'minus' | 'pause' | 'person' | 'play' | 'plus' | 'share' | 'trend-down' | 'trend-up';

type Props = { color?: string; name: AppIconName; size?: number; strokeWidth?: number };

export function AppIcon({ color = '#18201C', name, size = 24, strokeWidth = 1.8 }: Props) {
  const common = { fill: 'none', stroke: color, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth };
  return <Svg accessibilityElementsHidden focusable={false} height={size} importantForAccessibility="no-hide-descendants" viewBox="0 0 24 24" width={size}>
    {name === 'bell' ? <><Path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><Path {...common} d="M10 21h4"/></> : null}
    {name === 'person' ? <><Circle {...common} cx="12" cy="8" r="4"/><Path {...common} d="M4.5 21c.7-4.2 3.2-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/></> : null}
    {name === 'trend-up' ? <><Polyline {...common} points="4 16 10 10 14 14 20 8"/><Polyline {...common} points="15 8 20 8 20 13"/></> : null}
    {name === 'trend-down' ? <><Polyline {...common} points="4 8 10 14 14 10 20 16"/><Polyline {...common} points="15 16 20 16 20 11"/></> : null}
    {name === 'minus' ? <Line {...common} x1="5" x2="19" y1="12" y2="12"/> : null}
    {name === 'help' ? <><Circle {...common} cx="12" cy="12" r="9"/><Path {...common} d="M9.5 9a2.7 2.7 0 0 1 5.2 1c0 2-2.7 2.3-2.7 4"/><Circle cx="12" cy="17.5" fill={color} r="1"/></> : null}
    {name === 'heart' ? <Path {...common} d="M20.8 5.7c-2-2.1-5.2-2.1-7.2 0L12 7.4l-1.6-1.7c-2-2.1-5.2-2.1-7.2 0-2.1 2.2-2.1 5.7 0 7.9L12 22l8.8-8.4c2.1-2.2 2.1-5.7 0-7.9Z"/> : null}
    {name === 'check' ? <Polyline {...common} points="4 12.5 9.5 18 20 6.5"/> : null}
    {name === 'close' ? <><Line {...common} x1="5" x2="19" y1="5" y2="19"/><Line {...common} x1="19" x2="5" y1="5" y2="19"/></> : null}
    {name === 'chevron-left' ? <Polyline {...common} points="15 5 8 12 15 19"/> : null}
    {name === 'chevron-right' ? <Polyline {...common} points="9 5 16 12 9 19"/> : null}
    {name === 'plus' ? <><Line {...common} x1="12" x2="12" y1="5" y2="19"/><Line {...common} x1="5" x2="19" y1="12" y2="12"/></> : null}
    {name === 'info' ? <><Circle {...common} cx="12" cy="12" r="9"/><Line {...common} x1="12" x2="12" y1="11" y2="17"/><Circle cx="12" cy="7.5" fill={color} r="1"/></> : null}
    {name === 'alert' ? <><Path {...common} d="M10.2 4.1 2.8 18a2 2 0 0 0 1.8 2.9h14.8a2 2 0 0 0 1.8-2.9L13.8 4.1a2 2 0 0 0-3.6 0Z"/><Line {...common} x1="12" x2="12" y1="9" y2="14"/><Circle cx="12" cy="17.5" fill={color} r="1"/></> : null}
    {name === 'document' ? <><Path {...common} d="M6 3h8l4 4v14H6Z"/><Polyline {...common} points="14 3 14 8 18 8"/><Line {...common} x1="9" x2="15" y1="13" y2="13"/><Line {...common} x1="9" x2="15" y1="17" y2="17"/></> : null}
    {name === 'camera' ? <><Path {...common} d="M4 7h3l2-3h6l2 3h3v13H4Z"/><Circle {...common} cx="12" cy="13" r="4"/></> : null}
    {name === 'image' ? <><RectIcon common={common}/><Circle {...common} cx="9" cy="9" r="1.5"/><Polyline {...common} points="4 18 9 13 12 16 15 12 20 17"/></> : null}
    {name === 'copy' ? <><Path {...common} d="M8 8h12v12H8Z"/><Path {...common} d="M16 8V4H4v12h4"/></> : null}
    {name === 'share' ? <><Circle {...common} cx="18" cy="5" r="2"/><Circle {...common} cx="6" cy="12" r="2"/><Circle {...common} cx="18" cy="19" r="2"/><Line {...common} x1="8" x2="16" y1="11" y2="6"/><Line {...common} x1="8" x2="16" y1="13" y2="18"/></> : null}
    {name === 'download' ? <><Path {...common} d="M12 3v12"/><Polyline {...common} points="7 10 12 15 17 10"/><Path {...common} d="M5 20h14"/></> : null}
    {name === 'play' ? <Path {...common} d="m8 5 10 7-10 7Z"/> : null}
    {name === 'pause' ? <><Line {...common} x1="9" x2="9" y1="5" y2="19"/><Line {...common} x1="15" x2="15" y1="5" y2="19"/></> : null}
    {name === 'home' ? <><Path {...common} d="m3 11 9-8 9 8"/><Path {...common} d="M5.5 9.5V21h13V9.5"/><Path {...common} d="M9.5 21v-6h5v6"/></> : null}
    {name === 'calendar' ? <><Path {...common} d="M4 5h16v16H4Z"/><Line {...common} x1="4" x2="20" y1="9" y2="9"/><Line {...common} x1="8" x2="8" y1="3" y2="7"/><Line {...common} x1="16" x2="16" y1="3" y2="7"/></> : null}
    {name === 'message' ? <Path {...common} d="M4 4h16v12H9l-5 4Z"/> : null}
    {name === 'connection' ? <><Circle {...common} cx="12" cy="17" r="2.5"/><Circle {...common} cx="5" cy="7" r="2.5"/><Circle {...common} cx="19" cy="7" r="2.5"/><Line {...common} x1="6.5" x2="10.5" y1="9" y2="15"/><Line {...common} x1="17.5" x2="13.5" y1="9" y2="15"/></> : null}
  </Svg>;
}

function RectIcon({ common }: { common: { fill: string; stroke: string; strokeLinecap: 'round'; strokeLinejoin: 'round'; strokeWidth: number } }) {
  return <Path {...common} d="M4 5h16v14H4Z"/>;
}
