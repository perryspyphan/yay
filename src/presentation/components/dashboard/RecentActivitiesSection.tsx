'use client'

import { JSX } from "react"
import type { ActivityLog } from '@/presentation/hooks/useDashboard'

interface Props {
  activities: ActivityLog[]
  loading: boolean
}

function getActivityStyle(action: string): { iconBg: string; icon: JSX.Element } {
  const a = action.toLowerCase()
  if (a.includes('đặt hàng') || a.includes('order') || a.includes('tạo đơn')) {
    return {
      iconBg: 'bg-[#FFF5D9]',
      icon: <svg viewBox="0 0 24 24" fill="#FFBB38" className="w-5 h-5">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
      </svg>,
    }
  }
  if (a.includes('xuất kho') || a.includes('giao hàng') || a.includes('ship')) {
    return {
      iconBg: 'bg-[#FADCF0]',
      icon: <svg viewBox="0 0 24 24" fill="#C62BB1" className="w-5 h-5">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
      </svg>,
    }
  }
  if (a.includes('nhập kho') || a.includes('nhập')) {
    return {
      iconBg: 'bg-[#E7EDFF]',
      icon: <svg viewBox="0 0 24 24" fill="#396AFF" className="w-5 h-5">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4.99c0 1.1-.9 2-2.01 2s-2.01-.9-2.01-2H5V5h14v9z"/>
      </svg>,
    }
  }
  if (a.includes('thanh toán') || a.includes('thu') || a.includes('chi')) {
    return {
      iconBg: 'bg-[#DCFAF8]',
      icon: <svg viewBox="0 0 24 24" fill="#16DBCC" className="w-5 h-5">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
      </svg>,
    }
  }
  if (a.includes('hủy') || a.includes('cancel')) {
    return {
      iconBg: 'bg-[#FFE0EB]',
      icon: <svg viewBox="0 0 24 24" fill="#FF82AC" className="w-5 h-5">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
      </svg>,
    }
  }
  return {
    iconBg: 'bg-[#F0F0F0]',
    icon: <svg viewBox="0 0 24 24" fill="#94A3B8" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>,
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'vừa xong'
  if (mins  < 60) return `${mins} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

export const RecentActivitiesSection = ({ activities, loading }: Props): JSX.Element => {
  return (
    <div>
      <h3 className="text-[#343C6A] text-[22px] font-semibold mb-3">Các hoạt động gần đây</h3>
      <div className="bg-white rounded-[25px] p-5 flex flex-col gap-4" style={{ minHeight: 280 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-[#718EBF] text-sm">
            Chưa có hoạt động nào
          </div>
        ) : (
          activities.map((activity) => {
            const { iconBg, icon } = getActivityStyle(activity.action)
            const label = activity.note ? `${activity.action} — ${activity.note}` : activity.action
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`${iconBg} w-11 h-11 rounded-full flex items-center justify-center shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-black text-sm font-medium truncate">{label}</p>
                  <p className="text-[#718EBF] text-xs">{timeAgo(activity.created_at)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
