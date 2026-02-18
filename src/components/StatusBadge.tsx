import { Badge } from '@/components/ui/badge'

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'broken' | 'blocked' | 'invalid' | 'muted'

interface StatusBadgeProps {
  status: TestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={status} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
