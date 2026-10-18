import { translate } from '@/i18n';

import { goalLabel } from '../missionText';

const ja = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
  translate('ja', key, params);

describe('goalLabel', () => {
  it('shows the target with its unit', () => {
    expect(goalLabel({ unit: 'count', target: 20 }, ja)).toBe('20回');
    expect(goalLabel({ unit: 'minutes', target: 30 }, ja)).toBe('30分');
  });

  it('is empty for a one-off mission', () => {
    expect(goalLabel({ unit: 'percent', target: 1 }, ja)).toBe('');
  });
});
