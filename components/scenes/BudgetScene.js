import React from 'react';
import Svg, { Rect, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function BudgetScene({ width, height }) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#080012" />
          <Stop offset="0.5" stopColor="#150228" />
          <Stop offset="1" stopColor="#200840" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill="url(#bsky)" />

      {/* Rain lines */}
      {[0.1,0.2,0.35,0.5,0.65,0.78,0.9].map((t, i) => (
        <Line key={i} x1={t*width} y1={0} x2={t*width+4} y2={height*0.6}
          stroke={i%2===0 ? '#a78bfa' : '#ff2d9b'} strokeWidth={0.5} opacity={0.35} />
      ))}

      {/* Buildings */}
      <Rect x={width*0.05} y={height*0.3} width={width*0.15} height={height*0.7} fill="#04040C" />
      <Rect x={width*0.25} y={height*0.15} width={width*0.18} height={height*0.85} fill="#04040C" />
      <Rect x={width*0.55} y={height*0.22} width={width*0.22} height={height*0.78} fill="#04040C" />
      <Rect x={width*0.8} y={height*0.35} width={width*0.2} height={height*0.65} fill="#04040C" />

      {/* Windows */}
      {[
        {x:0.07, y:0.35},{x:0.1, y:0.42},{x:0.07, y:0.5},{x:0.12, y:0.38},
        {x:0.28, y:0.2},{x:0.34, y:0.27},{x:0.28, y:0.35},{x:0.33, y:0.42},
        {x:0.57, y:0.28},{x:0.63, y:0.35},{x:0.69, y:0.28},{x:0.57, y:0.42},
        {x:0.82, y:0.42},{x:0.88, y:0.48},{x:0.82, y:0.55},
      ].map((w, i) => (
        <Rect key={i} x={w.x*width} y={w.y*height} width={4} height={3}
          fill={['#ff2d9b','#00f0ff','#a78bfa','#39ff9a'][i%4]} opacity={0.8} />
      ))}

      {/* Street glow */}
      <Line x1={0} y1={height*0.98} x2={width} y2={height*0.98} stroke="#ff2d9b" strokeWidth={1} opacity={0.4} />
    </Svg>
  );
}
