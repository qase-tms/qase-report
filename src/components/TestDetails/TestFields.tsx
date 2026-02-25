import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestFieldsProps {
  test: QaseTestResult
}

export const TestFields = ({ test }: TestFieldsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h6 className="text-sm font-semibold">Custom Fields</h6>
      <div>
        {Object.entries(test.fields).map(([key, value]) => (
          <div key={key} className="flex gap-2 mb-2">
            <p className="text-sm font-semibold min-w-[120px]">
              {key}:
            </p>
            <p className="text-sm text-muted-foreground">
              {value ?? 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
