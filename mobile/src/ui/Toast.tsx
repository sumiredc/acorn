import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PixelText } from './primitives';
import { colors, layout } from './theme';

export const TOAST_MS = 3500;

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const show = useCallback<ShowToast>((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <View pointerEvents="none" style={styles.layer}>
          <View accessibilityRole="alert" style={styles.toast}>
            <PixelText style={styles.text}>{toast.message}</PixelText>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 16, right: 16, bottom: 32, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: layout.maxWidth,
    backgroundColor: colors.berrySoft,
    borderColor: colors.berry,
    borderWidth: layout.border,
    borderRadius: layout.radius,
    padding: 12,
  },
  text: { color: colors.berry, fontSize: 14 },
});
