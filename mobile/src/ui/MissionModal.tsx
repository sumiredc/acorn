import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MissionKind, MissionUnit } from '@/domain/types';
import { missionTarget } from '@/domain/week';
import { useAcorn } from '@/storage/store';

import { ActionButton, Choice, Field, PixelText } from './primitives';
import { Sheet } from './Sheet';
import { colors } from './theme';

const UNITS: MissionUnit[] = ['percent', 'count', 'minutes'];

export type NewMission = { name: string; unit: MissionUnit; target: number };

// Registering a mission happens in its own window, so nothing is left half-entered on the page.
export function MissionModal({
  kind,
  onAdd,
  onClose,
}: {
  kind: MissionKind | null;
  onAdd: (mission: NewMission & { kind: MissionKind }) => void;
  onClose: () => void;
}) {
  const { t } = useAcorn();
  return (
    <Sheet
      visible={kind !== null}
      title={kind ? t('setup.missions.new', { kind: t(`kind.${kind}`) }) : undefined}
      onClose={onClose}
    >
      {kind && <MissionForm key={kind} kind={kind} onAdd={onAdd} />}
    </Sheet>
  );
}

function MissionForm({
  kind,
  onAdd,
}: {
  kind: MissionKind;
  onAdd: (mission: NewMission & { kind: MissionKind }) => void;
}) {
  const { t } = useAcorn();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MissionUnit>('percent');
  const [targetText, setTargetText] = useState('');
  const target = missionTarget(unit, Number(targetText));
  const ready = name.trim() !== '' && (unit === 'percent' || targetText !== '') && target !== null;

  function add() {
    if (ready) onAdd({ kind, name, unit, target: target! });
  }

  return (
    <>
      <PixelText style={styles.label}>{t('setup.missions.name')}</PixelText>
      <Field
        autoFocus
        value={name}
        onChangeText={setName}
        onSubmitEditing={add}
        placeholder={t('setup.missions.placeholder')}
        accessibilityLabel={t('setup.missions.name')}
      />
      <PixelText style={styles.label}>{t('setup.missions.track')}</PixelText>
      <Choice
        options={UNITS.map((u) => ({ value: u, label: t(`unit.${u}`) }))}
        value={unit}
        onChange={setUnit}
      />
      {unit !== 'percent' && (
        <View style={styles.inline}>
          <Field
            style={[styles.grow, styles.center]}
            value={targetText}
            onChangeText={setTargetText}
            onSubmitEditing={add}
            keyboardType="number-pad"
            placeholder={unit === 'count' ? '20' : '30'}
            accessibilityLabel={t('setup.missions.target')}
          />
          <PixelText>{t(`goal.${unit}`, { target: '' }).trim()}</PixelText>
        </View>
      )}
      <View style={styles.actions}>
        <ActionButton label={t('setup.missions.add')} disabled={!ready} onPress={add} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  center: { textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
});
