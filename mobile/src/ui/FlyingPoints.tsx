import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';

import { SPARK_COLORS } from './Sparks';
import { colors, fonts } from './theme';

const useNativeDriver = Platform.OS !== 'web';
// Sparkles trailing behind the points, each a little later along the same arc.
const TRAIL = 6;
const TRAIL_LAG = 0.06;

export type Point = { x: number; y: number };
export type Flight = { key: number; pt: number; from: Point; to: Point; delay: number };

// "+Npt" flies in an arc from a cleared mission to the total, then calls onArrive.
// Coordinates are relative to the overlay this is drawn in.
export function FlyingPoints({ flight, onArrive }: { flight: Flight; onArrive: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    Animated.sequence([
      Animated.delay(flight.delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) onArrive();
    });
  }, [flight.key, flight.delay, onArrive, progress]);

  const { from, to } = flight;
  // Arc upward, but never above the top of the screen.
  const peak = Math.max(4, Math.min(from.y, to.y) - 40);
  // Position along the arc for progress that starts at `lag` instead of 0.
  const along = (lag: number) => [
    {
      translateX: progress.interpolate({
        inputRange: [lag, 1],
        outputRange: [from.x, to.x],
        extrapolate: 'clamp',
      }),
    },
    {
      translateY: progress.interpolate({
        inputRange: [lag, lag + 0.4 * (1 - lag), 1],
        outputRange: [from.y, peak, to.y],
        extrapolate: 'clamp',
      }),
    },
  ];
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
