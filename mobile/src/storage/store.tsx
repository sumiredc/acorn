import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { appNow } from '@/domain/clock';
import { type AcornData, initialData, type Locale } from '@/domain/types';
import { type MessageKey, resolveLocale, translate } from '@/i18n';

import { parseSaved } from './persist';
import { type Action, reduce } from './reducer';

const STORAGE_KEY = 'acorn:v1';

type Store = {
  data: AcornData;
  locale: Locale;
  now: () => number;
  dispatch: (action: Action) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AcornData | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(parseSaved)
      .catch(() => initialData)
      .then((loaded) =>
        setData(reduce(loaded, { type: 'tick' }, appNow(Date.now(), loaded.clockOffsetMs))),
      );
  }, []);

  useEffect(() => {
    if (data) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const dispatch = useCallback((action: Action) => {
    setData((prev) => (prev ? reduce(prev, action, appNow(Date.now(), prev.clockOffsetMs)) : prev));
  }, []);

  const store = useMemo<Store | null>(() => {
    if (!data) return null;
    const locale = resolveLocale(data.locale, getLocales()[0]?.languageCode ?? null);
    return {
      data,
      locale,
      now: () => appNow(Date.now(), data.clockOffsetMs),
      dispatch,
      t: (key, params) => translate(locale, key, params),
    };
  }, [data, dispatch]);

  // Render nothing until saved data is loaded, so screens never see a half-empty state.
  if (!store) return null;
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useAcorn(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAcorn must be used inside StoreProvider');
  return store;
}
