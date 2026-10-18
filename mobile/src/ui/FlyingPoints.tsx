import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';

import { colors, fonts } from './theme';

const useNativeDriver = Platform.OS !== 'web';

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
  return (
    <Animated.Text
      style={[
        styles.points,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.01, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [from.x, to.x] }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [from.y, peak, to.y],
              }),
            },
            {
              scale: progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.3, 0.8] }),
            },
          ],
        },
      ]}
    >
      +{flight.pt}pt
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  points: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontFamily: fonts.pixel,
    fontSize: 18,
    color: colors.leaf,
  },
});
