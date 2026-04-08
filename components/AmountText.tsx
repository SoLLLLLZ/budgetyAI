import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { theme } from '../theme';

interface Props {
  value: number;
  style?: StyleProp<TextStyle>;
  size?: number;
}

export default function AmountText({ value, style, size = theme.font.xl }: Props) {
  const isPositive = value >= 0;
  const color = isPositive ? theme.colors.neonGreen : theme.colors.neonPink;
  const prefix = isPositive ? '+$' : '-$';
  const abs = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Text
      style={[
        {
          color,
          fontSize: size,
          fontWeight: theme.font.weight.bold as '600',
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
        },
        style,
      ]}
    >
      {prefix}{abs}
    </Text>
  );
}
