import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const RunInfoCard = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData) {
    return null
  }

  const { title, environment } = reportStore.runData
  const duration = reportStore.formattedDuration

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4">
        <h6 className="text-lg font-semibold mb-4">
          Run Information
        </h6>
        <p className="text-sm text-muted-foreground">
          Title
        </p>
        <p className="text-base mb-4">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">
          Environment
        </p>
        <p className="text-base mb-4">
          {environment || 'Not specified'}
        </p>
        <p className="text-sm text-muted-foreground">
          Duration
        </p>
        <p className="text-base">{duration}</p>
      </div>
    </div>
  )
})
