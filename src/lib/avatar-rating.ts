export type AvatarStats = {
  speed: number;
  awareness: number;
  consistency: number;
  overtaking: number;
  racecraft: number;
};

export type CoreAvatarStats = {
  pace: number;
  awareness: number;
  racecraft: number;
  tyreManagement: number;
};

const STAT_MIN = 40;
const STAT_MAX = 99;
const STAT_BUDGET = 360;

export function clampStat(value: number) {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
}

export function normalizeStats(rawStats: AvatarStats): AvatarStats {
  return {
    speed: clampStat(rawStats.speed),
    awareness: clampStat(rawStats.awareness),
    consistency: clampStat(rawStats.consistency),
    overtaking: clampStat(rawStats.overtaking),
    racecraft: clampStat(rawStats.racecraft),
  };
}

export function getTotalStats(stats: AvatarStats) {
  return (
    stats.speed +
    stats.awareness +
    stats.consistency +
    stats.overtaking +
    stats.racecraft
  );
}

export function enforceStatsBudget(stats: AvatarStats): AvatarStats {
  const adjusted = normalizeStats(stats);

  let total = getTotalStats(adjusted);
  while (total > STAT_BUDGET) {
    const entries = [
      ["speed", adjusted.speed],
      ["awareness", adjusted.awareness],
      ["consistency", adjusted.consistency],
      ["overtaking", adjusted.overtaking],
      ["racecraft", adjusted.racecraft],
    ] as const;

    const reducible = entries
      .filter(([, value]) => value > STAT_MIN)
      .sort((a, b) => b[1] - a[1]);

    if (reducible.length === 0) break;

    const [key] = reducible[0];
    adjusted[key] -= 1;
    total -= 1;
  }

  return adjusted;
}

export function calculateRating(stats: AvatarStats) {
  const normalized = normalizeStats(stats);
  const total = getTotalStats(normalized);
  const budgetPenalty = Math.max(0, total - STAT_BUDGET);

  const weightedScore =
    normalized.speed * 1.3 +
    normalized.awareness * 1.2 +
    normalized.consistency * 1.15 +
    normalized.overtaking * 1.1 +
    normalized.racecraft * 1.25;

  const balancePenalty =
    Math.abs(normalized.speed - normalized.awareness) * 0.18 +
    Math.abs(normalized.consistency - normalized.overtaking) * 0.14;

  const raw = weightedScore / 6 - budgetPenalty * 0.95 - balancePenalty;
  const capped = Math.round(Math.max(1, Math.min(99, raw)));

  return {
    normalized,
    total,
    rating: capped,
    budgetPenalty,
  };
}

export function calculateRatingFromCore(core: CoreAvatarStats) {
  const pace = clampStat(core.pace);
  const awareness = clampStat(core.awareness);
  const racecraft = clampStat(core.racecraft);
  const tyreManagement = clampStat(core.tyreManagement);

  const total = pace + awareness + racecraft + tyreManagement;
  const budgetPenalty = Math.max(0, total - STAT_BUDGET);

  const weightedScore =
    pace * 1.35 + awareness * 1.2 + racecraft * 1.25 + tyreManagement * 1.2;

  const tradeoffPenalty =
    Math.abs(pace - awareness) * 0.16 +
    Math.abs(racecraft - tyreManagement) * 0.16;

  const raw = weightedScore / 5 - budgetPenalty * 0.95 - tradeoffPenalty;
  const rating = Math.round(Math.max(1, Math.min(99, raw)));

  return {
    rating,
    normalizedCore: { pace, awareness, racecraft, tyreManagement },
  };
}

export function buildFullStatsFromCore(core: CoreAvatarStats): AvatarStats {
  const pace = clampStat(core.pace);
  const awareness = clampStat(core.awareness);
  const racecraft = clampStat(core.racecraft);
  const tyreManagement = clampStat(core.tyreManagement);

  return {
    speed: pace,
    awareness,
    racecraft,
    consistency: tyreManagement,
    // Kept for legacy DB compatibility; not used in profile logic.
    overtaking: clampStat(Math.round((pace + racecraft) / 2)),
  };
}

export const avatarRules = {
  min: STAT_MIN,
  max: STAT_MAX,
  budget: STAT_BUDGET,
};
