import { observer } from 'mobx-react-lite'
import { Stack, Divider, Typography, IconButton, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useRootStore } from '../../store'
import { TestHeader } from './TestHeader'
import { TestError } from './TestError'
import { TestParams } from './TestParams'
import { TestFields } from './TestFields'
import { TestSteps } from './TestSteps'

export const TestDetails = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  // Early return for null state
  if (!selectedTest) {
    return <Typography>Select a test to view details</Typography>
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with close button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">Test Details</Typography>
        <IconButton
          onClick={clearSelection}
          size="small"
          aria-label="close details"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Sections with dividers - conditional rendering */}
      <Stack spacing={3} divider={<Divider />}>
        <TestHeader test={selectedTest} />
        {selectedTest.execution.stacktrace && (
          <TestError test={selectedTest} />
        )}
        {Object.keys(selectedTest.params).length > 0 && (
          <TestParams test={selectedTest} />
        )}
        {Object.keys(selectedTest.fields).length > 0 && (
          <TestFields test={selectedTest} />
        )}
        {selectedTest.steps && selectedTest.steps.length > 0 && (
          <TestSteps steps={selectedTest.steps} />
        )}
      </Stack>
    </Box>
  )
})
