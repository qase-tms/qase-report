import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestFieldsProps {
 test: QaseTestResult
}

export const TestFields = ({ test }: TestFieldsProps) => {
 return (
 <div className="space-y-2">
 <p>Custom Fields</p>
 <div>
 {Object.entries(test.fields).map(([key, value]) => (
 <div key={key}>
 <p className="text-sm">
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
