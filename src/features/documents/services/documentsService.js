import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import {
  attendanceService,
  subscribeAttendanceChanges,
  getAttendanceRevision,
} from '@/features/attendance'

const VIEW_PREFERENCE_STORAGE_KEY = 'sicape:documentos:view:v1'
/** Lists official attendance documents using backend search and pagination. */
export async function listDocuments(params) {
  const page = await attendanceService.list(params)
  return { ...page, items: page.items.map((record) => ({ ...record, issuedAt: record.createdAt })) }
}
export function listDocumentYears(options) {
  return attendanceService.listYears(options)
}
export function listDocumentMonths(year, options) {
  return attendanceService.listMonths(year, options)
}
export { subscribeAttendanceChanges, getAttendanceRevision }
export function readViewPreference() {
  return readJson(VIEW_PREFERENCE_STORAGE_KEY, 'grid')
}
export function saveViewPreference(view) {
  writeJson(VIEW_PREFERENCE_STORAGE_KEY, view)
}
