import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const RunDateDisplay = observer(() => {
  const root = useRootStore()

  // Return null if no run data loaded
  if (!root.reportStore.runData) {
    return null
  }

  // Extract start_time from run data
  const startTime = root.reportStore.runData.execution.start_time

  // Format using Intl.DateTimeFormat
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startTime))

  return (
    <span className="text-sm text-muted-foreground">
      {formattedDate}
    </span>
  )
})
