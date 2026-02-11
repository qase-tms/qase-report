import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestErrorProps {
  test: QaseTestResult
}

export const TestError = ({ test }: TestErrorProps) => {
  return (
    <div className="space-y-4">
      <h6 className="text-sm font-semibold">Error Details</h6>
      {test.message && (
        <p className="text-sm text-red-500">
          {test.message}
        </p>
      )}
      {test.execution.stacktrace && (
        <div className="bg-muted p-4 rounded-md max-h-[400px] overflow-auto">
          <pre className="font-mono text-sm whitespace-pre-wrap break-all m-0">
            {test.execution.stacktrace}
          </pre>
        </div>
      )}
    </div>
  )
}
