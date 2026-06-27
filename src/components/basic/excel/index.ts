import impExcel from './src/ImportExcel.vue'
import { withInstall } from '@/utils'
export { useExportExcelModal } from './src/ExportExcelModal'

export const ImpExcel = withInstall(impExcel)
// export const ExpExcelModal = withInstall(expExcelModal);
export * from './src/typing'
export * from './src/Export2Excel'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __excelIndexMarker = true
