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
            {/* Placeholder - will add ExecutionTab in Plan 02 */}
            <p className="text-muted-foreground">Execution content</p>
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-y-auto p-4">
            {/* Placeholder - will add InfoTab in Plan 02 */}
            <p className="text-muted-foreground">Info content</p>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-4">
            {/* Placeholder - will add RunHistoryTab in Plan 02 */}
            <p className="text-muted-foreground">Run History content</p>
          </TabsContent>

          <TabsContent value="retries" className="flex-1 overflow-y-auto p-4">
            {/* Placeholder - will add RetriesTab in Plan 02 */}
            <p className="text-muted-foreground">Retries content</p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
})
