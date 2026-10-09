import { attendanceService } from '../services/attendanceService'

export function useGenerateReceipt() {
  return { generateReceipt: attendanceService.create }
}
