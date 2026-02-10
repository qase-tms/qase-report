import { observer } from 'mobx-react-lite'
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Stack,
} from '@mui/material'
import { useRootStore } from '../../store'
import type { StabilityGrade } from '../../types/stability'

/**
 * Grade configuration for display with colors and labels.
 * Maps grades to MUI color schemes and human-readable descriptions.
 */
const gradeConfig: Record<
  Exclude<StabilityGrade, 'N/A'>,
  { color: 'success' | 'info' | 'warning' | 'error'; label: string }
> = {
  'A+': { color: 'success', label: 'Excellent' },
  'A': { color: 'success', label: 'Good' },
  'B': { color: 'info', label: 'Fair' },
  'C': { color: 'warning', label: 'Needs attention' },
  'D': { color: 'warning', label: 'Poor' },
  'F': { color: 'error', label: 'Critical' },
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

  // Show message if insufficient test data
  if (testStabilityMap.size === 0 || totalGraded < 3) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Test Health
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Load history data (10+ runs per test) to see test health grades
        </Typography>
      </Paper>
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
    <Paper sx={{ p: 2, height: '100%' }}>
      {/* Header with overall health */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Test Health</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overall:
          </Typography>
          <Chip
            label={`${overallGrade} (${overallScore})`}
            color={overallConfig.color}
            size="small"
          />
        </Box>
      </Box>

      {/* Grade distribution */}
      <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
        Grade Distribution
      </Typography>

      <Stack spacing={1.5}>
        {(Object.keys(gradeConfig) as Array<Exclude<StabilityGrade, 'N/A'>>).map((grade) => {
          const count = gradeDistribution[grade]
          const percentage = totalGraded > 0 ? (count / totalGraded) * 100 : 0
          const config = gradeConfig[grade]

          return (
            <Box key={grade}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={grade}
                  color={config.color}
                  size="small"
                  sx={{ minWidth: 40, fontWeight: 'bold' }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={config.color}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                  {count} ({percentage.toFixed(0)}%)
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>

      {/* Total count footer */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        {totalGraded} tests graded
      </Typography>
    </Paper>
  )
})
