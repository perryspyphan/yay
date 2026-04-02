'use client'

import { JSX } from "react"

interface MonthlyRevenue {
  month: string
  revenue: number
}

interface Props {
  monthlyRevenue: MonthlyRevenue[]
  loading: boolean
}

function buildPolyline(pts: { x: number; y: number }[], w: number, h: number) {
  return pts.map(p => `${(p.x / 100) * w},${(p.y / 100) * h}`).join(' ')
}

function buildFill(pts: { x: number; y: number }[], w: number, h: number) {
  const line = pts.map(p => `${(p.x / 100) * w},${(p.y / 100) * h}`).join(' L ')
  const first = `${(pts[0].x / 100) * w},${h}`
  const last  = `${(pts[pts.length - 1].x / 100) * w},${h}`
  return `M ${first} L ${line} L ${last} Z`
}

function fmtRevenue(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'tr'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k'
  return String(n)
}

export const MonthlyRevenueSection = ({ monthlyRevenue, loading }: Props): JSX.Element => {
  const W = 480
  const H = 160

  const maxRev = Math.max(...monthlyRevenue.map(d => d.revenue), 1)
  const points = monthlyRevenue.map((d, i) => ({
    x: monthlyRevenue.length === 1 ? 50 : (i / (monthlyRevenue.length - 1)) * 96 + 2,
    y: 95 - (d.revenue / maxRev) * 90,
  }))
  const yLabels = [maxRev, maxRev * 0.75, maxRev * 0.5, maxRev * 0.25, 0]
    .map(v => fmtRevenue(Math.round(v)))
  const showChart = !loading && monthlyRevenue.length >= 2

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[#333B69] text-[22px] font-semibold">Doanh thu thuần</h3>
        <span className="text-[#333B69] text-[22px] font-semibold">tháng này</span>
      </div>
      <div className="bg-white rounded-[25px] px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-[160px]">
            <div className="w-8 h-8 border-4 border-[#FCAA0B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : monthlyRevenue.length === 0 ? (
          <div className="flex items-center justify-center h-[160px] text-[#718EBF] text-sm">
            Chưa có dữ liệu doanh thu
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex flex-col justify-between text-right pr-2 shrink-0" style={{ height: H }}>
              {yLabels.map((label, i) => (
                <span key={i} className="text-[#718EBF] text-[13px]">{label}</span>
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1="0" y1={t * H} x2={W} y2={t * H}
                    stroke="#DFE5EE" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                {showChart && (
                  <>
                    <path d={buildFill(points, W, H)} fill="#FCAA0B" fillOpacity="0.08" />
                    <polyline points={buildPolyline(points, W, H)}
                      fill="none" stroke="#FCAA0B" strokeWidth="3" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <circle key={i} cx={(p.x / 100) * W} cy={(p.y / 100) * H}
                        r="5" fill="white" stroke="#EDA10D" strokeWidth="3" />
                    ))}
                  </>
                )}
              </svg>
              <div className="flex justify-between">
                {monthlyRevenue.map((d) => (
                  <span key={d.month} className="text-[#718EBF] text-[13px] text-center">{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
