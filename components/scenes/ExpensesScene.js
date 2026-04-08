import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

// Vaporwave Great Wave — pink/purple palette inspired by Hokusai
export default function ExpensesScene({ width, height }) {
  const w = width, h = height;
  const mx = w / 2;

  // Wave layers from back to front
  const wave1 = `M0,${h*0.65} C${w*0.15},${h*0.45} ${w*0.35},${h*0.75} ${w*0.5},${h*0.55} C${w*0.65},${h*0.35} ${w*0.85},${h*0.6} ${w},${h*0.5} L${w},${h} L0,${h} Z`;
  const wave2 = `M0,${h*0.72} C${w*0.2},${h*0.55} ${w*0.4},${h*0.82} ${w*0.6},${h*0.65} C${w*0.75},${h*0.52} ${w*0.88},${h*0.7} ${w},${h*0.62} L${w},${h} L0,${h} Z`;
  const wave3 = `M0,${h*0.82} C${w*0.25},${h*0.7} ${w*0.45},${h*0.9} ${w*0.65},${h*0.75} C${w*0.8},${h*0.65} ${w*0.9},${h*0.8} ${w},${h*0.72} L${w},${h} L0,${h} Z`;

  // Curl of the big wave at top-right
  const curl = `M${w*0.55},${h*0.08} C${w*0.75},${h*0.0} ${w*0.95},${h*0.1} ${w*0.98},${h*0.28} C${w*0.9},${h*0.18} ${w*0.72},${h*0.12} ${w*0.55},${h*0.08} Z`;
  const foamStroke = `M${w*0.5},${h*0.28} C${w*0.65},${h*0.1} ${w*0.85},${h*0.12} ${w*0.95},${h*0.3}`;
  const foamStroke2 = `M${w*0.45},${h*0.35} C${w*0.58},${h*0.18} ${w*0.78},${h*0.2} ${w*0.9},${h*0.38}`;

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="esky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#020818" />
          <Stop offset="0.4" stopColor="#041428" />
          <Stop offset="1" stopColor="#0a2040" />
        </LinearGradient>
        <LinearGradient id="wave1g" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#6b21a8" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#4c1d95" stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="wave2g" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9333ea" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#7e22ce" stopOpacity="0.8" />
        </LinearGradient>
        <LinearGradient id="wave3g" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c026d3" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#a21caf" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width={w} height={h} fill="url(#esky)" />

      {/* Stars */}
      {[[0.1,0.08],[0.3,0.05],[0.5,0.1],[0.7,0.04],[0.85,0.09],[0.2,0.15],[0.6,0.14],[0.9,0.07]].map(([tx,ty],i) => (
        <Circle key={i} cx={tx*w} cy={ty*h} r={0.8} fill="white" opacity={0.6} />
      ))}

      {/* Wave curl (main wave crest) */}
      <Path d={curl} fill="#e879f9" opacity={0.5} />

      {/* Wave layers */}
      <Path d={wave1} fill="url(#wave1g)" />
      <Path d={wave2} fill="url(#wave2g)" />
      <Path d={wave3} fill="url(#wave3g)" />

      {/* Foam strokes */}
      <Path d={foamStroke} stroke="#e879f9" strokeWidth={1.2} fill="none" opacity={0.7} />
      <Path d={foamStroke2} stroke="#c4b5fd" strokeWidth={0.8} fill="none" opacity={0.5} />
    </Svg>
  );
}
