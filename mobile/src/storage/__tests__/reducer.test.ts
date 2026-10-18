import { DAY_MS, MINUTE_MS } from '@/domain/clock';
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
    expect(data.week).toEqual({
      weekStart: '2026-10-19',
      status: 'setup',
      missions: [],
      progress: {},
    });
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

describe('progress and clears', () => {
  const active = run([
    { type: 'addMission', id: 'd', name: 'Push-ups', kind: 'daily', unit: 'count', target: 20 },
    { type: 'addMission', id: 'w', name: 'Read', kind: 'weekly', unit: 'minutes', target: 300 },
    {
      type: 'missionsScored',
      results: [
        { id: 'd', pt: 4, judgement },
        { id: 'w', pt: 30, judgement },
      ],
    },
  ]);
  const record = (missionId: string, value: number, clearId = `c-${missionId}`): Action => ({
    type: 'recordProgress',
    missionId,
    value,
    clearId,
  });

  it('keeps progress below the goal without a clear', () => {
    const data = run([record('d', 12)], active);
    expect(data.week!.progress).toEqual({ 'd/2026-10-21': 12 });
    expect(data.clears).toEqual([]);
  });

  it('clears the mission and earns its points when the goal is reached', () => {
    const data = run([record('d', 12), record('d', 99)], active);
    expect(data.week!.progress['d/2026-10-21']).toBe(20);
    expect(data.clears).toEqual([
      {
        id: 'c-d',
        missionId: 'd',
        weekStart: '2026-10-19',
        date: '2026-10-21',
        pt: 4,
        clearedAt: NOW,
        progressBefore: 12,
      },
    ]);
  });

  it('cannot record before points are set', () => {
    const setup = run([
      { type: 'addMission', id: 'd', name: 'A', kind: 'daily', unit: 'count', target: 5 },
      record('d', 5),
    ]);
    expect(setup.week!.progress).toEqual({});
    expect(setup.clears).toEqual([]);
  });

  it('cannot record again once cleared today', () => {
    const data = run([record('d', 20), record('d', 3, 'again')], active);
    expect(data.week!.progress['d/2026-10-21']).toBe(20);
    expect(data.clears).toHaveLength(1);
  });

  it('starts a daily goal over the next day and keeps the weekly one', () => {
    const today = run([record('d', 20), record('w', 120)], active);
    const tomorrow = [record('d', 20, 'next'), record('w', 300)].reduce(
      (data, action) => reduce(data, action, NOW + DAY_MS),
      today,
    );
    expect(tomorrow.clears.map((c) => [c.missionId, c.date, c.progressBefore])).toEqual([
      ['d', '2026-10-21', 0],
      ['d', '2026-10-22', 0],
      ['w', '2026-10-22', 120],
    ]);
  });

  it('undoes a clear within 30 minutes, putting the points and progress back', () => {
    const cleared = run([record('w', 100), record('w', 300)], active);
    const undone = reduce(cleared, { type: 'undoClear', clearId: 'c-w' }, NOW + 30 * MINUTE_MS);
    expect(undone.clears).toEqual([]);
    expect(undone.week!.progress['w/2026-10-19']).toBe(100);
    expect(run([record('w', 300, 'again')], undone).clears).toHaveLength(1);
  });

  it('does not undo after 30 minutes', () => {
    const cleared = run([record('d', 20)], active);
    const late = reduce(cleared, { type: 'undoClear', clearId: 'c-d' }, NOW + 31 * MINUTE_MS);
    expect(late.clears).toHaveLength(1);
  });

  it('advances the clock by one day, which also ends the undo window', () => {
    const cleared = run([record('d', 20), { type: 'advanceDay' }], active);
    expect(cleared.clockOffsetMs).toBe(DAY_MS);
    const later = NOW + cleared.clockOffsetMs;
    expect(reduce(cleared, { type: 'undoClear', clearId: 'c-d' }, later).clears).toHaveLength(1);
  });
});
