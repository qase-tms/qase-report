import { observer } from 'mobx-react-lite'
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
    return <p className="text-muted-foreground">Select a test to view details</p>
  }

  return (
    <div className="p-4">
      {/* Sections with dividers - conditional rendering */}
      <div className="space-y-6 divide-y divide-border">
        <div className="pt-0">
          <TestHeader test={selectedTest} />
        </div>
        {selectedTest.execution.stacktrace && (
          <div className="pt-6">
            <TestError test={selectedTest} />
          </div>
        )}
        {Object.keys(selectedTest.params).length > 0 && (
          <div className="pt-6">
            <TestParams test={selectedTest} />
          </div>
        )}
        {Object.keys(selectedTest.fields).length > 0 && (
          <div className="pt-6">
            <TestFields test={selectedTest} />
          </div>
        )}
        {selectedTest.attachments && selectedTest.attachments.length > 0 && (
          <div className="pt-6">
            <TestAttachments attachments={selectedTest.attachments} />
          </div>
        )}
        {selectedTest.steps && selectedTest.steps.length > 0 && (
          <div className="pt-6">
            <TestSteps steps={selectedTest.steps} />
          </div>
        )}
      </div>
    </div>
  )
})
