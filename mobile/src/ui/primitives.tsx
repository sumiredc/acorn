import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, layout } from './theme';

export function PixelText({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.pixel, style]} />;
}

export function Window({
  title,
  children,
  style,
}: {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.window, style]}>
      {title ? <PixelText style={styles.windowTitle}>{title}</PixelText> : null}
      {children}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  disabled = false,
  tone = 'acorn',
  wide = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'acorn' | 'plain';
  // Full width, for the main action of a screen.
  wide?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'acorn' ? styles.buttonAcorn : styles.buttonPlain,
        wide && styles.buttonWide,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <PixelText style={[styles.buttonLabel, wide && styles.buttonLabelWide]}>▶ {label}</PixelText>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return (
    <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.field, props.style]} />
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <PixelText style={styles.error}>{children}</PixelText>;
}

const styles = StyleSheet.create({
  pixel: { fontFamily: fonts.pixel, color: colors.ink, fontSize: 15 },
  window: {
    backgroundColor: colors.window,
    borderColor: colors.ink,
    borderWidth: layout.border,
    borderRadius: layout.radius,
    padding: 14,
    gap: 10,
  },
  windowTitle: { fontSize: 17 },
  button: {
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  buttonAcorn: { backgroundColor: colors.acornSoft },
  buttonPlain: { backgroundColor: colors.window },
  buttonWide: { alignSelf: 'stretch', paddingVertical: 12 },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { transform: [{ translateY: 1 }] },
  buttonLabel: { fontSize: 14 },
  buttonLabelWide: { fontSize: 16, textAlign: 'center' },
  field: {
    fontFamily: fonts.pixel,
    fontSize: 16,
    color: colors.ink,
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
  },
  error: {
    color: colors.berry,
    backgroundColor: colors.berrySoft,
    borderColor: colors.berry,
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
});
