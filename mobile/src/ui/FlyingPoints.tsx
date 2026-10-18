import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';

import { SPARK_COLORS } from './Sparks';
import { colors, fonts } from './theme';

const useNativeDriver = Platform.OS !== 'web';
// Points sampled along the curve; the animation runs straight between them.
const STEPS = 16;
// Sparkles trailing behind the points, each a little later along the same arc.
const TRAIL = 6;
const TRAIL_LAG = 0.06;

export type Point = { x: number; y: number };
export type Flight = { key: number; pt: number; from: Point; to: Point; delay: number };

// "+Npt" flies from a cleared mission to the total, swinging out to the left and curving back
// right, then calls onArrive.
// Coordinates are relative to the overlay this is drawn in.
export function FlyingPoints({ flight, onArrive }: { flight: Flight; onArrive: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    Animated.sequence([
      Animated.delay(flight.delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: 850,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) onArrive();
    });
  }, [flight.key, flight.delay, onArrive, progress]);

  const { from, to } = flight;
  // A quadratic curve whose control point sits left of both ends, kept on screen.
  const control = {
    x: Math.max(8, Math.min(from.x, to.x) - 160),
    y: Math.max(4, (from.y + to.y) / 2),
  };
  const ts = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);
  const curve = (a: number, c: number, b: number) =>
    ts.map((t) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t ** 2 * b);
  const xs = curve(from.x, control.x, to.x);
  const ys = curve(from.y, control.y, to.y);
  // Position along the curve for progress that starts at `lag` instead of 0.
  const along = (lag: number) => {
    const inputRange = ts.map((t) => lag + t * (1 - lag));
    return [
      { translateX: progress.interpolate({ inputRange, outputRange: xs, extrapolate: 'clamp' }) },
      { translateY: progress.interpolate({ inputRange, outputRange: ys, extrapolate: 'clamp' }) },
    ];
  };
  return (
    <>
      {Array.from({ length: TRAIL }, (_, i) => {
        const lag = (i + 1) * TRAIL_LAG;
        return (
          <Animated.View
            key={i}
            style={[
              styles.trail,
              {
                backgroundColor: SPARK_COLORS[i % SPARK_COLORS.length],
                opacity: progress.interpolate({
                  inputRange: [0, lag, lag + 0.01, 0.95, 1],
                  outputRange: [0, 0, 1 - i / TRAIL, 0.3, 0],
                }),
                transform: [...along(lag), { translateX: 14 }, { translateY: 10 }],
              },
            ]}
          />
        );
      })}
      <Animated.Text
        style={[
          styles.points,
          {
            opacity: progress.interpolate({
              inputRange: [0, 0.01, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              ...along(0),
              {
                scale: progress.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [1, 1.3, 0.8],
                }),
              },
            ],
          },
        ]}
      >
        +{flight.pt}pt
      </Animated.Text>
    </>
  );
}

const styles = StyleSheet.create({
  trail: { position: 'absolute', left: 0, top: 0, width: 5, height: 5 },
  points: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontFamily: fonts.pixel,
    fontSize: 18,
    color: colors.leaf,
  },
});
