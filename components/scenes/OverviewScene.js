import React from 'react';
import Svg, { Rect, Line, Circle, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function OverviewScene({ width, height }) {
  const w = width, h = height;

  const buildings = [
    { x: 0.02, y: 0.45, w: 0.12, h: 0.55 },
    { x: 0.16, y: 0.3, w: 0.1, h: 0.7 },
    { x: 0.28, y: 0.5, w: 0.08, h: 0.5 },
    { x: 0.38, y: 0.35, w: 0.14, h: 0.65 },
    { x: 0.55, y: 0.4, w: 0.1, h: 0.6 },
    { x: 0.67, y: 0.25, w: 0.12, h: 0.75 },
    { x: 0.81, y: 0.42, w: 0.09, h: 0.58 },
    { x: 0.92, y: 0.55, w: 0.08, h: 0.45 },
  ];

  const windows = [];
  buildings.forEach((b, bi) => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        windows.push({
          id: `w${bi}-${row}-${col}`,
          x: (b.x + 0.01 + col * 0.04) * w,
          y: (b.y + 0.08 + row * 0.12) * h,
          color: ['#ff2d9b', '#00f0ff', '#a78bfa', '#39ff9a'][(bi * 2 + row + col) % 4],
        });
      }
    }
  });

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="osky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#080012" />
          <Stop offset="0.5" stopColor="#12002a" />
          <Stop offset="1" stopColor="#200040" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={w} height={h} fill="url(#osky)" />

      {/* Grid lines */}
      {Array.from({ length: 7 }, (_, i) => (
        <Line key={`v${i}`} x1={(i+1)*w/8} y1={0} x2={(i+1)*w/8} y2={h}
          stroke="#a78bfa" strokeWidth={0.4} opacity={0.15} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <Line key={`h${i}`} x1={0} y1={(i+1)*h/6} x2={w} y2={(i+1)*h/6}
          stroke="#a78bfa" strokeWidth={0.4} opacity={0.15} />
      ))}

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Rect key={i} x={b.x*w} y={b.y*h} width={b.w*w} height={b.h*h} fill="#04040C" />
      ))}

      {/* Windows */}
      {windows.map((win) => (
        <Rect key={win.id} x={win.x} y={win.y} width={3} height={2.5}
          fill={win.color} opacity={0.75} />
      ))}

      {/* Ground reflections */}
      <Ellipse cx={w*0.3} cy={h*0.98} rx={w*0.2} ry={h*0.04} fill="#a78bfa" opacity={0.08} />
      <Ellipse cx={w*0.7} cy={h*0.98} rx={w*0.18} ry={h*0.03} fill="#ff2d9b" opacity={0.08} />
    </Svg>
  );
}
