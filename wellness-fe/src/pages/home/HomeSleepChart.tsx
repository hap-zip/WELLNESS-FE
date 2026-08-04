import Svg, { Path, Circle } from 'react-native-svg';

import { styles } from './home.styles';

export default function HomeSleepChart() {
  return (
    <Svg height="46" viewBox="0 0 310 46" width="100%" style={styles.sleepChart}>
      <Path
        d="M0 28 C18 24 28 30 44 20 S68 27 86 23 S110 12 129 19 S156 31 174 20 S198 17 216 24 S240 19 258 15 S286 23 310 10 L310 46 L0 46 Z"
        fill="#5B8DEF"
        fillOpacity="0.12"
      />
      <Path
        d="M0 28 C18 24 28 30 44 20 S68 27 86 23 S110 12 129 19 S156 31 174 20 S198 17 216 24 S240 19 258 15 S286 23 310 10"
        fill="none"
        stroke="#7FA6FF"
        strokeWidth="2.4"
      />
      <Circle cx="310" cy="10" fill="#FFFFFF" r="3.5" />
    </Svg>
  );
}
