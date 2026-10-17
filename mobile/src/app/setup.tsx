import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { type ApiError, apiClient } from '@/api/client';
import { nextSetupStep } from '@/domain/setup';
import type { MissionKind } from '@/domain/types';
import { canAddMission, canFinishMissions } from '@/domain/week';
import { useAcorn } from '@/storage/store';
import { ActionButton, ErrorText, Field, PixelText, Window } from '@/ui/primitives';
import { Screen } from '@/ui/Screen';
import { colors } from '@/ui/theme';

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export default function SetupScreen() {
  const { data, t } = useAcorn();
  const step = nextSetupStep(data);

  if (step === null) return <Redirect href="/" />;

  return (
    <Screen title={t('setup.title')}>
      {step === 'budget' && <BudgetStep />}
      {step === 'missions' && <MissionsStep />}
      {step === 'scoring' && <ScoringStep />}
    </Screen>
  );
}

function BudgetStep() {
  const { dispatch, t } = useAcorn();
  const [value, setValue] = useState('');
  const amount = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(amount) && amount > 0;

  return (
    <Window title={t('setup.budget.title')}>
      <PixelText style={styles.help}>{t('setup.budget.help')}</PixelText>
      <View style={styles.inline}>
        <PixelText>$</PixelText>
        <Field
          style={styles.grow}
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          placeholder={t('setup.budget.placeholder')}
          accessibilityLabel={t('setup.budget.title')}
        />
      </View>
      {value.trim() !== '' && !valid && <ErrorText>{t('setup.budget.invalid')}</ErrorText>}
      <ActionButton
        label={t('setup.budget.next')}
        disabled={!valid}
        onPress={() => dispatch({ type: 'setBudget', budgetUsd: amount })}
      />
    </Window>
  );
}

function MissionsStep() {
  const { data, dispatch, t } = useAcorn();
  const missions = data.week?.missions ?? [];
  const [name, setName] = useState('');
  const [kind, setKind] = useState<MissionKind>('daily');
  const canAdd = canAddMission(missions, kind);

  function add() {
    dispatch({ type: 'addMission', id: newId(), name, kind });
    setName('');
  }

  return (
    <Window title={t('setup.missions.title')}>
      <PixelText style={styles.help}>{t('setup.missions.help')}</PixelText>
      {missions.map((m) => (
        <View key={m.id} style={styles.missionRow}>
          <PixelText style={styles.grow}>
            <PixelText style={styles.kind}>[{t(`kind.${m.kind}`)}]</PixelText> {m.name}
          </PixelText>
          <ActionButton
            tone="plain"
            label={t('setup.missions.remove')}
            onPress={() => dispatch({ type: 'removeMission', id: m.id })}
          />
        </View>
      ))}
      <View style={styles.inline}>
        {(['daily', 'weekly'] as const).map((k) => (
          <ActionButton
            key={k}
            tone={kind === k ? 'acorn' : 'plain'}
            label={t(`kind.${k}`)}
            onPress={() => setKind(k)}
          />
        ))}
      </View>
      <Field
        value={name}
        onChangeText={setName}
        onSubmitEditing={() => canAdd && name.trim() && add()}
        placeholder={t('setup.missions.placeholder')}
        accessibilityLabel={t('setup.missions.placeholder')}
      />
      {!canAdd && (
        <PixelText style={styles.help}>
          {t('setup.missions.full', { kind: t(`kind.${kind}`) })}
        </PixelText>
      )}
      <ActionButton
        label={t('setup.missions.add')}
        disabled={!canAdd || !name.trim()}
        onPress={add}
      />
      <View style={styles.divider} />
      <ActionButton
        label={t('setup.missions.done')}
        disabled={!canFinishMissions(missions)}
        onPress={() => dispatch({ type: 'submitMissions' })}
      />
    </Window>
  );
}

function ScoringStep() {
  const { data, dispatch, t } = useAcorn();
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const budgetUsd = data.budgetUsd!;
  const missions = data.week!.missions;

  useEffect(() => {
    // Ignore a late answer after unmount, so a double-mounted effect cannot dispatch twice.
    let cancelled = false;
    apiClient
      .judgeMissions(
        budgetUsd,
        missions.map(({ id, name, kind }) => ({ id, name, kind })),
      )
      .then((result) => {
        if (cancelled) return;
        if (result.ok) dispatch({ type: 'missionsScored', results: result.data });
        else setError(result.error);
      });
    return () => {
      cancelled = true;
    };
    // Missions are locked while scoring; re-run only on an explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <Window title={t('setup.scoring.title')}>
      {missions.map((m) => (
        <PixelText key={m.id} style={styles.help}>
          [{t(`kind.${m.kind}`)}] {m.name}
        </PixelText>
      ))}
      {error && (
        <>
          <ErrorText>{t(`error.${error}`)}</ErrorText>
          <ActionButton
            label={t('setup.scoring.retry')}
            onPress={() => {
              setError(null);
              setAttempt((n) => n + 1);
            }}
          />
        </>
      )}
    </Window>
  );
}

const styles = StyleSheet.create({
  help: { fontSize: 13, color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kind: { color: colors.acorn, fontSize: 13 },
  divider: { height: 2, backgroundColor: colors.soft, marginVertical: 4 },
});
