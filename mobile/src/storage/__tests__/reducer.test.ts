import { type AcornData, initialData } from '@/domain/types';

import { type Action, reduce } from '../reducer';

const NOW = new Date(2026, 9, 21, 9).getTime(); // Wednesday
const run = (actions: Action[], from: AcornData = initialData) =>
  actions.reduce((data, action) => reduce(data, action, NOW), from);

const judgement = {
  choice: 'level_2',
  probabilities: { level_2: 0.8, level_3: 0.2 },
  confidence: 0.7,
};

describe('reduce', () => {
  it('creates this week on first use', () => {
    const data = run([{ type: 'tick' }]);
    expect(data.week).toEqual({ weekStart: '2026-10-19', status: 'setup', missions: [] });
  });

  it('sets a positive budget and ignores others', () => {
    expect(run([{ type: 'setBudget', budgetUsd: 500 }]).budgetUsd).toBe(500);
    expect(run([{ type: 'setBudget', budgetUsd: 0 }]).budgetUsd).toBeNull();
    expect(run([{ type: 'setBudget', budgetUsd: Number.NaN }]).budgetUsd).toBeNull();
  });

  it('adds missions with trimmed names and enforces the limits', () => {
    const data = run([
      {
        type: 'addMission',
        id: 'w1',
        name: '  Clean room ',
        kind: 'weekly',
        unit: 'percent',
        target: 1,
      },
      { type: 'addMission', id: 'w2', name: 'Another', kind: 'weekly', unit: 'percent', target: 1 },
      { type: 'addMission', id: 'd1', name: '   ', kind: 'daily', unit: 'percent', target: 1 },
    ]);
    expect(data.week!.missions.map((m) => [m.id, m.name])).toEqual([['w1', 'Clean room']]);
  });

  it('stores the goal and rejects a missing target', () => {
    const data = run([
      { type: 'addMission', id: 'a', name: 'Push-ups', kind: 'daily', unit: 'count', target: 20 },
      { type: 'addMission', id: 'b', name: 'Read', kind: 'daily', unit: 'minutes', target: 0 },
      { type: 'addMission', id: 'c', name: 'Clean', kind: 'weekly', unit: 'percent', target: 99 },
    ]);
    expect(data.week!.missions.map((m) => [m.id, m.unit, m.target])).toEqual([
      ['a', 'count', 20],
      ['c', 'percent', 100],
    ]);
  });

  it('removes a mission during setup', () => {
    const data = run([
      { type: 'addMission', id: 'a', name: 'A', kind: 'daily', unit: 'percent', target: 1 },
      { type: 'removeMission', id: 'a' },
    ]);
    expect(data.week!.missions).toEqual([]);
  });

  it('stores a trimmed name and ignores a blank one', () => {
    expect(run([{ type: 'setUserName', name: '  Sumire ' }]).userName).toBe('Sumire');
    expect(run([{ type: 'setUserName', name: '   ' }]).userName).toBeNull();
  });

  it('activates the week once every mission is scored', () => {
    const data = run([
      { type: 'addMission', id: 'a', name: 'A', kind: 'daily', unit: 'percent', target: 1 },
      { type: 'missionsScored', results: [{ id: 'a', pt: 4, judgement }] },
      { type: 'addMission', id: 'b', name: 'B', kind: 'daily', unit: 'percent', target: 1 },
    ]);
    expect(data.week!.status).toBe('active');
    expect(data.week!.missions).toHaveLength(1);
    expect(data.week!.missions[0]).toMatchObject({ pt: 4, judgement });
  });

  it('ignores scores for an empty week', () => {
    expect(run([{ type: 'missionsScored', results: [] }]).week!.status).toBe('setup');
  });

  it('stays in setup when a result is missing', () => {
    const data = run([
      { type: 'addMission', id: 'a', name: 'A', kind: 'daily', unit: 'percent', target: 1 },
      { type: 'addMission', id: 'b', name: 'B', kind: 'daily', unit: 'percent', target: 1 },
      { type: 'missionsScored', results: [{ id: 'a', pt: 4, judgement }] },
    ]);
    expect(data.week!.status).toBe('setup');
    expect(data.week!.missions.every((m) => m.pt === null)).toBe(true);
  });

  it('stores the chosen language', () => {
    expect(run([{ type: 'setLocale', locale: 'ja' }]).locale).toBe('ja');
  });
});
