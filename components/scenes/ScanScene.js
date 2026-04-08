import React from 'react';
import Svg, { Path, Circle, Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function ScanScene({ width, height }) {
  const w = width, h = height;
  const cx = w * 0.5, cy = h * 0.45;

  // Rocket body
  const body = `M${cx},${h*0.08} C${cx+w*0.1},${h*0.2} ${cx+w*0.1},${h*0.45} ${cx+w*0.07},${h*0.62} L${cx-w*0.07},${h*0.62} C${cx-w*0.1},${h*0.45} ${cx-w*0.1},${h*0.2} ${cx},${h*0.08} Z`;
  const finL = `M${cx-w*0.07},${h*0.55} L${cx-w*0.2},${h*0.72} L${cx-w*0.07},${h*0.65} Z`;
  const finR = `M${cx+w*0.07},${h*0.55} L${cx+w*0.2},${h*0.72} L${cx+w*0.07},${h*0.65} Z`;
  const flame = `M${cx-w*0.04},${h*0.63} C${cx},${h*0.82} ${cx},${h*0.88} ${cx},${h*0.9} C${cx},${h*0.88} ${cx},${h*0.82} ${cx+w*0.04},${h*0.63} Z`;

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#030010" />
          <Stop offset="0.5" stopColor="#0a0025" />
          <Stop offset="1" stopColor="#080018" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={w} height={h} fill="url(#ssky)" />

      {/* Halo rings */}
      {[0.32, 0.38, 0.44].map((r, i) => (
        <Circle key={i} cx={cx} cy={cy} r={r*w} stroke="#00f0ff" strokeWidth={0.5} fill="none" opacity={0.12} />
      ))}

      {/* Scan laser */}
      <Line x1={cx-w*0.25} y1={cy} x2={cx+w*0.25} y2={cy} stroke="#00f0ff" strokeWidth={1} opacity={0.5} />

      {/* Rocket body */}
      <Path d={body} stroke="#00f0ff" strokeWidth={1.8} fill="none" />
      {/* Porthole */}
      <Circle cx={cx} cy={h*0.38} r={w*0.05} stroke="#00f0ff" strokeWidth={1.2} fill="none" />
      {/* Fins */}
      <Path d={finL} stroke="#ff2d9b" strokeWidth={1.5} fill="none" />
      <Path d={finR} stroke="#ff2d9b" strokeWidth={1.5} fill="none" />
      {/* Flame */}
      <Path d={flame} stroke="#f59e0b" strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
