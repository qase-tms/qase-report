import { Box, Typography } from '@mui/material'
import type { Step } from '../../schemas/Step.schema'
import { TestStep } from './TestStep'

interface TestStepsProps {
  steps: Step[]
}

export const TestSteps = ({ steps }: TestStepsProps) => {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Steps
      </Typography>
      {steps.map(step => (
        <TestStep key={step.id} step={step} depth={0} />
      ))}
    </Box>
  )
}
