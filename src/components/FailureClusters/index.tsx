import { useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Box, Typography, Paper, List } from '@mui/material'
import { useRootStore } from '../../store'
import { ClusterGroup } from './ClusterGroup'

export const FailureClusters = observer(() => {
  const { analyticsStore, selectTest, reportStore } = useRootStore()
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set())

  const handleToggle = useCallback((errorPattern: string) => {
    setExpandedClusters(prev => {
      const next = new Set(prev)
      if (next.has(errorPattern)) {
        next.delete(errorPattern)
      } else {
        next.add(errorPattern)
      }
      return next
    })
  }, [])

  const handleSelectTest = useCallback((testId: string) => {
    selectTest(testId)
  }, [selectTest])

  // No report loaded
  if (!reportStore.runData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'text.secondary',
        }}
      >
        No report loaded
      </Box>
    )
  }

  const clusters = analyticsStore.failureClusters

  // No failure clusters
  if (clusters.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Failure Clusters
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No failure clusters found. Tests with similar error messages will appear here when 2 or more tests fail with the same error pattern.
          </Typography>
        </Paper>
      </Box>
    )
  }

  // Calculate totals
  const totalTests = clusters.reduce((sum, c) => sum + c.tests.length, 0)

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Failure Clusters
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {clusters.length} cluster{clusters.length !== 1 ? 's' : ''} grouping {totalTests} failed test{totalTests !== 1 ? 's' : ''} by similar error messages
        </Typography>
      </Box>
      <List>
        {clusters.map(cluster => (
          <ClusterGroup
            key={cluster.errorPattern}
            errorPattern={cluster.errorPattern}
            tests={cluster.tests}
            isExpanded={expandedClusters.has(cluster.errorPattern)}
            onToggle={() => handleToggle(cluster.errorPattern)}
            onSelectTest={handleSelectTest}
          />
        ))}
      </List>
    </Box>
  )
})
