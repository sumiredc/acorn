import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { canUndo, currentClear, nextUndoDeadline } from '@/domain/clears';
import { appNow, remainingTime } from '@/domain/clock';
import { currentProgress, periodEnd } from '@/domain/progress';
import { nextSetupStep } from '@/domain/setup';
import { timelineDays } from '@/domain/timeline';
import type { Mission } from '@/domain/types';
import { newId } from '@/storage/id';
import { useAcorn } from '@/storage/store';
import { DemoClock } from '@/ui/DemoClock';
import { goalLabel, progressLabel } from '@/ui/missionText';
import { PixelIcon } from '@/ui/PixelIcon';
import { ActionButton, PixelText, Window } from '@/ui/primitives';
import { ProgressBar } from '@/ui/ProgressBar';
import { type InputMode, ProgressModal } from '@/ui/ProgressModal';
import { Screen } from '@/ui/Screen';
import { colors } from '@/ui/theme';
import { Timeline } from '@/ui/Timeline';
import { useToast } from '@/ui/Toast';

export default function HomeScreen() {
  const { data, now, dispatch, t } = useAcorn();
  const toast = useToast();
  const [recording, setRecording] = useState<Mission | null>(null);
  const [mode, setMode] = useState<InputMode>('buttons');
  // Real time as state, refreshed by the timers below. Reading Date.now() during render
  // would not refresh the screen, because the React Compiler memoizes the render.
  const [realNow, setRealNow] = useState(() => Date.now());
  // Every minute, so the time left stays current.
  useEffect(() => {
    const timer = setInterval(() => setRealNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  // And right when an undo window closes, so its button disappears on time.
  useEffect(() => {
    const deadline = nextUndoDeadline(data.clears, now());
    if (deadline === null) return;
    const timer = setTimeout(() => setRealNow(Date.now()), deadline - now() + 1);
    return () => clearTimeout(timer);
  }, [data.clears, now, realNow]);

  if (nextSetupStep(data) !== null) return <Redirect href="/setup" />;

  const week = data.week!;
  const at = appNow(realNow, data.clockOffsetMs);

  function save(value: number) {
    const mission = recording!;
    setRecording(null);
    dispatch({ type: 'recordProgress', missionId: mission.id, value, clearId: newId() });
    if (value >= mission.target) toast(t('home.clearToast', { pt: mission.pt! }), 'success');
  }

  function undo(mission: Mission) {
    const clear = currentClear(data.clears, mission, week, now());
    if (!clear || !canUndo(data, clear, now())) {
      toast(t('home.undoRefused'));
      return;
    }
    dispatch({ type: 'undoClear', clearId: clear.id });
    toast(t('home.undoToast', { pt: clear.pt }), 'success');
  }

  return (
    <Screen title={t('home.title')}>
      <PixelText style={styles.greeting}>{t('home.greeting', { name: data.userName! })}</PixelText>
      <Window title={t('home.timeline')}>
        <Timeline days={timelineDays(week, data.clears, at)} />
      </Window>
      <PixelText style={styles.section}>{t('home.missions')}</PixelText>
      {week.missions.map((m) => {
        const clear = currentClear(data.clears, m, week, at);
        const value = currentProgress(m, week, at);
        const left = remainingTime(periodEnd(m, week, at) - at);
        return (
          <Window key={m.id} style={clear ? styles.cleared : undefined}>
            <View style={styles.header}>
              <PixelIcon name={m.kind} size={14} color={colors.acorn} label={t(`kind.${m.kind}`)} />
              <PixelText style={styles.name}>
                {m.name}
                {m.unit !== 'percent' && (
                  <PixelText style={styles.goal}> {goalLabel(m, t)}</PixelText>
                )}
              </PixelText>
              <PixelText style={styles.pt}>{m.pt}pt</PixelText>
            </View>
            <View style={styles.progressRow}>
              <View style={styles.grow}>
                <ProgressBar value={value} unit={m.unit} target={m.target} cleared={!!clear} />
              </View>
              <PixelText style={styles.progressText}>{progressLabel(m, value, t)}</PixelText>
            </View>
            <View style={styles.actions}>
              <PixelText style={styles.left}>
                {clear ? '' : t(`remaining.${left.unit}`, { value: left.value })}
              </PixelText>
              {clear ? (
                <>
                  <PixelText style={styles.clearedText}>{t('home.cleared')}</PixelText>
                  {canUndo(data, clear, at) && (
                    <ActionButton tone="plain" label={t('home.undo')} onPress={() => undo(m)} />
                  )}
                </>
              ) : (
                <ActionButton label={t('home.record')} onPress={() => setRecording(m)} />
              )}
            </View>
          </Window>
        );
      })}
      <DemoClock />
      <ProgressModal
        mission={recording}
        value={recording ? currentProgress(recording, week, at) : 0}
        mode={mode}
        onModeChange={setMode}
        onSave={save}
        onClose={() => setRecording(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 17 },
  section: { fontSize: 15, color: colors.muted },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1 },
  goal: { color: colors.sky },
  pt: { fontSize: 18 },
  cleared: { backgroundColor: colors.leafSoft },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  progressText: { fontSize: 14, minWidth: 96, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  left: { flex: 1, fontSize: 12, color: colors.muted },
  clearedText: { color: colors.leaf, fontSize: 16 },
});
