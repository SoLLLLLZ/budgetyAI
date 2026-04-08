import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Line, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Starfield dots — fixed positions
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height * 0.55,
  r: Math.random() < 0.3 ? 1.2 : 0.7,
  opacity: 0.4 + Math.random() * 0.5,
}));

// Grid lines — 8 vertical, 10 horizontal perspective lines
const GRID_COLS = 8;
const GRID_ROWS = 10;
const GRID_HEIGHT = 140;
const VANISH_X = width / 2;
const VANISH_Y = 0;

function buildGridLines() {
  const lines = [];
  // Vertical (perspective)
  for (let i = 0; i <= GRID_COLS; i++) {
    const t = i / GRID_COLS;
    const x = t * width;
    lines.push({ id: `v${i}`, x1: VANISH_X, y1: VANISH_Y, x2: x, y2: GRID_HEIGHT });
  }
  // Horizontal
  for (let j = 1; j <= GRID_ROWS; j++) {
    const t = j / GRID_ROWS;
    const y = t * GRID_HEIGHT;
    const spread = t;
    const x1 = VANISH_X - (VANISH_X) * spread;
    const x2 = VANISH_X + (width - VANISH_X) * spread;
    lines.push({ id: `h${j}`, x1, y1: y, x2, y2: y });
  }
  return lines;
}

const GRID_LINES = buildGridLines();

export default function HubBackground() {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Sky gradient */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#04040C" />
            <Stop offset="0.35" stopColor="#0D0520" />
            <Stop offset="0.6" stopColor="#1a0533" />
            <Stop offset="0.8" stopColor="#3d0d5c" />
            <Stop offset="1" stopColor="#07070F" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#sky)" />

        {/* Stars */}
        {STARS.map((s) => (
          <Circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity} />
        ))}
      </Svg>

      {/* Grid at bottom */}
      <View style={styles.gridContainer} pointerEvents="none">
        <Svg width={width} height={GRID_HEIGHT}>
          {GRID_LINES.map((l) => (
            <Line
              key={l.id}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="#ff2d9b"
              strokeWidth={0.5}
              opacity={0.35}
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
