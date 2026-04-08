import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { theme } from '../theme';

interface Props {
  label: string;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export default function SectionLabel({ label, color = theme.colors.neonPurple, style }: Props) {
  return (
    <Text
      style={[
        {
          color,
          fontSize: theme.font.xs,
          fontWeight: theme.font.weight.bold,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        style,
      ]}
    >
      {label}
    </Text>
  );
}
