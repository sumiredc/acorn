import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { balance } from '@/domain/balance';
import { canUndo, currentClear, nextUndoDeadline } from '@/domain/clears';
import { appNow, remainingTime } from '@/domain/clock';
import { currentProgress, isCheckOnly, periodEnd } from '@/domain/progress';
import { nextSetupStep } from '@/domain/setup';
import { timelineDays } from '@/domain/timeline';
import type { Mission } from '@/domain/types';
import { newId } from '@/storage/id';
import { useAcorn } from '@/storage/store';
import { AcornAmount } from '@/ui/AcornAmount';
import { ClearPop } from '@/ui/ClearPop';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { DemoClock } from '@/ui/DemoClock';
import { type Flight, FlyingPoints } from '@/ui/FlyingPoints';
import { IconButton } from '@/ui/IconButton';
import { progressLabel } from '@/ui/missionText';
import { measureInWindow, type ViewHandle } from '@/ui/measure';
import { PixelIcon } from '@/ui/PixelIcon';
import { PointCounter } from '@/ui/PointCounter';
import { PixelText, Window } from '@/ui/primitives';
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
  const [undoing, setUndoing] = useState<Mission | null>(null);
  // The mission cleared last, so its card can celebrate; `key` restarts the animation.
  const [celebrating, setCelebrating] = useState<{
    missionId: string;
    key: number;
    delay: number;
  } | null>(null);
  // Points on their way to the counter. The counter holds them back until they arrive, then
  // counts up; `flight` stays null when the positions can't be measured.
  const [pending, setPending] = useState<{
    missionId: string;
    pt: number;
    flight: Flight | null;
  } | null>(null);
  const ptRefs = useRef(new Map<string, ViewHandle | null>());
  const counterRef = useRef<ViewHandle>(null);
  const overlayRef = useRef<ViewHandle>(null);
  // Real time as state, refreshed by the timers below. Reading Date.now() during render
  // would not refresh the screen, because the React Compiler memoizes the render.
  const [realNow, setRealNow] = useState(() => Date.now());
  // Every minute, so the time left stays current; the tick also starts a new week if Monday
  // arrives while the app is open.
  useEffect(() => {
    const timer = setInterval(() => {
      setRealNow(Date.now());
      dispatch({ type: 'tick' });
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [dispatch]);
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

  // Missions still to do come first. A card that was just cleared keeps its place until its
  // points have reached the total, so the celebration plays where it happened.
  const sinksToBottom = (m: Mission) =>
    currentClear(data.clears, m, week, at) !== undefined && pending?.missionId !== m.id;
  const orderedMissions = [
    ...week.missions.filter((m) => !sinksToBottom(m)),
    ...week.missions.filter(sinksToBottom),
  ];

  function record(mission: Mission, value: number) {
    setRecording(null);
    dispatch({ type: 'recordProgress', missionId: mission.id, value, clearId: newId() });
    if (value < mission.target) return;
    // Saved from the record window: start once the window has faded out.
    const delay = recording ? 250 : 0;
    setCelebrating((prev) => ({ missionId: mission.id, key: (prev?.key ?? 0) + 1, delay }));
    setPending({ missionId: mission.id, pt: mission.pt!, flight: null });
    launchPoints(mission, delay);
  }

  async function launchPoints(mission: Mission, delay: number) {
    const [from, to, origin] = await Promise.all([
      measureInWindow(ptRefs.current.get(mission.id)),
      measureInWindow(counterRef.current),
      measureInWindow(overlayRef.current),
    ]);
    if (!from || !to || !origin) {
      setPending(null);
      return;
    }
    setPending((prev) => ({
      missionId: mission.id,
      pt: mission.pt!,
      flight: {
        key: (prev?.flight?.key ?? 0) + 1,
        pt: mission.pt!,
        delay,
        from: { x: from.x - origin.x, y: from.y - origin.y },
        to: { x: to.x + to.width - 50 - origin.x, y: to.y - origin.y },
      },
    }));
  }

  function undo() {
    const mission = undoing;
    setUndoing(null);
    if (!mission) return;
    const clear = currentClear(data.clears, mission, week, now());
    if (!clear || !canUndo(data, clear, now())) {
      toast(t('home.undoRefused'));
      return;
    }
    dispatch({ type: 'undoClear', clearId: clear.id });
    toast(t('home.undoToast', { pt: clear.pt }), 'success');
  }

  return (
    <Screen
      logo={false}
      right={
        <PointCounter
          ref={counterRef}
          spokenLabel={t('shop.balanceSpoken', { count: balance(data) })}
          value={balance(data) - (pending?.pt ?? 0)}
        />
      }
      overlay={
        <View ref={overlayRef} pointerEvents="none" style={StyleSheet.absoluteFill}>
          {pending?.flight && (
            <FlyingPoints flight={pending.flight} onArrive={() => setPending(null)} />
          )}
        </View>
      }
    >
      <PixelText style={styles.greeting}>{t('home.greeting', { name: data.userName! })}</PixelText>
      <Window title={t('home.timeline')}>
        <Timeline days={timelineDays(week, data.clears, at)} />
      </Window>
      <PixelText style={styles.section}>{t('home.missions')}</PixelText>
      {orderedMissions.map((m) => {
        const clear = currentClear(data.clears, m, week, at);
        const value = currentProgress(m, week, at);
        const left = remainingTime(periodEnd(m, week, at) - at);
        return (
          <ClearPop
            key={m.id}
            play={celebrating?.missionId === m.id ? celebrating.key : null}
            delay={celebrating?.delay}
          >
            <Window style={clear ? styles.cleared : undefined}>
              <View style={styles.header}>
                <PixelIcon
                  name={m.kind}
                  size={14}
                  color={colors.acorn}
                  label={t(`kind.${m.kind}`)}
                />
                <PixelText style={styles.name}>{m.name}</PixelText>
                <View
                  ref={(el) => {
                    ptRefs.current.set(m.id, el);
                  }}
                >
                  <AcornAmount
                    value={m.pt!}
                    style={styles.pt}
                    label={t('acorns.count', { count: m.pt! })}
                  />
                </View>
              </View>
              {!isCheckOnly(m) && (
                <View style={styles.progressRow}>
                  <View style={styles.grow}>
                    <ProgressBar value={value} unit={m.unit} target={m.target} cleared={!!clear} />
                  </View>
                  <PixelText style={styles.progressText}>{progressLabel(m, value, t)}</PixelText>
                </View>
              )}
              <View style={styles.actions}>
                <PixelText style={styles.left}>
                  {clear ? '' : t(`remaining.${left.unit}`, left)}
                </PixelText>
                {clear ? (
                  <>
                    <PixelText style={styles.clearedText}>{t('home.cleared')}</PixelText>
                    {canUndo(data, clear, at) && (
                      <IconButton
                        icon="undo"
                        label={t('home.undo')}
                        onPress={() => setUndoing(m)}
                        large
                      />
                    )}
                  </>
                ) : isCheckOnly(m) ? (
                  <IconButton
                    icon="check"
                    label={t('home.check')}
                    onPress={() => record(m, 1)}
                    large
                  />
                ) : (
                  <IconButton
                    icon="record"
                    label={t('home.record')}
                    onPress={() => setRecording(m)}
                    large
                  />
                )}
              </View>
            </Window>
          </ClearPop>
        );
      })}
      <DemoClock />
      <ConfirmModal
        message={undoing && t('home.undoConfirm', { name: undoing.name })}
        confirmLabel={t('home.undo')}
        onConfirm={undo}
        onCancel={() => setUndoing(null)}
      />
      <ProgressModal
        mission={recording}
        value={recording ? currentProgress(recording, week, at) : 0}
        mode={mode}
        onModeChange={setMode}
        onSave={(value) => recording && record(recording, value)}
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
  pt: { fontSize: 18 },
  cleared: { backgroundColor: colors.leafSoft },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  progressText: { fontSize: 14, minWidth: 96, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  left: { flex: 1, fontSize: 12, color: colors.muted },
  clearedText: { color: colors.leaf, fontSize: 16 },
});
