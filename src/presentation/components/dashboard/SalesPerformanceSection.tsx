'use client'

import { JSX } from "react"

interface TopProduct {
  code: string
  name: string
  totalSold: number
}

interface Props {
  topProducts: TopProduct[]
  loading: boolean
}

const gridLabels = ['0', '25%', '50%', '75%', '100%']

export const SalesPerformanceSection = ({ topProducts, loading }: Props): JSX.Element => {
  const maxValue = Math.max(...topProducts.map(p => p.totalSold), 1)
  const skeletonRows = Array.from({ length: 5 })

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[#333B69] text-[22px] font-semibold">Top mặt hàng bán chạy</h3>
        <span className="text-[#333B69] text-[22px] font-semibold">tháng này</span>
      </div>

      <div className="bg-white rounded-[25px] p-6">
        <div className="flex justify-between pl-[120px] pr-4 mb-2">
          {gridLabels.map(label => (
            <span key={label} className="text-[rgba(42,51,81,0.42)] text-xs">{label}</span>
          ))}
        </div>

        <div className="flex flex-col gap-0">
          {loading
            ? skeletonRows.map((_, i) => (
                <div key={i} className="flex items-center h-16">
                  <div className="w-[116px] pr-3 text-right shrink-0">
                    <div className="h-3 bg-gray-100 rounded ml-auto w-20 animate-pulse" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-6 bg-gray-100 rounded animate-pulse" style={{ width: `${30 + i * 15}%` }} />
                  </div>
                </div>
              ))
            : topProducts.length === 0
            ? (
                <div className="flex items-center justify-center h-24 text-[#718EBF] text-sm">
                  Chưa có dữ liệu bán hàng
                </div>
              )
            : topProducts.map((item) => {
                const widthPct = (item.totalSold / maxValue) * 100
                const label = item.name.length > 18 ? item.name.slice(0, 16) + '…' : item.name
                return (
                  <div key={item.code} className="flex items-center h-16 relative">
                    <div className="absolute inset-0 pl-[120px] pr-4 flex justify-between pointer-events-none">
                      {gridLabels.map((_, i) => (
                        <div key={i} className="w-px h-full bg-[rgba(53,82,151,0.1)]" />
                      ))}
                    </div>
                    <div className="w-[116px] pr-3 text-right shrink-0 z-10">
                      <span className="text-[rgba(37,43,65,0.64)] text-xs leading-tight">{label}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2 z-10">
                      <div
                        className="h-6 bg-[#1AA367] rounded transition-all duration-700"
                        style={{ width: `${widthPct}%`, minWidth: widthPct > 0 ? 4 : 0 }}
                      />
                      <span className="text-[rgba(37,43,65,0.64)] text-[10px] font-medium whitespace-nowrap">
                        {item.totalSold.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
