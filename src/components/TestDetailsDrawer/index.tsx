import { observer } from 'mobx-react-lite'
import { useRootStore } from '@/store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { ExecutionTab } from './ExecutionTab'
import { RunHistoryTab } from './RunHistoryTab'
import { RetriesTab } from './RetriesTab'
import { useResizable } from '@/hooks/useResizable'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export const TestDetailsDrawer = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()
  const { width, isResizing, startResizing } = useResizable({
    initialWidth: 700,
    minWidth: 400,
    maxWidth: 1200,
    direction: 'left',
  })

  if (!selectedTest) return null

  return (
    <Sheet open={true} onOpenChange={() => clearSelection()}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 overflow-hidden"
        style={{ width: `${width}px`, maxWidth: 'none' }}
      >
        {/* Resize handle - wider hit area for easier grabbing */}
        <div
          onMouseDown={startResizing}
          className={cn(
            'absolute left-0 top-0 bottom-0 w-3 cursor-col-resize z-50 flex items-center justify-center hover:bg-primary/20 transition-colors',
            isResizing && 'bg-primary/30'
          )}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity" />
        </div>

        {/* Content wrapper with left padding for resize handle */}
        <div className="flex flex-col flex-1 min-h-0 pl-3">
          <SheetHeader className="shrink-0">
            <SheetTitle className="truncate pr-8">{selectedTest.title}</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="execution" className="flex-1 flex flex-col min-h-0 mt-4">
            <TabsList variant="line" className="relative w-full justify-start h-auto p-0 shrink-0 px-4 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
              <TabsTrigger
                value="execution"
                className="border-none data-[state=active]:border-none"
              >
                Execution
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="border-none data-[state=active]:border-none"
              >
                Run History
              </TabsTrigger>
              <TabsTrigger
                value="retries"
                className="border-none data-[state=active]:border-none"
              >
                Retries
              </TabsTrigger>
            </TabsList>

            {/* Tab content area - fixed height, scrollable */}
            <div className="flex-1 min-h-0 relative">
              <TabsContent value="execution" className="absolute inset-0 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden">
                <ExecutionTab />
              </TabsContent>

              <TabsContent value="history" className="absolute inset-0 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden">
                <RunHistoryTab />
              </TabsContent>

              <TabsContent value="retries" className="absolute inset-0 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden">
                <RetriesTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
})
