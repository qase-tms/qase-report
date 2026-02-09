import { observer } from 'mobx-react-lite'
import { Grid, Typography } from '@mui/material'
import { useRootStore } from '../../store'
import { StatsCard } from './StatsCard'
import { RunInfoCard } from './RunInfoCard'
import { HostInfoCard } from './HostInfoCard'

export const Dashboard = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData) {
    return (
      <Typography variant="body1" color="text.secondary">
        Load a report to view dashboard
      </Typography>
    )
  }

  const { stats } = reportStore.runData

  return (
    <Grid container spacing={3}>
      {/* Statistics cards - 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          status="passed"
          count={stats.passed}
          percentage={reportStore.passRate}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          status="failed"
          count={stats.failed}
          percentage={reportStore.failedRate}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          status="skipped"
          count={stats.skipped}
          percentage={reportStore.skippedRate}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          status="broken"
          count={stats.broken}
          percentage={reportStore.brokenRate}
        />
      </Grid>

      {/* Metadata cards - 2 columns on desktop, 1 on mobile */}
      <Grid item xs={12} md={6}>
        <RunInfoCard />
      </Grid>
      <Grid item xs={12} md={6}>
        <HostInfoCard />
      </Grid>
    </Grid>
  )
})
