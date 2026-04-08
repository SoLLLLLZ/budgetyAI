import React from 'react';
import { TouchableOpacity, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { theme } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export default function NeonButton({ label, onPress, color = theme.colors.neonPink, style, textStyle, disabled = false }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        {
          borderColor: color,
          shadowColor: color,
          backgroundColor: `${color}18`,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const btnStyle: ViewStyle = {
  borderWidth: 1.5,
  borderRadius: theme.radius.full,
  paddingVertical: 14,
  paddingHorizontal: 24,
  alignItems: 'center',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 10,
};

const labelStyle: TextStyle = {
  fontSize: theme.font.md,
  fontWeight: '600',
  letterSpacing: 1,
  textTransform: 'uppercase',
};

const styles = { btn: btnStyle, label: labelStyle };
