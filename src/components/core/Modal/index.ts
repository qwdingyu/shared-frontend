import { withInstall } from '@/utils'
// import './src/index.less'
import BasicModal from './src/BasicModal.vue'
export { BasicModal }
// export const BasicModal = withInstall(basicModal)
export { useModalContext } from './src/hooks/useModalContext'
export { useModal, useModalInner } from './src/hooks/useModal'
export * from './src/typing'

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __ModalIndexMarker = true
