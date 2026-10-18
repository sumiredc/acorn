import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { clampProgress, progressStep, stepProgress } from '@/domain/progress';
import type { Mission } from '@/domain/types';
import { useAcorn } from '@/storage/store';

import { amountLabel, progressLabel } from './missionText';
import { PixelIcon } from './PixelIcon';
import { ActionButton, Field, PixelText, Window } from './primitives';
import { CONTROL_HEIGHT, ProgressBar } from './ProgressBar';
import { colors, layout } from './theme';

export type InputMode = 'buttons' | 'bar' | 'number';
const MODES: InputMode[] = ['buttons', 'bar', 'number'];

// Progress is drafted here and saved with one press, so a stray tap never clears a mission.
export function ProgressModal({
  mission,
  value,
  mode,
  onModeChange,
  onSave,
  onClose,
}: {
  mission: Mission | null;
  value: number;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onSave: (value: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={mission !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {mission && (
          <ProgressForm
            key={mission.id}
            mission={mission}
            initial={value}
            mode={mode}
            onModeChange={onModeChange}
            onSave={onSave}
            onClose={onClose}
          />
        )}
      </View>
    </Modal>
  );
}

function ProgressForm({
  mission,
  initial,
  mode,
  onModeChange,
  onSave,
  onClose,
}: {
  mission: Mission;
  initial: number;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onSave: (value: number) => void;
  onClose: () => void;
}) {
  const { t } = useAcorn();
  const { unit, target } = mission;
  const [value, setValue] = useState(initial);
  const [text, setText] = useState(String(initial));
  const step = progressStep(unit, target);

  function change(next: number) {
    setValue(next);
    setText(String(next));
  }

  function type(next: string) {
    setText(next);
    if (next.trim() !== '') setValue(clampProgress(Number(next), target));
  }

  return (
    <View style={styles.sheet}>
      <Window title={mission.name}>
        <PixelText style={styles.value}>{progressLabel(mission, value, t)}</PixelText>
        <View style={styles.controlRow}>
          <View style={styles.control}>
            {mode === 'buttons' && (
              <View style={styles.stepper}>
                <ActionButton
                  tone="plain"
                  style={styles.stepButton}
                  label={`−${amountLabel(unit, step, t)}`}
                  disabled={value <= 0}
                  onPress={() => change(stepProgress(value, unit, target, -1))}
                />
                <ActionButton
                  style={styles.stepButton}
                  label={`+${amountLabel(unit, step, t)}`}
                  disabled={value >= target}
                  onPress={() => change(stepProgress(value, unit, target, 1))}
                />
              </View>
            )}
            {mode === 'bar' && (
              <ProgressBar value={value} unit={unit} target={target} onChange={change} />
            )}
            {mode === 'number' && (
              <Field
                autoFocus
                style={styles.number}
                value={text}
                onChangeText={type}
                onSubmitEditing={() => onSave(value)}
                keyboardType="number-pad"
                accessibilityLabel={t('progress.mode.number')}
              />
            )}
          </View>
          <IconButton
            icon="max"
            label={t('progress.complete')}
            disabled={value >= target}
            onPress={() => change(target)}
            large
          />
        </View>
        <View style={styles.footer}>
          <View accessibilityRole="radiogroup" style={styles.modes}>
            {MODES.map((m) => (
              <IconButton
                key={m}
                icon={m}
                label={t(`progress.mode.${m}`)}
                selected={m === mode}
                onPress={() => onModeChange(m)}
              />
            ))}
          </View>
          <View style={styles.actions}>
            <ActionButton tone="plain" label={t('common.cancel')} onPress={onClose} />
            <ActionButton label={t('progress.save')} onPress={() => onSave(value)} />
          </View>
        </View>
      </Window>
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  selected,
  disabled = false,
  large = false,
}: {
  icon: 'max' | InputMode;
  label: string;
  onPress: () => void;
  // Set only for the input mode switch, which acts as radio buttons.
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 38, 32, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: { width: '100%', maxWidth: layout.maxWidth },
  value: { fontSize: 22, textAlign: 'center' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  control: { flex: 1, height: CONTROL_HEIGHT, justifyContent: 'center' },
  stepper: { flexDirection: 'row', gap: 8 },
  stepButton: {
    flex: 1,
    height: CONTROL_HEIGHT,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { height: CONTROL_HEIGHT, paddingVertical: 0, textAlign: 'center', fontSize: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modes: { flexDirection: 'row', gap: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  iconLarge: { width: CONTROL_HEIGHT, height: CONTROL_HEIGHT },
  iconPlain: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.acornSoft },
  iconRadio: { borderWidth: 2, borderColor: colors.soft, backgroundColor: colors.window },
  iconSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  iconDisabled: { opacity: 0.35 },
});
