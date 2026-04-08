import React, { useRef } from 'react';
import { Animated, TextInput, StyleSheet, type StyleProp, type ViewStyle, type TextInputProps } from 'react-native';
import { theme } from '../theme';

interface NeonInputProps extends Omit<TextInputProps, 'style'> {
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function NeonInput({ accentColor = theme.colors.neonPurple, style, onFocus, onBlur, ...props }: NeonInputProps) {
  const anim = useRef(new Animated.Value(0)).current;

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.15)', accentColor],
  });

  const shadowColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', accentColor],
  });

  function handleFocus(e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
    onFocus?.(e);
  }

  function handleBlur(e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    onBlur?.(e);
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { borderColor, shadowColor },
        style,
      ]}
    >
      <TextInput
        placeholderTextColor={theme.colors.textDim}
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  input: {
    color: theme.colors.text,
    fontSize: theme.font.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
});
