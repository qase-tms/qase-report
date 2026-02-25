import { ReactNode } from 'react'

interface DashboardCardProps {
  colSpan?: number
  rowSpan?: number
  children: ReactNode
}

export const DashboardCard = ({
  colSpan = 1,
  rowSpan = 1,
  children,
}: DashboardCardProps) => {
  // Map colSpan to Tailwind classes for 2-column grid
  const colSpanClass = colSpan >= 2 ? 'md:col-span-2' : 'md:col-span-1'
  const rowSpanClass =
    rowSpan === 2
      ? 'md:row-span-2'
      : rowSpan === 3
        ? 'md:row-span-3'
        : 'md:row-span-1'

  return (
    <div
      className={`
        col-span-1
        row-span-1
        h-full
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        ${colSpanClass}
        ${rowSpanClass}
      `}
    >
      {children}
    </div>
  )
}
