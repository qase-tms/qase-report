import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { DashboardCard } from './DashboardCard'

interface SparklineCardProps {
  title: string
  data: Array<{ value: number; label?: string }>
  dataKey?: string
  color?: string
  colSpan?: number
  rowSpan?: number
  currentValue?: string | number
}

// Get computed RGB color for Recharts (SVG doesn't support CSS vars or oklch)
const useThemeColor = (fallback: string) => {
  const [color, setColor] = useState(fallback)

  useEffect(() => {
    const updateColor = () => {
      // Create a temporary element to get computed color
      const el = document.createElement('div')
      el.style.color = 'var(--primary)'
      el.style.display = 'none'
      document.body.appendChild(el)
      const computed = getComputedStyle(el).color
      document.body.removeChild(el)

      if (computed && computed !== 'rgba(0, 0, 0, 0)') {
        setColor(computed)
      }
    }
    updateColor()

    // Update on theme change
    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return color
}

export const SparklineCard = ({
  title,
  data,
  dataKey = 'value',
  color,
  colSpan = 2,
  rowSpan = 1,
  currentValue,
}: SparklineCardProps) => {
  const themeColor = useThemeColor('#3b82f6')
  const strokeColor = color || themeColor

  // Need at least 2 points to draw a line
  const hasEnoughData = data && data.length >= 2

  return (
    <DashboardCard colSpan={colSpan} rowSpan={rowSpan}>
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <p className="text-xs text-muted-foreground mb-1">
          {title}
        </p>
        {currentValue !== undefined && (
          <h4 className="text-3xl font-bold mb-2">{currentValue}</h4>
        )}
        {hasEnoughData ? (
          <div style={{ width: '100%', height: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <Tooltip
                  contentStyle={{ fontSize: '0.75rem' }}
                  cursor={false}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={strokeColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground h-[60px] flex items-center">
            Need more runs for trend
          </p>
        )}
      </div>
    </DashboardCard>
  )
}
