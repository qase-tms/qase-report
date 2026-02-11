import { observer } from 'mobx-react-lite'
import { X } from 'lucide-react'
import { useRootStore } from '../../store'
import { TestDetails } from '../TestDetails'

export const TestDetailsModal = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  if (!selectedTest) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={clearSelection}
    >
      <div
        className="bg-card border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Title */}
        <div className="flex justify-between items-center p-4 border-b">
          <h6 className="text-lg font-semibold">
            {selectedTest.title}
          </h6>
          <button
            onClick={clearSelection}
            className="p-1 rounded-md hover:bg-accent"
            aria-label="close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="overflow-y-auto flex-1">
          <TestDetails />
        </div>
      </div>
    </div>
  )
})
