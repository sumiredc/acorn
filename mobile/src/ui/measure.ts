import type { ComponentRef } from 'react';
import type { View } from 'react-native';

export type ViewHandle = ComponentRef<typeof View>;
export type Box = { x: number; y: number; width: number; height: number };

// Where a view is on screen, or null when it is not mounted.
export function measureInWindow(view: ViewHandle | null | undefined): Promise<Box | null> {
  return new Promise((resolve) => {
    if (!view) return resolve(null);
    view.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}
