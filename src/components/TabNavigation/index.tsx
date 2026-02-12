import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import {
  List,
  LayoutDashboard,
  AlertCircle,
  Images,
  ArrowLeftRight,
  Clock,
} from 'lucide-react'

export const TabNavigation = observer(() => {
  const { activeView, setActiveView } = useRootStore()

  const tabs = [
    { value: 'tests', label: 'Test cases', icon: List },
    { value: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    {
      value: 'failure-clusters',
      label: 'Failure Clusters',
      icon: AlertCircle,
    },
    { value: 'gallery', label: 'Gallery', icon: Images },
    { value: 'comparison', label: 'Comparison', icon: ArrowLeftRight },
    { value: 'timeline', label: 'Timeline', icon: Clock },
  ] as const

  return (
    <Tabs
      value={activeView}
      onValueChange={(value) =>
        setActiveView(
          value as
            | 'dashboard'
            | 'tests'
            | 'analytics'
            | 'failure-clusters'
            | 'gallery'
            | 'comparison'
            | 'timeline'
        )
      }
      className="w-full"
    >
      <TabsList variant="line" className="relative w-full justify-start h-auto p-0 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="border-none data-[state=active]:border-none"
          >
            <Icon className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
})
