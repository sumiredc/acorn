import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { nextSetupStep } from '@/domain/setup';
import { useAcorn } from '@/storage/store';
import { PixelText, Window } from '@/ui/primitives';
import { Screen } from '@/ui/Screen';
import { StatusDistribution } from '@/ui/StatusDistribution';
import { colors } from '@/ui/theme';

export default function HomeScreen() {
  const { data, t } = useAcorn();

  if (nextSetupStep(data) !== null) return <Redirect href="/setup" />;

  return (
    <Screen title={t('home.title')}>
      <PixelText style={styles.greeting}>{t('home.greeting', { name: data.userName! })}</PixelText>
      <PixelText style={styles.section}>{t('home.missions')}</PixelText>
      {data.week!.missions.map((m) => (
        <Window key={m.id}>
          <View style={styles.header}>
            <PixelText style={styles.name}>
              <PixelText style={styles.kind}>[{t(`kind.${m.kind}`)}]</PixelText> {m.name}
            </PixelText>
            <PixelText style={styles.pt}>{m.pt}pt</PixelText>
          </View>
          {m.judgement && <StatusDistribution judgement={m.judgement} />}
        </Window>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 17 },
  section: { fontSize: 15, color: colors.muted },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1 },
  kind: { color: colors.acorn, fontSize: 13 },
  pt: { fontSize: 18 },
});
