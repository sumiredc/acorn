import { Pressable, StyleSheet } from 'react-native';

import { type IconName, PixelIcon } from './PixelIcon';
import { colors, layout } from './theme';

// Square button showing a pixel icon; `label` is read out by screen readers.
export function IconButton({
  icon,
  label,
  onPress,
  selected,
  disabled = false,
  large = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  // Set only when the buttons act as radio buttons, like the input mode switch.
  selected?: boolean;
  disabled?: boolean;
  // As tall as the input next to it.
  large?: boolean;
}) {
  const radio = selected !== undefined;
  return (
    <Pressable
      accessibilityRole={radio ? 'radio' : 'button'}
      accessibilityLabel={label}
      accessibilityState={radio ? { checked: selected } : { disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.iconButton,
        large && styles.iconLarge,
        radio ? styles.iconRadio : styles.iconPlain,
        selected && styles.iconSelected,
        disabled && styles.iconDisabled,
      ]}
    >
      <PixelIcon name={icon} size={14} color={selected ? colors.window : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  iconLarge: { width: layout.control, height: layout.control },
  iconPlain: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.acornSoft },
  iconRadio: { borderWidth: 2, borderColor: colors.soft, backgroundColor: colors.window },
  iconSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  iconDisabled: { opacity: 0.35 },
});
