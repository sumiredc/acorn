export type MissionKind = 'daily' | 'weekly';
export type Locale = 'en' | 'ja';

export type Judgement = {
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};

export type Reward = {
  id: string;
  name: string;
  pt: number;
  mode: 'price' | 'period';
  judgement: Judgement;
  status: 'available' | 'redeemed';
  createdAt: number;
  redeemedAt?: number;
};

export type Mission = {
  id: string;
  name: string;
  kind: MissionKind;
  // null until Jev has scored it this week.
  pt: number | null;
  judgement: Judgement | null;
};

export type Week = {
  // Monday of the week, local time, "YYYY-MM-DD".
  weekStart: string;
  status: 'setup' | 'scoring' | 'active';
  missions: Mission[];
};

export type Clear = {
  id: string;
  missionId: string;
  weekStart: string;
  date: string;
  pt: number;
  // App time (real time + demo offset).
  clearedAt: number;
};

export type AcornData = {
  version: 1;
  budgetUsd: number | null;
  clockOffsetMs: number;
  rewards: Reward[];
  week: Week | null;
  previousMissions: Mission[];
  clears: Clear[];
  // null follows the device language.
  locale: Locale | null;
};

export const initialData: AcornData = {
  version: 1,
  budgetUsd: null,
  clockOffsetMs: 0,
  rewards: [],
  week: null,
  previousMissions: [],
  clears: [],
  locale: null,
};
