import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { TestHeader } from '../TestDetails/TestHeader'
import { TestError } from '../TestDetails/TestError'
import { TestSteps } from '../TestDetails/TestSteps'
import { TestAttachments } from '../TestDetails/TestAttachments'
import { TestParams } from '../TestDetails/TestParams'
import { TestFields } from '../TestDetails/TestFields'

export const ExecutionTab = observer(() => {
  const { selectedTest } = useRootStore()

  if (!selectedTest) return null

  const hasParams = Object.keys(selectedTest.params).length > 0
  const hasFields = Object.keys(selectedTest.fields).length > 0
  const hasError = !!selectedTest.execution.stacktrace
  const hasSteps = selectedTest.steps && selectedTest.steps.length > 0
  const hasAttachments = selectedTest.attachments && selectedTest.attachments.length > 0

  return (
    <div className="space-y-6">
      {/* Test Info section (from InfoTab) */}
      <div>
        <h6 className="text-sm font-semibold mb-3">Test Info</h6>
        <div className="space-y-2 text-sm">
          {selectedTest.id && (
            <div className="flex gap-2">
              <span className="text-muted-foreground min-w-[80px]">ID:</span>
              <span className="font-mono">{selectedTest.id}</span>
            </div>
          )}
          {selectedTest.signature && (
            <div className="flex gap-2">
              <span className="text-muted-foreground min-w-[80px]">Signature:</span>
              <span className="font-mono text-xs break-all">{selectedTest.signature}</span>
            </div>
          )}
          {selectedTest.testops_ids && selectedTest.testops_ids.length > 0 && (
            <div className="flex gap-2">
              <span className="text-muted-foreground min-w-[80px]">TestOps IDs:</span>
              <span>{selectedTest.testops_ids.join(', ')}</span>
            </div>
          )}
          {selectedTest.execution.thread && (
            <div className="flex gap-2">
              <span className="text-muted-foreground min-w-[80px]">Thread:</span>
              <span>{selectedTest.execution.thread}</span>
            </div>
          )}
        </div>
      </div>

      {/* Parameters */}
      {hasParams && <TestParams test={selectedTest} />}

      {/* Custom Fields */}
      {hasFields && <TestFields test={selectedTest} />}

      {/* Execution details */}
      <TestHeader test={selectedTest} />

      {selectedTest.message && (
        <div>
          <h6 className="text-sm font-semibold">Message</h6>
          <p className="text-sm text-muted-foreground mt-2">{selectedTest.message}</p>
        </div>
      )}

      {hasError && <TestError test={selectedTest} />}

      {hasAttachments && <TestAttachments attachments={selectedTest.attachments} />}

      {hasSteps && <TestSteps steps={selectedTest.steps} />}
    </div>
  )
})
