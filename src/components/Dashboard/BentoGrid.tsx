import { ReactNode } from 'react'

interface BentoGridProps {
  children: ReactNode
}

export const BentoGrid = ({ children }: BentoGridProps) => {
  return (
    <div
      className="
        grid
        gap-4
        grid-cols-1
        md:grid-cols-4
        md:auto-rows-[minmax(120px,auto)]
        xl:grid-cols-6
        xl:auto-rows-[minmax(140px,auto)]
      "
    >
      {children}
    </div>
  )
}
