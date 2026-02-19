import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import type { StabilityGrade } from '../../types/stability'
import { HelpTooltip } from './HelpTooltip'

/**
 * Grade configuration for display with colors and labels.
 * Maps grades to Tailwind color classes and human-readable descriptions.
 */
const gradeConfig: Record<
  Exclude<StabilityGrade, 'N/A'>,
  { color: string; bg: string; label: string }
> = {
  'A+': { color: 'var(--grade-excellent)', bg: 'var(--grade-excellent-bg)', label: 'Excellent' },
  'A': { color: 'var(--grade-good)', bg: 'var(--grade-good-bg)', label: 'Good' },
  'B': { color: 'var(--grade-fair)', bg: 'var(--grade-fair-bg)', label: 'Fair' },
  'C': { color: 'var(--grade-warning)', bg: 'var(--grade-warning-bg)', label: 'Needs attention' },
  'D': { color: 'var(--grade-poor)', bg: 'var(--grade-poor-bg)', label: 'Poor' },
  'F': { color: 'var(--grade-critical)', bg: 'var(--grade-critical-bg)', label: 'Critical' },
}

/**
 * TestHealthWidget component displays grade distribution of tests on the dashboard.
 *
 * Shows:
 * - Overall health score (weighted average mapped to letter grade)
 * - Grade distribution with progress bars
 * - Total tests graded
 *
 * Only displays when sufficient history data exists (tests with 10+ runs).
 */
export const TestHealthWidget = observer(() => {
  const { analyticsStore } = useRootStore()
  const { gradeDistribution, testStabilityMap } = analyticsStore

  // Calculate total graded tests (exclude N/A)
  const totalGraded = Object.entries(gradeDistribution)
    .filter(([grade]) => grade !== 'N/A')
    .reduce((sum, [_, count]) => sum + count, 0)

  const helpText =
    'Grades tests by historical stability: A+ (98%+), A (95%+), B (85%+), C (75%+), D (60%+), F (<60%). Based on pass rate across last 10+ runs.'

  // Show message if insufficient test data
  if (testStabilityMap.size === 0 || totalGraded < 3) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h6 className="text-lg font-semibold">Test Health</h6>
          <HelpTooltip content={helpText} />
        </div>
        <p className="text-sm text-muted-foreground">
          Load history data (10+ runs per test) to see test health grades
        </p>
      </div>
    )
  }

  // Calculate overall health score (weighted average)
  // A+=100, A=95, B=85, C=75, D=65, F=30
  const gradeWeights: Record<Exclude<StabilityGrade, 'N/A'>, number> = {
    'A+': 100,
    'A': 95,
    'B': 85,
    'C': 75,
    'D': 65,
    'F': 30,
  }

  let weightedSum = 0
  for (const [grade, count] of Object.entries(gradeDistribution)) {
    if (grade !== 'N/A') {
      const gradeKey = grade as Exclude<StabilityGrade, 'N/A'>
      weightedSum += gradeWeights[gradeKey] * count
    }
  }

  const overallScore = Math.round(weightedSum / totalGraded)

  // Map overall score to letter grade
  const getOverallGrade = (score: number): Exclude<StabilityGrade, 'N/A'> => {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  const overallGrade = getOverallGrade(overallScore)
  const overallConfig = gradeConfig[overallGrade]

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 h-full">
      {/* Header with overall health */}
      <div className="flex justify-between items-center mb-4">
        <h6 className="text-lg font-semibold">Test Health</h6>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Overall:
          </p>
          <span
            className="px-2 py-1 rounded text-xs font-bold"
            style={{ color: overallConfig.color, backgroundColor: overallConfig.bg }}
          >
            {overallGrade} ({overallScore})
          </span>
          <HelpTooltip content={helpText} />
        </div>
      </div>

      {/* Grade distribution */}
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
        Grade Distribution
      </p>

      <div className="flex flex-col gap-3">
        {(Object.keys(gradeConfig) as Array<Exclude<StabilityGrade, 'N/A'>>).map((grade) => {
          const count = gradeDistribution[grade]
          const percentage = totalGraded > 0 ? (count / totalGraded) * 100 : 0
          const config = gradeConfig[grade]

          return (
            <div key={grade}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-1 rounded text-xs font-bold min-w-[40px] text-center"
                  style={{ color: config.color, backgroundColor: config.bg }}
                >
                  {grade}
                </span>
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded h-2">
                    <div
                      className="h-2 rounded"
                      style={{ width: `${percentage}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground min-w-[60px] text-right">
                  {count} ({percentage.toFixed(0)}%)
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total count footer */}
      <p className="text-xs text-muted-foreground mt-4">
        {totalGraded} tests graded
      </p>
    </div>
  )
})
