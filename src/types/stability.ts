/**
 * Minimum number of runs required for accurate stability scoring.
 * Higher than flakiness MIN_RUNS (5) because stability considers more factors:
 * - Pass rate requires sufficient samples
 * - Duration CV needs statistical validity
 * - Multi-factor weighting demands more data points
 */
export const MIN_RUNS_STABILITY = 10

/**
 * Stability grade categories (A+ to F scale).
 * - A+: Exceptional stability (95-100 score)
 * - A: Excellent stability (90-94)
 * - B: Good stability (80-89)
 * - C: Fair stability (70-79)
 * - D: Poor stability (60-69)
 * - F: Failing stability (<60)
 * - N/A: Insufficient data (<10 runs)
 */
export type StabilityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A'

/**
 * Grade thresholds mapping scores (0-100) to letter grades.
 * Used for consistent grade assignment across the application.
 */
export const GRADE_THRESHOLDS = {
  'A+': 95,
  'A': 90,
  'B': 80,
  'C': 70,
  'D': 60,
  'F': 0,
} as const

/**
 * Comprehensive stability assessment for a single test.
 *
 * Scoring formula (weighted composite):
 * score = passRate * 0.5 + (100 - flakinessPercent) * 0.3 + (100 - durationCV) * 0.2
 *
 * Where:
 * - passRate (50% weight): Percentage of runs that passed
 * - flakinessPercent (30% weight): From getFlakinessScore - measures status transitions
 * - durationCV (20% weight): Coefficient of Variation (stdDev/mean * 100) - measures duration consistency
 *
 * Duration CV measures performance consistency:
 * - 0% = perfectly consistent (all runs same duration)
 * - Higher % = more variance (unstable performance)
 * - Capped at 100% for scoring (extreme variance doesn't infinitely penalize)
 */
export interface StabilityResult {
  /** Letter grade (A+ to F, or N/A if insufficient data) */
  grade: StabilityGrade
  /** Composite stability score (0-100) */
  score: number
  /** Pass rate percentage (0-100) */
  passRate: number
  /** Flakiness percentage from getFlakinessScore (0-100) */
  flakinessPercent: number
  /** Duration coefficient of variation (0-100+, capped at 100 for scoring) */
  durationCV: number
  /** Total runs analyzed */
  totalRuns: number
  /** Minimum runs required for scoring (10) */
  minRunsRequired: number
}
