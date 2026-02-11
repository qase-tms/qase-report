import { TrendingUp, TrendingDown, Plus, Minus, Gauge } from 'lucide-react'
import type { ComparisonResult } from '../../types/comparison'

interface ComparisonSummaryProps {
  comparison: ComparisonResult
}

export const ComparisonSummary = ({ comparison }: ComparisonSummaryProps) => {
  const { summary, baseRun, compareRun } = comparison

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
      <p className="text-sm text-muted-foreground mb-2">
        Comparing {formatDate(baseRun.start_time)} to {formatDate(compareRun.start_time)}
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {summary.regressionCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground">
            <TrendingUp className="h-3 w-3" />
            {summary.regressionCount} regression{summary.regressionCount !== 1 ? 's' : ''}
          </span>
        )}
        {summary.fixedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500 text-white">
            <TrendingDown className="h-3 w-3" />
            {summary.fixedCount} fixed
          </span>
        )}
        {summary.addedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-500 text-white">
            <Plus className="h-3 w-3" />
            {summary.addedCount} added
          </span>
        )}
        {summary.removedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500 text-white">
            <Minus className="h-3 w-3" />
            {summary.removedCount} removed
          </span>
        )}
        {summary.durationChangedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
            <Gauge className="h-3 w-3" />
            {summary.durationChangedCount} duration change{summary.durationChangedCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="inline-flex items-center px-2 py-1 rounded text-xs border border-border">
          {comparison.diff.unchangedCount} unchanged
        </span>
      </div>
    </div>
  )
}
