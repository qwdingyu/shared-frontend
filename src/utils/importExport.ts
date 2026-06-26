/**
 * Excel/JSON 导入导出工具函数
 */
import dayjs from 'dayjs'

// xlsx 改为懒加载，避免在应用启动时同步加载 ~416 KB
let xlsxModule: typeof import('xlsx') | null = null

async function getXLSX(): Promise<typeof import('xlsx')> {
  if (!xlsxModule) {
    xlsxModule = await import('xlsx')
  }
  return xlsxModule
}

/**
 * 导出数据为 Excel 文件
 * @param data 数据数组
 * @param columns 列配置 { field: '字段名', title: '列标题' }
 * @param fileName 文件名（不含扩展名）
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { field: keyof T; title: string }[],
  fileName: string,
): Promise<void> {
  const XLSX = await getXLSX()

  // 转换数据格式
  const exportData = data.map(item => {
    const row: Record<string, any> = {}
    columns.forEach(col => {
      row[col.title] = item[col.field]
    })
    return row
  })

  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(exportData)

  // 设置列宽
  const colWidths = columns.map(col => ({ wch: Math.max(col.title.length * 2, 15) }))
  ws['!cols'] = colWidths

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // 下载文件
  XLSX.writeFile(wb, `${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
}

/**
 * 导出数据为 JSON 文件
 * @param data 数据数组
 * @param fileName 文件名（不含扩展名）
 */
export function exportToJson<T>(data: T[], fileName: string): void {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 读取 Excel 文件
 * @param file 文件对象
 * @returns 解析后的数据数组
 */
export async function readExcelFile<T = any>(file: File): Promise<T[]> {
  const XLSX = await getXLSX()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<T>(sheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 读取 JSON 文件
 * @param file 文件对象
 * @returns 解析后的数据数组
 */
export function readJsonFile<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)
        resolve(Array.isArray(data) ? data : [data])
      } catch (error) {
        reject(new Error('JSON 格式错误'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

/**
 * 下载导入模板
 * @param columns 列配置
 * @param fileName 文件名
 * @param sampleData 示例数据（可选）
 */
export async function downloadTemplate<T extends Record<string, any>>(
  columns: { field: keyof T; title: string; example?: any }[],
  fileName: string,
  sampleData?: T[],
): Promise<void> {
  const XLSX = await getXLSX()

  let exportData: Record<string, any>[]

  if (sampleData && sampleData.length > 0) {
    // 使用示例数据
    exportData = sampleData.map(item => {
      const row: Record<string, any> = {}
      columns.forEach(col => {
        row[col.title] = item[col.field] ?? col.example ?? ''
      })
      return row
    })
  } else {
    // 只生成表头和示例行
    exportData = [
      columns.reduce(
        (row, col) => {
          row[col.title] = col.example ?? ''
          return row
        },
        {} as Record<string, any>,
      ),
    ]
  }

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '导入模板')
  XLSX.writeFile(wb, `${fileName}_导入模板.xlsx`)
}

/**
 * 数据校验结果
 */
export interface ValidationResult<T> {
  valid: T[]
  invalid: Array<{ data: T; errors: string[] }>
  totalCount: number
  validCount: number
  invalidCount: number
}

/**
 * 校验导入数据
 * @param data 待校验数据
 * @param rules 校验规则
 */
export function validateImportData<T extends Record<string, any>>(
  data: T[],
  rules: {
    field: keyof T
    required?: boolean
    validator?: (value: any, row: T) => string | null
  }[],
): ValidationResult<T> {
  const valid: T[] = []
  const invalid: Array<{ data: T; errors: string[] }> = []

  data.forEach(row => {
    const errors: string[] = []

    rules.forEach(rule => {
      const value = row[rule.field]

      // 必填校验
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${String(rule.field)} 不能为空`)
        return
      }

      // 自定义校验
      if (rule.validator && value !== undefined && value !== null && value !== '') {
        const error = rule.validator(value, row)
        if (error) {
          errors.push(error)
        }
      }
    })

    if (errors.length === 0) {
      valid.push(row)
    } else {
      invalid.push({ data: row, errors })
    }
  })

  return {
    valid,
    invalid,
    totalCount: data.length,
    validCount: valid.length,
    invalidCount: invalid.length,
  }
}
