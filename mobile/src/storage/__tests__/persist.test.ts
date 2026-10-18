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

  it('tracks missions saved before units, or with the old none unit, in %', () => {
    const old = { id: 'a', name: 'A', kind: 'daily', pt: 4, judgement: null };
    const week = { weekStart: '2026-10-19', status: 'active', missions: [old] };
    const none = { ...old, id: 'b', unit: 'none', target: 1 };
    const saved = parseSaved(JSON.stringify({ week: { ...week, missions: [old, none] } }));
    for (const m of saved.week!.missions) expect(m).toMatchObject({ unit: 'percent', target: 100 });
  });
});
