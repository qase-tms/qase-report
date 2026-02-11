import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const HostInfoCard = observer(() => {
  const { reportStore } = useRootStore()

  if (!reportStore.runData?.host_data) {
    return null
  }

  const { system, machine, python } = reportStore.runData.host_data

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4">
        <h6 className="text-lg font-semibold mb-4">
          Host Information
        </h6>
        <p className="text-sm text-muted-foreground">
          System
        </p>
        <p className="text-base mb-4">
          {system}
        </p>
        <p className="text-sm text-muted-foreground">
          Machine
        </p>
        <p className="text-base mb-4">
          {machine}
        </p>
        {python && (
          <>
            <p className="text-sm text-muted-foreground">
              Python
            </p>
            <p className="text-base">{python}</p>
          </>
        )}
      </div>
    </div>
  )
})
