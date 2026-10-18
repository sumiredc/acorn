import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { clampProgress, progressStep, stepProgress } from '@/domain/progress';
import type { Mission } from '@/domain/types';
import { useAcorn } from '@/storage/store';

import { amountLabel, progressLabel } from './missionText';
import { ActionButton, Choice, Field, PixelText, Window } from './primitives';
import { ProgressBar } from './ProgressBar';
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
        <Choice
          options={MODES.map((m) => ({ value: m, label: t(`progress.mode.${m}`) }))}
          value={mode}
          onChange={onModeChange}
        />
        <PixelText style={styles.value}>{progressLabel(mission, value, t)}</PixelText>
        {mode === 'buttons' && (
          <View style={styles.stepper}>
            <ActionButton
              tone="plain"
              label={`−${amountLabel(unit, step, t)}`}
              disabled={value <= 0}
              onPress={() => change(stepProgress(value, unit, target, -1))}
            />
            <ActionButton
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
            value={text}
            onChangeText={type}
            onSubmitEditing={() => onSave(value)}
            keyboardType="number-pad"
            accessibilityLabel={t('progress.mode.number')}
          />
        )}
        {mode !== 'bar' && <ProgressBar value={value} unit={unit} target={target} />}
        <ActionButton label={t('progress.complete')} onPress={() => onSave(target)} />
        <View style={styles.actions}>
          <ActionButton tone="plain" label={t('common.cancel')} onPress={onClose} />
          <ActionButton label={t('progress.save')} onPress={() => onSave(value)} />
        </View>
      </Window>
    </View>
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
  value: { fontSize: 22, textAlign: 'center', color: colors.ink },
  stepper: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
});
