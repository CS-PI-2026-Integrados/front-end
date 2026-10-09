import { z } from 'zod'
import { apiService } from '@/shared/infrastructure/http/apiService'
import { parseApiResponse } from '@/shared/infrastructure/http/apiContracts'

export { subscribeAttendanceChanges, getAttendanceRevision } from '@/features/attendance'

const count = z.number().int().nonnegative()
const timestamp = z.iso.datetime({ offset: true })
const convictedMetricsSchema = z.object({
  total: count,
  active: count,
  inactive: count,
  with_recent_attendance: count,
  without_recent_attendance: count,
  calculated_at: timestamp,
})
const attendanceMetricsSchema = z.object({
  last_7_days: count,
  monthly_counts: z
    .array(z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), count }))
    .length(6),
  recent_activities: z
    .array(
      z.object({
        id: z.guid(),
        convicted_id: z.guid(),
        convicted_name: z.string(),
        created_at: timestamp,
      })
    )
    .max(4),
  calculated_at: timestamp,
})

export const dashboardService = {
  async getConvictedMetrics(options) {
    const data = parseApiResponse(
      convictedMetricsSchema,
      await apiService.get('/convicted/metrics', options)
    )
    return {
      total: data.total,
      active: data.active,
      inactive: data.inactive,
      withRecentAttendance: data.with_recent_attendance,
      withoutRecentAttendance: data.without_recent_attendance,
      calculatedAt: data.calculated_at,
    }
  },
  async getAttendanceMetrics(options) {
    const data = parseApiResponse(
      attendanceMetricsSchema,
      await apiService.get('/attendance/metrics', options)
    )
    return {
      last7Days: data.last_7_days,
      monthlyCounts: data.monthly_counts,
      recentActivities: data.recent_activities.map((item) => ({
        id: item.id,
        convictedId: item.convicted_id,
        convictedName: item.convicted_name,
        createdAt: item.created_at,
      })),
      calculatedAt: data.calculated_at,
    }
  },
}
