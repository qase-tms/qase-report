import { observer } from 'mobx-react-lite'
import { Card, CardContent, Typography } from '@mui/material'
import { useRootStore } from '../../store'

export const HostInfoCard = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData?.host_data) {
    return null
  }

  const { system, machine, python } = reportStore.runData.host_data

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Host Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          System
        </Typography>
        <Typography variant="body1" gutterBottom>
          {system}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Machine
        </Typography>
        <Typography variant="body1" gutterBottom>
          {machine}
        </Typography>
        {python && (
          <>
            <Typography variant="body2" color="text.secondary">
              Python
            </Typography>
            <Typography variant="body1">{python}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  )
})
