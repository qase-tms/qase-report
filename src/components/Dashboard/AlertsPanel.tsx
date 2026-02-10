import { observer } from 'mobx-react-lite'
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Box,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import SpeedIcon from '@mui/icons-material/Speed'
import LoopIcon from '@mui/icons-material/Loop'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import { useRootStore } from '../../store'
import type { AlertItem, AlertType } from '../../types/alerts'

interface AlertsPanelProps {
  /** Callback when alert is clicked - receives test signature for navigation */
  onAlertClick: (testSignature: string) => void
}

/**
 * Returns icon component based on alert type
 */
const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'performance_regression':
      return <SpeedIcon color="error" />
    case 'flaky_warning':
      return <LoopIcon color="warning" />
    case 'new_failure':
      return <NewReleasesIcon color="error" />
  }
}

/**
 * Returns badge label based on alert type
 */
const getAlertBadge = (type: AlertType) => {
  switch (type) {
    case 'performance_regression':
      return { label: 'Regression', color: 'error' as const }
    case 'flaky_warning':
      return { label: 'Flaky', color: 'warning' as const }
    case 'new_failure':
      return { label: 'New Failure', color: 'error' as const }
  }
}

export const AlertsPanel = observer(({ onAlertClick }: AlertsPanelProps) => {
  const { analyticsStore } = useRootStore()
  const { alerts } = analyticsStore

  // Don't render panel if no alerts
  if (alerts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon color="warning" />
            <Typography variant="h6">Alerts</Typography>
            <Chip
              label={alerts.length}
              size="small"
              color={alerts.some(a => a.severity === 'error') ? 'error' : 'warning'}
            />
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <List dense disablePadding>
          {alerts.slice(0, 10).map((alert) => {
            const badge = getAlertBadge(alert.type)
            return (
              <ListItem key={alert.id} disablePadding>
                <ListItemButton
                  onClick={() => onAlertClick(alert.testSignature)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getAlertIcon(alert.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200,
                          }}
                        >
                          {alert.testTitle}
                        </Typography>
                        <Chip
                          label={badge.label}
                          color={badge.color}
                          size="small"
                          sx={{ height: 18, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={alert.message}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { color: 'text.secondary' },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
        {alerts.length > 10 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            +{alerts.length - 10} more alerts
          </Typography>
        )}
      </CardContent>
    </Card>
  )
})
