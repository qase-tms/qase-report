import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { TestParams } from '../TestDetails/TestParams'
import { TestFields } from '../TestDetails/TestFields'
import { TestAttachments } from '../TestDetails/TestAttachments'

export const InfoTab = observer(() => {
  const { selectedTest } = useRootStore()

  if (!selectedTest) return null

  const hasParams = Object.keys(selectedTest.params).length > 0
  const hasFields = Object.keys(selectedTest.fields).length > 0
  const hasAttachments = selectedTest.attachments && selectedTest.attachments.length > 0

  return (
    <div className="space-y-6">
      {/* Test Metadata */}
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
          {selectedTest.testops_id && (
            <div className="flex gap-2">
              <span className="text-muted-foreground min-w-[80px]">TestOps ID:</span>
              <span>{selectedTest.testops_id}</span>
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

      {hasParams && <TestParams test={selectedTest} />}

      {hasFields && <TestFields test={selectedTest} />}

      {hasAttachments && <TestAttachments attachments={selectedTest.attachments} />}

      {!hasParams && !hasFields && !hasAttachments && !selectedTest.signature && (
        <p className="text-muted-foreground">No additional info available</p>
      )}
    </div>
  )
})
