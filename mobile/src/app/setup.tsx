import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { apiClient } from '@/api/client';
import { availableRewards, canAddReward } from '@/domain/rewards';
import { nextSetupStep } from '@/domain/setup';
import type { Locale, Mission, MissionKind } from '@/domain/types';
import { canAddMission, canFinishMissions, carryableMissions, missionSlots } from '@/domain/week';
import { newId } from '@/storage/id';
import { useAcorn } from '@/storage/store';
import { AcornAmount } from '@/ui/AcornAmount';
import { AddRewardSheet } from '@/ui/AddRewardSheet';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { IconButton } from '@/ui/IconButton';
import { goalLabel } from '@/ui/missionText';
import { MissionModal, type NewMission } from '@/ui/MissionModal';
import { PixelIcon } from '@/ui/PixelIcon';
import { ActionButton, Choice, ErrorText, Field, PixelText, Window } from '@/ui/primitives';
import { Screen } from '@/ui/Screen';
import { colors } from '@/ui/theme';
import { useToast } from '@/ui/Toast';

// Language names stay in their own language so either reader can find theirs.
const LANGUAGES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
];
const KINDS: MissionKind[] = ['daily', 'weekly'];

export default function SetupScreen() {
  const { data, t } = useAcorn();
  const step = nextSetupStep(data);
  // Adding the first reward moves the flow on to missions, so stay here until "Next" is pressed.
  const [stayOnRewards, setStayOnRewards] = useState(false);

  if (step === null) return <Redirect href="/" />;
  const showRewards = step === 'rewards' || (step === 'missions' && stayOnRewards);

  return (
    <Screen title={t('setup.title')}>
      {step === 'language' && <LanguageStep />}
      {step === 'name' && <NameStep />}
      {step === 'budget' && <BudgetStep />}
      {showRewards && (
        <RewardsStep
          onAdded={() => setStayOnRewards(true)}
          onNext={() => setStayOnRewards(false)}
        />
      )}
      {step === 'missions' && !showRewards && <MissionsStep />}
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
        <Choice options={LANGUAGES} value={choice} onChange={setChoice} />
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

function RewardsStep({ onAdded, onNext }: { onAdded: () => void; onNext: () => void }) {
  const { data, t } = useAcorn();
  const [adding, setAdding] = useState(false);
  const waiting = availableRewards(data.rewards);

  return (
    <>
      <Window title={t('rewards.title')}>
        {waiting.map((reward) => (
          <View key={reward.id} style={styles.slot}>
            <PixelText style={styles.grow}>{reward.name}</PixelText>
            <AcornAmount value={reward.pt} label={t('acorns.count', { count: reward.pt })} />
          </View>
        ))}
        {canAddReward(data.rewards) && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setAdding(true)}
            style={[styles.slot, styles.empty]}
          >
            <PixelText style={styles.emptyLabel}>{t('rewards.empty')}</PixelText>
          </Pressable>
        )}
      </Window>
      <ActionButton
        wide
        label={t('common.next')}
        disabled={waiting.length === 0}
        onPress={onNext}
      />
      <AddRewardSheet visible={adding} onAdded={onAdded} onClose={() => setAdding(false)} />
    </>
  );
}

function MissionsStep() {
  const { data, dispatch, t } = useAcorn();
  const showToast = useToast();
  const missions = data.week?.missions ?? [];
  const [adding, setAdding] = useState<MissionKind | null>(null);
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState<Mission | null>(null);

  async function score() {
    setSending(true);
    const result = await apiClient.judgeMissions(
      data.budgetUsd!,
      missions.map((m) => ({
        id: m.id,
        name: m.name,
        kind: m.kind,
        unit: m.unit,
        target: m.target,
      })),
    );
    setSending(false);
    if (result.ok) dispatch({ type: 'missionsScored', results: result.data });
    else showToast(t(`error.${result.error}`));
  }

  function remove() {
    if (removing) dispatch({ type: 'removeMission', id: removing.id });
    setRemoving(null);
  }

  function add(mission: NewMission & { kind: MissionKind }) {
    dispatch({ type: 'addMission', id: newId(), ...mission });
    setAdding(null);
  }

  const carryable = carryableMissions(data.previousMissions, missions);

  return (
    <>
      {carryable.length > 0 && (
        <Window title={t('setup.carry.title')}>
          {carryable.map((mission) => (
            <View key={mission.id} style={styles.slot}>
              <PixelIcon
                name={mission.kind}
                size={14}
                color={colors.acorn}
                label={t(`kind.${mission.kind}`)}
              />
              <PixelText style={styles.grow}>
                {mission.name}
                {mission.unit !== 'percent' && (
                  <PixelText style={styles.goal}> {goalLabel(mission, t)}</PixelText>
                )}
              </PixelText>
              <ActionButton
                tone="plain"
                style={styles.carry}
                label={t('setup.carry.add')}
                disabled={sending || !canAddMission(missions, mission.kind)}
                onPress={() =>
                  dispatch({ type: 'carryOverMission', fromId: mission.id, id: newId() })
                }
              />
            </View>
          ))}
        </Window>
      )}
      <Window title={t('setup.missions.title')}>
        {KINDS.map((kind) => (
          <View key={kind} style={styles.group}>
            <PixelText style={styles.kind}>{t(`kind.${kind}`)}</PixelText>
            {missionSlots(missions)
              .filter((slot) => slot.kind === kind)
              .map(({ mission }, i) =>
                mission ? (
                  <View key={mission.id} style={styles.slot}>
                    <PixelText style={styles.grow}>
                      {mission.name}
                      {mission.unit !== 'percent' && (
                        <PixelText style={styles.goal}> {goalLabel(mission, t)}</PixelText>
                      )}
                    </PixelText>
                    <IconButton
                      icon="trash"
                      label={t('setup.missions.remove')}
                      disabled={sending}
                      onPress={() => setRemoving(mission)}
                    />
                  </View>
                ) : (
                  <Pressable
                    key={`empty-${i}`}
                    accessibilityRole="button"
                    disabled={sending}
                    onPress={() => setAdding(kind)}
                    style={[styles.slot, styles.empty]}
                  >
                    <PixelText style={styles.emptyLabel}>{t('setup.missions.empty')}</PixelText>
                  </Pressable>
                ),
              )}
          </View>
        ))}
      </Window>
      <ActionButton
        wide
        label={t(sending ? 'setup.missions.sending' : 'setup.missions.done')}
        disabled={sending || !canFinishMissions(missions)}
        onPress={score}
      />
      <MissionModal kind={adding} onAdd={add} onClose={() => setAdding(null)} />
      <ConfirmModal
        message={removing && t('setup.missions.removeConfirm', { name: removing.name })}
        confirmLabel={t('setup.missions.remove')}
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  help: { fontSize: 13, color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  group: { gap: 6 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 6,
  },
  empty: { borderStyle: 'dashed', borderColor: colors.muted, justifyContent: 'center' },
  emptyLabel: { color: colors.muted, fontSize: 14 },
  kind: { color: colors.acorn, fontSize: 13 },
  goal: { color: colors.sky },
  carry: { alignSelf: 'center', paddingVertical: 4 },
});
