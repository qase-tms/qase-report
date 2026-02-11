import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestParamsProps {
  test: QaseTestResult
}

export const TestParams = ({ test }: TestParamsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-sm font-semibold">Parameters</h6>
      <div>
        {Object.entries(test.params).map(([key, value]) => (
          <div key={key} className="flex gap-2 mb-2">
            <p className="text-sm font-semibold min-w-[120px]">
              {key}:
            </p>
            <p className="text-sm text-muted-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
