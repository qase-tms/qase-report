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
    { value: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { value: 'tests', label: 'Test cases', icon: List },
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
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Icon className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
})
