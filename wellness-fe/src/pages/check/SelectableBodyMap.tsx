import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, layout, radius, spacing } from '@/theme/tokens';

export type BodyView = 'front' | 'back';

type Zone = { id: string; label: string; view: BodyView; left: number; top: number; width: number; height: number };

const ZONES: Zone[] = [
  { id: 'front-head', label: '머리 앞', view: 'front', left: 117, top: 12, width: 54, height: 54 },
  { id: 'front-shoulder-left', label: '왼쪽 어깨 앞', view: 'front', left: 62, top: 78, width: 70, height: 48 },
  { id: 'front-shoulder-right', label: '오른쪽 어깨 앞', view: 'front', left: 157, top: 78, width: 70, height: 48 },
  { id: 'front-arm-left', label: '왼쪽 팔 앞', view: 'front', left: 44, top: 120, width: 58, height: 116 },
  { id: 'front-arm-right', label: '오른쪽 팔 앞', view: 'front', left: 187, top: 120, width: 58, height: 116 },
  { id: 'front-chest', label: '가슴', view: 'front', left: 105, top: 116, width: 80, height: 62 },
  { id: 'front-abdomen', label: '복부', view: 'front', left: 108, top: 178, width: 74, height: 80 },
  { id: 'front-leg-left', label: '왼쪽 다리 앞', view: 'front', left: 83, top: 258, width: 62, height: 174 },
  { id: 'front-leg-right', label: '오른쪽 다리 앞', view: 'front', left: 146, top: 258, width: 62, height: 174 },
  { id: 'back-head', label: '머리 뒤', view: 'back', left: 117, top: 12, width: 54, height: 54 },
  { id: 'back-neck', label: '목 뒤', view: 'back', left: 119, top: 63, width: 52, height: 48 },
  { id: 'back-shoulder-left', label: '왼쪽 어깨 뒤', view: 'back', left: 62, top: 88, width: 70, height: 50 },
  { id: 'back-shoulder-right', label: '오른쪽 어깨 뒤', view: 'back', left: 157, top: 88, width: 70, height: 50 },
  { id: 'back-arm-left', label: '왼쪽 팔 뒤', view: 'back', left: 44, top: 130, width: 58, height: 110 },
  { id: 'back-arm-right', label: '오른쪽 팔 뒤', view: 'back', left: 187, top: 130, width: 58, height: 110 },
  { id: 'back-upper', label: '등 위', view: 'back', left: 105, top: 116, width: 80, height: 70 },
  { id: 'back-lower', label: '허리', view: 'back', left: 108, top: 186, width: 74, height: 72 },
  { id: 'back-leg-left', label: '왼쪽 다리 뒤', view: 'back', left: 83, top: 258, width: 62, height: 174 },
  { id: 'back-leg-right', label: '오른쪽 다리 뒤', view: 'back', left: 146, top: 258, width: 62, height: 174 },
];

export const BODY_ZONE_LABELS = Object.fromEntries(ZONES.map((zone) => [zone.id, zone.label]));

export function SelectableBodyMap({ selected, view, onChangeView, onToggle }: { selected: string[]; view: BodyView; onChangeView: (view: BodyView) => void; onToggle: (zone: Zone) => void }) {
  const zones = ZONES.filter((zone) => zone.view === view);
  return <View>
    <View accessibilityRole="tablist" style={styles.tabs}>{(['front', 'back'] as const).map((item) => { const active = view === item; return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} key={item} onPress={() => onChangeView(item)} style={[styles.tab, active && styles.activeTab]}><Text style={[styles.tabText, active && styles.activeTabText]}>{item === 'front' ? '앞면' : '뒷면'}</Text></Pressable>; })}</View>
    <View accessibilityLabel={`${view === 'front' ? '앞면' : '뒷면'} 신체 부위 선택`} style={styles.map}>
      <Svg height={448} viewBox="0 0 290 448" width="100%">
        <Circle cx="145" cy="40" fill="#DCE3EC" r="28" />
        <Path d="M115 77 Q145 64 175 77 L193 126 180 252 110 252 97 126Z" fill="#DCE3EC" />
        <Path d="M98 94 68 116 42 226 64 234 100 140Z" fill="#DCE3EC" />
        <Path d="M192 94 222 116 248 226 226 234 190 140Z" fill="#DCE3EC" />
        <Path d="M112 244 86 286 82 430 116 430 143 264Z" fill="#DCE3EC" />
        <Path d="M178 244 204 286 208 430 174 430 147 264Z" fill="#DCE3EC" />
        <Path d="M145 74V252M106 137h78M112 190h66M145 264 116 430M145 264l29 166" fill="none" stroke="#F8FAFC" strokeWidth="4" />
      </Svg>
      {zones.map((zone) => { const active = selected.includes(zone.id); return <Pressable accessibilityLabel={`${zone.label}${active ? ', 선택됨' : ''}`} accessibilityRole="checkbox" accessibilityState={{ checked: active }} hitSlop={3} key={zone.id} onPress={() => onToggle(zone)} style={[styles.zone, { left: zone.left, top: zone.top, width: zone.width, height: zone.height }, active && styles.selectedZone]}><Text style={styles.zoneText}>{active ? '선택됨' : ''}</Text></Pressable>; })}
    </View>
    <Text style={styles.help}>표시된 신체 부위를 눌러 선택하세요. 좌우와 앞·뒤는 각각 따로 기록됩니다.</Text>
  </View>;
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4, borderRadius: radius.md, backgroundColor: colors.surfaceStrong },
  tab: { flex: 1, minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  activeTab: { backgroundColor: colors.surface },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  activeTabText: { color: colors.primary },
  map: { position: 'relative', width: 290, height: 448, alignSelf: 'center', marginTop: spacing.sm },
  zone: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', borderRadius: radius.md },
  selectedZone: { borderWidth: 2, borderColor: colors.danger, backgroundColor: 'rgba(201,54,62,0.28)' },
  zoneText: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  help: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
