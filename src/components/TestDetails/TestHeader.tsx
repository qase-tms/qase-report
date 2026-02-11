import { getStatusIcon } from '../TestList/statusIcon'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestHeaderProps {
  test: QaseTestResult
}

export const TestHeader = ({ test }: TestHeaderProps) => {
  const duration = test.execution.duration
  const formattedDuration =
    duration >= 1000
      ? `${(duration / 1000).toFixed(1)}s`
      : `${duration}ms`

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1">
        {getStatusIcon(test.execution.status)}
        <span className="text-sm text-muted-foreground">
          {test.execution.status}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        Duration: {formattedDuration}
      </span>
      {test.muted && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          Muted
        </span>
      )}
    </div>
  )
}
