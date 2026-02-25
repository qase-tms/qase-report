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
        md:grid-cols-2
        md:auto-rows-[minmax(120px,auto)]
      "
    >
      {children}
    </div>
  )
}
