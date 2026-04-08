import React from 'react';
import Svg, { Path, Circle, Ellipse, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function AccountScene({ width, height }) {
  const w = width, h = height;
  const cx = w * 0.5;

  // Flamingo body: standing pose
  const body = `M${cx},${h*0.18} C${cx+w*0.18},${h*0.28} ${cx+w*0.22},${h*0.48} ${cx+w*0.1},${h*0.62} C${cx+w*0.04},${h*0.72} ${cx},${h*0.78} ${cx-w*0.06},${h*0.82}`;
  // Neck & head
  const neck = `M${cx},${h*0.18} C${cx-w*0.08},${h*0.1} ${cx-w*0.14},${h*0.06} ${cx-w*0.1},${h*0.02}`;
  // Beak
  const beak = `M${cx-w*0.1},${h*0.02} L${cx-w*0.18},${h*0.04} L${cx-w*0.14},${h*0.06}`;
  // Wing detail
  const wing = `M${cx+w*0.15},${h*0.38} C${cx+w*0.3},${h*0.32} ${cx+w*0.35},${h*0.45} ${cx+w*0.25},${h*0.52}`;
  // Legs
  const leg1 = `M${cx-w*0.02},${h*0.82} L${cx-w*0.04},${h*0.97}`;
  const leg2 = `M${cx-w*0.06},${h*0.82} L${cx-w*0.1},${h*0.97}`;
  // Ground reflection
  const reflection = `M${cx-w*0.25},${h*0.99} L${cx+w*0.25},${h*0.99}`;

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="acsky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0a0010" />
          <Stop offset="0.5" stopColor="#1a0030" />
          <Stop offset="1" stopColor="#2d0050" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={w} height={h} fill="url(#acsky)" />

      {/* Halo ellipses */}
      {[[0.32,0.18],[0.42,0.25],[0.52,0.32]].map(([rx,ry],i)=>(
        <Ellipse key={i} cx={cx} cy={h*0.5} rx={rx*w} ry={ry*h}
          stroke="#ff2d9b" strokeWidth={0.5} fill="none" opacity={0.12} />
      ))}
      {[[0.22,0.12],[0.30,0.18]].map(([rx,ry],i)=>(
        <Ellipse key={`p${i}`} cx={cx} cy={h*0.5} rx={rx*w} ry={ry*h}
          stroke="#a78bfa" strokeWidth={0.4} fill="none" opacity={0.1} />
      ))}

      {/* Flamingo */}
      <Path d={body} stroke="#ff2d9b" strokeWidth={1.8} fill="none"
        shadowColor="#ff2d9b" shadowOpacity={0.8} shadowRadius={6} />
      <Path d={neck} stroke="#ff2d9b" strokeWidth={1.8} fill="none" />
      <Path d={beak} stroke="#ff2d9b" strokeWidth={1.2} fill="none" />
      <Path d={wing} stroke="#ff2d9b" strokeWidth={1} fill="none" opacity={0.5} />
      <Path d={leg1} stroke="#ff2d9b" strokeWidth={1} fill="none" />
      <Path d={leg2} stroke="#ff2d9b" strokeWidth={1} fill="none" />
      <Circle cx={cx-w*0.1} cy={h*0.02} r={w*0.04} stroke="#ff2d9b" strokeWidth={1.5} fill="none" />

      {/* Ground reflection */}
      <Path d={reflection} stroke="#ff2d9b" strokeWidth={0.8} opacity={0.3} />
    </Svg>
  );
}
