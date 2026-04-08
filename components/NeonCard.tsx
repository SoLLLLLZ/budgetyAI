import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../theme';

interface Props {
  children?: React.ReactNode;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function NeonCard({ children, accentColor = theme.colors.neonPurple, style }: Props) {
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: accentColor,
          shadowColor: accentColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(8,4,20,0.75)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    padding: theme.spacing.md,
  },
});
