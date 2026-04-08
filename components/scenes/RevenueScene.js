import React from 'react';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

// Retrowave mountain sunset
export default function RevenueScene({ width, height }) {
  const w = width, h = height;

  // Mountain silhouettes
  const mtn1 = `M0,${h*0.75} L${w*0.2},${h*0.38} L${w*0.4},${h*0.72} Z`;
  const mtn2 = `M${w*0.15},${h*0.75} L${w*0.42},${h*0.28} L${w*0.68},${h*0.75} Z`;
  const mtn3 = `M${w*0.55},${h*0.75} L${w*0.78},${h*0.42} L${w},${h*0.75} Z`;

  // Palm trunk
  const trunk = `M${w*0.12},${h*0.98} L${w*0.14},${h*0.6}`;
  const frond1 = `M${w*0.14},${h*0.62} C${w*0.08},${h*0.5} ${w*0.0},${h*0.48} ${w*0.02},${h*0.42}`;
  const frond2 = `M${w*0.14},${h*0.62} C${w*0.22},${h*0.52} ${w*0.28},${h*0.48} ${w*0.3},${h*0.43}`;
  const frond3 = `M${w*0.14},${h*0.62} C${w*0.14},${h*0.5} ${w*0.12},${h*0.44} ${w*0.1},${h*0.42}`;

  // Sun stripes (horizontal cutouts)
  const sunCx = w * 0.62, sunCy = h * 0.35, sunR = h * 0.22;
  const stripes = Array.from({ length: 8 }, (_, i) => {
    const y = sunCy + sunR * 0.05 + i * (sunR * 0.85 / 8);
    return { y, h: sunR * 0.055 };
  });

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#04040C" />
          <Stop offset="0.3" stopColor="#0d0520" />
          <Stop offset="0.55" stopColor="#3d0d5c" />
          <Stop offset="0.75" stopColor="#8b1a6b" />
          <Stop offset="0.9" stopColor="#c4386e" />
          <Stop offset="1" stopColor="#f4937c" />
        </LinearGradient>
        <RadialGradient id="sun" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor="#ff8c42" />
          <Stop offset="0.5" stopColor="#ff6b35" />
          <Stop offset="1" stopColor="#ff2d9b" />
        </RadialGradient>
      </Defs>

      <Rect x="0" y="0" width={w} height={h} fill="url(#rsky)" />

      {/* Retrowave sun */}
      <Circle cx={sunCx} cy={sunCy} r={sunR} fill="url(#sun)" />
      {/* Stripe cutouts */}
      {stripes.map((s, i) => (
        <Rect key={i} x={sunCx - sunR} y={s.y} width={sunR * 2} height={s.h} fill="#04040C" />
      ))}

      {/* Mountains */}
      <Path d={mtn1} fill="#0a0520" opacity={0.9} />
      <Path d={mtn2} fill="#130730" opacity={0.95} />
      <Path d={mtn3} fill="#0a0520" opacity={0.9} />

      {/* Ground */}
      <Rect x="0" y={h*0.75} width={w} height={h*0.25} fill="#04040C" />

      {/* Palm tree */}
      <Path d={trunk} stroke="#04040C" strokeWidth={3} fill="none" />
      <Path d={frond1} stroke="#04040C" strokeWidth={2} fill="none" />
      <Path d={frond2} stroke="#04040C" strokeWidth={2} fill="none" />
      <Path d={frond3} stroke="#04040C" strokeWidth={2} fill="none" />
    </Svg>
  );
}
