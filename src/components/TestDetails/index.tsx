import { observer } from 'mobx-react-lite'
import { Stack, Divider, Typography, Box } from '@mui/material'
import { useRootStore } from '../../store'
import { TestHeader } from './TestHeader'
import { TestError } from './TestError'
import { TestParams } from './TestParams'
import { TestFields } from './TestFields'
import { TestAttachments } from './TestAttachments'
import { TestSteps } from './TestSteps'

export const TestDetails = observer(() => {
  const { selectedTest } = useRootStore()

  // Early return for null state
  if (!selectedTest) {
    return <Typography>Select a test to view details</Typography>
  }

  return (
    <Box sx={{ p: 2 }}>
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
        {selectedTest.attachments && selectedTest.attachments.length > 0 && (
          <TestAttachments attachments={selectedTest.attachments} />
        )}
        {selectedTest.steps && selectedTest.steps.length > 0 && (
          <TestSteps steps={selectedTest.steps} />
        )}
      </Stack>
    </Box>
  )
})
