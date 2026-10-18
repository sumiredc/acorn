import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { nextSetupStep } from '@/domain/setup';
import { useAcorn } from '@/storage/store';
import { LANGUAGES, NAME_MAX } from '@/ui/languages';
import { ActionButton, Choice, Field, Window } from '@/ui/primitives';
import { Screen } from '@/ui/Screen';
import { useToast } from '@/ui/Toast';

export default function SettingsScreen() {
  const { data, locale, dispatch, t } = useAcorn();
  const toast = useToast();
  const [name, setName] = useState(data.userName ?? '');

  if (nextSetupStep(data) !== null) return <Redirect href="/setup" />;

  const canSave = name.trim() !== '' && name.trim() !== data.userName;

  function saveName() {
    if (!canSave) return;
    dispatch({ type: 'setUserName', name });
    setName(name.trim());
    toast(t('settings.nameSaved'), 'success');
  }

  return (
    <Screen logo={false} title={t('settings.title')}>
      <Window title={t('setup.name.title')}>
        <View style={styles.inline}>
          <Field
            style={styles.grow}
            value={name}
            onChangeText={setName}
            onSubmitEditing={saveName}
            maxLength={NAME_MAX}
            placeholder={t('setup.name.placeholder')}
            accessibilityLabel={t('setup.name.title')}
          />
          <ActionButton label={t('settings.save')} disabled={!canSave} onPress={saveName} />
        </View>
      </Window>
      {/* The language takes effect as soon as it is picked, so there is nothing to save. */}
      <Window title={t('setup.language.title')}>
        <Choice
          options={LANGUAGES}
          value={locale}
          onChange={(next) => dispatch({ type: 'setLocale', locale: next })}
        />
      </Window>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
});
