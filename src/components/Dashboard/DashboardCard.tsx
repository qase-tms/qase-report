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
  return (
    <div
      className="
        col-span-1
        row-span-1
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        md:col-span-[var(--col-span-md)]
        md:row-span-[var(--row-span)]
        xl:col-span-[var(--col-span-xl)]
        xl:row-span-[var(--row-span)]
      "
      style={{
        '--col-span-md': Math.min(colSpan, 4),
        '--col-span-xl': colSpan,
        '--row-span': rowSpan,
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
