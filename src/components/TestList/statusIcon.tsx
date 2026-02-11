import { CheckCircle, XCircle, AlertTriangle, MinusCircle } from 'lucide-react'

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'broken':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'skipped':
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />
  }
}
