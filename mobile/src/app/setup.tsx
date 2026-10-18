import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { apiClient } from '@/api/client';
import { nextSetupStep } from '@/domain/setup';
import type { Locale, MissionKind } from '@/domain/types';
import { canAddMission, canFinishMissions } from '@/domain/week';
import { useAcorn } from '@/storage/store';
import { ActionButton, ErrorText, Field, PixelText, Window } from '@/ui/primitives';
import { Screen } from '@/ui/Screen';
import { colors } from '@/ui/theme';
import { useToast } from '@/ui/Toast';

// Language names stay in their own language so either reader can find theirs.
const LANGUAGES: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'English' },
  { locale: 'ja', label: '日本語' },
];

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export default function SetupScreen() {
  const { data, t } = useAcorn();
  const step = nextSetupStep(data);

  if (step === null) return <Redirect href="/" />;

  return (
    <Screen title={t('setup.title')}>
      {step === 'language' && <LanguageStep />}
      {step === 'name' && <NameStep />}
      {step === 'budget' && <BudgetStep />}
      {step === 'missions' && <MissionsStep />}
    </Screen>
  );
}

function LanguageStep() {
  const { locale, dispatch, t } = useAcorn();
  const [choice, setChoice] = useState<Locale>(locale);

  return (
    <>
      <Window title={t('setup.language.title')}>
        <PixelText style={styles.help}>{t('setup.language.help')}</PixelText>
        <View style={styles.inline}>
          {LANGUAGES.map((l) => (
            <ActionButton
              key={l.locale}
              tone={choice === l.locale ? 'acorn' : 'plain'}
              label={l.label}
              onPress={() => setChoice(l.locale)}
            />
          ))}
        </View>
      </Window>
      <ActionButton
        wide
        label={t('common.next')}
        onPress={() => dispatch({ type: 'setLocale', locale: choice })}
      />
    </>
  );
}

function NameStep() {
  const { dispatch, t } = useAcorn();
  const [name, setName] = useState('');
  const submit = () => name.trim() && dispatch({ type: 'setUserName', name });

  return (
    <>
      <Window title={t('setup.name.title')}>
        <PixelText style={styles.help}>{t('setup.name.help')}</PixelText>
        <Field
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          maxLength={20}
          placeholder={t('setup.name.placeholder')}
          accessibilityLabel={t('setup.name.title')}
        />
      </Window>
      <ActionButton wide label={t('common.next')} disabled={!name.trim()} onPress={submit} />
    </>
  );
}

function BudgetStep() {
  const { dispatch, t } = useAcorn();
  const [value, setValue] = useState('');
  const amount = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(amount) && amount > 0;

  return (
    <>
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
      </Window>
      <ActionButton
        wide
        label={t('common.next')}
        disabled={!valid}
        onPress={() => dispatch({ type: 'setBudget', budgetUsd: amount })}
      />
    </>
  );
}

function MissionsStep() {
  const { data, dispatch, t } = useAcorn();
  const showToast = useToast();
  const missions = data.week?.missions ?? [];
  const [name, setName] = useState('');
  const [kind, setKind] = useState<MissionKind>('daily');
  const [sending, setSending] = useState(false);
  const canAdd = !sending && canAddMission(missions, kind);

  async function score() {
    setSending(true);
    const result = await apiClient.judgeMissions(
      data.budgetUsd!,
      missions.map((m) => ({ id: m.id, name: m.name, kind: m.kind })),
    );
    setSending(false);
    if (result.ok) dispatch({ type: 'missionsScored', results: result.data });
    else showToast(t(`error.${result.error}`));
  }

  function add() {
    dispatch({ type: 'addMission', id: newId(), name, kind });
    setName('');
  }

  return (
    <>
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
              disabled={sending}
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
      </Window>
      <ActionButton
        wide
        label={t(sending ? 'setup.missions.sending' : 'setup.missions.done')}
        disabled={sending || !canFinishMissions(missions)}
        onPress={score}
      />
    </>
  );
}

const styles = StyleSheet.create({
  help: { fontSize: 13, color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kind: { color: colors.acorn, fontSize: 13 },
});
