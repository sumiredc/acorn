import { initialData } from '@/domain/types';

import { parseSaved } from '../persist';

describe('parseSaved', () => {
  it('starts fresh without saved data or with broken data', () => {
    expect(parseSaved(null)).toEqual(initialData);
    expect(parseSaved('{oops')).toEqual(initialData);
  });

  it('fills fields added after the data was saved', () => {
    const data = parseSaved(JSON.stringify({ version: 1, budgetUsd: 500, locale: 'ja' }));
    expect(data).toMatchObject({ budgetUsd: 500, locale: 'ja', userName: null, clears: [] });
  });

  it('sends a week stuck in the old scoring state back to setup', () => {
    const week = { weekStart: '2026-10-19', status: 'scoring', missions: [] };
    expect(parseSaved(JSON.stringify({ week })).week!.status).toBe('setup');
  });

  it('treats missions saved before units as one-off goals', () => {
    const old = { id: 'a', name: 'A', kind: 'daily', pt: 4, judgement: null };
    const week = { weekStart: '2026-10-19', status: 'active', missions: [old] };
    expect(parseSaved(JSON.stringify({ week })).week!.missions[0]).toMatchObject({
      unit: 'none',
      target: 1,
    });
  });
});
