import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { TestHeader } from '../TestDetails/TestHeader'
import { TestError } from '../TestDetails/TestError'
import { TestSteps } from '../TestDetails/TestSteps'
import { TestAttachments } from '../TestDetails/TestAttachments'

export const ExecutionTab = observer(() => {
  const { selectedTest } = useRootStore()

  if (!selectedTest) return null

  const hasError = !!selectedTest.execution.stacktrace
  const hasSteps = selectedTest.steps && selectedTest.steps.length > 0
  const hasAttachments = selectedTest.attachments && selectedTest.attachments.length > 0

  return (
    <div className="space-y-6">
      <TestHeader test={selectedTest} />

      {hasError && <TestError test={selectedTest} />}

      {hasSteps && <TestSteps steps={selectedTest.steps} />}

      {hasAttachments && <TestAttachments attachments={selectedTest.attachments} />}

      {!hasError && !hasSteps && !hasAttachments && (
        <p className="text-muted-foreground">No execution details available</p>
      )}
    </div>
  )
})
