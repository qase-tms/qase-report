import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

const formatLabel = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, c => c.toUpperCase())

export const HostInfoCard = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData?.host_data) {
    return null
  }

  const entries = Object.entries(reportStore.runData.host_data).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4">
        <h6 className="text-lg font-semibold mb-4">Host Information</h6>
        {entries.map(([key, value], index) => (
          <div key={key} className={index < entries.length - 1 ? 'mb-4' : ''}>
            <p className="text-sm text-muted-foreground">{formatLabel(key)}</p>
            <p className="text-base">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
})
