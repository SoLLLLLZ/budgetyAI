import React from 'react';
import Svg, { Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function RetrowaveSun({ size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size / 2;
  const stripes = Array.from({ length: 7 }, (_, i) => {
    const yStart = cy + r * 0.08 + i * (r * 0.8 / 7);
    return { y: yStart, h: r * 0.07 };
  });
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="rws" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#ff8c42" />
          <Stop offset="0.5" stopColor="#ff6b35" />
          <Stop offset="1" stopColor="#ff2d9b" />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#rws)" />
      {stripes.map((s, i) => (
        <Rect key={i} x={0} y={s.y} width={size} height={s.h} fill="#07070F" />
      ))}
    </Svg>
  );
}
