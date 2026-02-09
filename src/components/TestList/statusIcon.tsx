import { CheckCircle, Error, Warning, DoNotDisturb } from '@mui/icons-material'

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed':
      return <CheckCircle color="success" />
    case 'failed':
      return <Error color="error" />
    case 'broken':
      return <Warning color="warning" />
    case 'skipped':
    default:
      return <DoNotDisturb color="disabled" />
  }
}
