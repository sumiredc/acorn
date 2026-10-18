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
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'acorn' | 'plain';
  // Full width, for the main action of a screen.
  wide?: boolean;
  style?: ViewStyle;
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
        style,
      ]}
    >
      {/* ▶ marks only the actions that move you forward. */}
      <PixelText style={[styles.buttonLabel, wide && styles.buttonLabelWide]}>
        {wide ? `▶ ${label}` : label}
      </PixelText>
    </Pressable>
  );
}

// A row of options where exactly one is selected, such as a language or a mission kind.
export function Choice<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View accessibilityRole="radiogroup" style={styles.choice}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <PixelText style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {option.label}
            </PixelText>
          </Pressable>
        );
      })}
    </View>
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
  choice: {
    flexDirection: 'row',
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  option: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: colors.window },
  optionSelected: { backgroundColor: colors.ink },
  optionLabel: { fontSize: 14, color: colors.muted },
  optionLabelSelected: { color: colors.window },
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
