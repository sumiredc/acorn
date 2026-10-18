import { useState } from 'react';
import { type GestureResponderEvent, StyleSheet, View } from 'react-native';

import type { MissionUnit } from '@/domain/types';
import { progressStep, snapProgress } from '@/domain/progress';

import { colors } from './theme';

// Ticks get too dense to read past this many steps; the bar still snaps to every step.
const MAX_TICKS = 20;

// Read-only unless `onChange` is given; then tapping or dragging snaps to the nearest step.
export function ProgressBar({
  value,
  unit,
  target,
  cleared = false,
  onChange,
}: {
  value: number;
  unit: MissionUnit;
  target: number;
  cleared?: boolean;
  onChange?: (value: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const step = progressStep(unit, target);
  const ticks = Math.ceil(target / step) - 1;

  function pick(e: GestureResponderEvent) {
    if (onChange && width > 0)
      onChange(snapProgress(e.nativeEvent.locationX / width, unit, target));
  }

  const interactive = onChange !== undefined;
  return (
    <View
      accessibilityRole={interactive ? 'adjustable' : 'progressbar'}
      accessibilityValue={{ min: 0, max: target, now: value }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => interactive}
      onMoveShouldSetResponder={() => interactive}
      onResponderGrant={pick}
      onResponderMove={pick}
      style={[styles.track, interactive && styles.trackLarge]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.fill,
          { width: `${(value / target) * 100}%` },
          cleared && styles.fillCleared,
        ]}
      />
      {interactive &&
        ticks <= MAX_TICKS &&
        Array.from({ length: ticks }, (_, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={[styles.tick, { left: `${(((i + 1) * step) / target) * 100}%` }]}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    borderColor: colors.ink,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: colors.soft,
    overflow: 'hidden',
  },
  trackLarge: { height: 32 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.acorn },
  fillCleared: { backgroundColor: colors.leaf },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.ink,
    opacity: 0.25,
  },
});
