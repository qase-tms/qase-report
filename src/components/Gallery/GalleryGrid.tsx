import { GalleryItem } from './GalleryItem'
import type { GalleryAttachment } from '../../types/gallery'
import type { SizeOption, ViewMode } from './GalleryFilters'
import { cn } from '../../lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface GalleryGridProps {
  attachments: GalleryAttachment[]
  size: SizeOption
  viewMode: ViewMode
}

const gridColsConfig = {
  small: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  medium: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  large: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
}

interface TestGroup {
  testId: string
  testTitle: string
  testStatus: string
  attachments: GalleryAttachment[]
}

/**
 * Group attachments by test
 */
const groupByTest = (attachments: GalleryAttachment[]): TestGroup[] => {
  const groups = new Map<string, TestGroup>()

  attachments.forEach(item => {
    if (!groups.has(item.testId)) {
      groups.set(item.testId, {
        testId: item.testId,
        testTitle: item.testTitle,
        testStatus: item.testStatus,
        attachments: [],
      })
    }
    groups.get(item.testId)!.attachments.push(item)
  })

  return Array.from(groups.values())
}

/**
 * Collapsible test group component
 */
const TestGroupSection = ({
  group,
  size,
}: {
  group: TestGroup
  size: SizeOption
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Badge variant={group.testStatus as any} className="text-xs capitalize">
          {group.testStatus}
        </Badge>
        <span className="font-medium flex-1 truncate">{group.testTitle}</span>
        <span className="text-sm text-muted-foreground">
          {group.attachments.length} file{group.attachments.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Group content */}
      {isExpanded && (
        <div className={cn('grid gap-3 p-3 pt-0', gridColsConfig[size])}>
          {group.attachments.map((attachment, index) => (
            <GalleryItem
              key={`${attachment.attachment.id}-${index}`}
              item={attachment}
              size={size}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const GalleryGrid = ({ attachments, size, viewMode }: GalleryGridProps) => {
  // Empty state
  if (attachments.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">
          No attachments match the current filters.
        </p>
      </div>
    )
  }

  // Grouped view
  if (viewMode === 'grouped') {
    const groups = groupByTest(attachments)
    return (
      <div className="space-y-4">
        {groups.map(group => (
          <TestGroupSection key={group.testId} group={group} size={size} />
        ))}
      </div>
    )
  }

  // Grid view
  return (
    <div className={cn('grid gap-4', gridColsConfig[size])}>
      {attachments.map((attachment, index) => (
        <GalleryItem
          key={`${attachment.attachment.id}-${index}`}
          item={attachment}
          size={size}
        />
      ))}
    </div>
  )
}
