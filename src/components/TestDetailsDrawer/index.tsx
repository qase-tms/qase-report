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
import { InfoTab } from './InfoTab'
import { RunHistoryTab } from './RunHistoryTab'
import { RetriesTab } from './RetriesTab'

export const TestDetailsDrawer = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  if (!selectedTest) return null

  return (
    <Sheet open={true} onOpenChange={() => clearSelection()}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="truncate pr-8">{selectedTest.title}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="execution" className="flex-1 flex flex-col mt-4">
          <TabsList>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="history">Run History</TabsTrigger>
            <TabsTrigger value="retries">Retries</TabsTrigger>
          </TabsList>

          <TabsContent value="execution" className="flex-1 overflow-y-auto p-4">
            <ExecutionTab />
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-y-auto p-4">
            <InfoTab />
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-4">
            <RunHistoryTab />
          </TabsContent>

          <TabsContent value="retries" className="flex-1 overflow-y-auto p-4">
            <RetriesTab />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
})
