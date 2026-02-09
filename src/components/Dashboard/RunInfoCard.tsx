import { observer } from 'mobx-react-lite'
import { Card, CardContent, Typography } from '@mui/material'
import { useRootStore } from '../../store'

export const RunInfoCard = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData) {
    return null
  }

  const { title, environment } = reportStore.runData
  const duration = reportStore.formattedDuration

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Run Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Title
        </Typography>
        <Typography variant="body1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Environment
        </Typography>
        <Typography variant="body1" gutterBottom>
          {environment || 'Not specified'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Duration
        </Typography>
        <Typography variant="body1">{duration}</Typography>
      </CardContent>
    </Card>
  )
})
