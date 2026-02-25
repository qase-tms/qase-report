import { useState, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Layers } from 'lucide-react'
import { useRootStore } from '../../store'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  const clusters = analyticsStore.failureClusters

  // No failure clusters
  if (clusters.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-6 w-6 text-primary" />
          <h5 className="text-xl font-semibold">Failure Clusters</h5>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No failure clusters found. Tests with similar error messages will appear here when 2 or more tests fail with the same error pattern.
          </p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalTests = clusters.reduce((sum, c) => sum + c.tests.length, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-6 w-6 text-primary" />
          <h5 className="text-xl font-semibold">Failure Clusters</h5>
        </div>
        <p className="text-sm text-muted-foreground">
          {clusters.length} cluster{clusters.length !== 1 ? 's' : ''} grouping {totalTests} failed test{totalTests !== 1 ? 's' : ''} by similar error messages
        </p>
      </div>
      <div className="space-y-2">
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
      </div>
    </div>
  )
})
