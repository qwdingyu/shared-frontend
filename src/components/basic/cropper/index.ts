import CropperImage from './src/Cropper.vue'
import CropperAvatar from './src/CropperAvatar.vue'

export * from './src/typing'
export { CropperImage, CropperAvatar }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __cropperIndexMarker = true
