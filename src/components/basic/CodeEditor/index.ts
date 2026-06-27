import CodeEditor from './src/CodeEditor.vue'
import JsonPreview from './src/json-preview/JsonPreview.vue'

export { CodeEditor, JsonPreview }

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __CodeEditorIndexMarker = true
