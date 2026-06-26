import dayjs from 'dayjs'

/**
 * 全局时间格式化 Composable
 * 统一处理日期时间显示格式
 */

/**
 * 格式化日期时间为标准格式 YYYY-MM-DD HH:mm:ss
 * @param dateStr 日期字符串、数字或 Date 对象
 * @param format 格式化字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的字符串
 */
export function useFormatDate() {
  /**
   * 通用日期时间格式化
   */
  const formatDateTime = (
    dateStr: string | number | Date | undefined | null,
    format: string = 'YYYY-MM-DD HH:mm:ss'
  ): string => {
    if (!dateStr) return '-'
    try {
      const d = dayjs(dateStr)
      if (!d.isValid()) return '-'
      return d.format(format)
    } catch {
      return '-'
    }
  }

  /**
   * 格式化日期（不含时间）YYYY-MM-DD
   */
  const formatDate = (dateStr: string | number | Date | undefined | null): string => {
    return formatDateTime(dateStr, 'YYYY-MM-DD')
  }

  /**
   * 格式化时间（不含日期）HH:mm:ss
   */
  const formatTime = (dateStr: string | number | Date | undefined | null): string => {
    return formatDateTime(dateStr, 'HH:mm:ss')
  }

  /**
   * 格式化日期时间（短格式）MM-DD HH:mm:ss
   */
  const formatDateTimeShort = (dateStr: string | number | Date | undefined | null): string => {
    return formatDateTime(dateStr, 'MM-DD HH:mm:ss')
  }

  /**
   * 格式化日期时间（紧凑格式）YYYYMMDD_HHmmss
   */
  const formatDateTimeCompact = (dateStr: string | number | Date | undefined | null): string => {
    return formatDateTime(dateStr, 'YYYYMMDD_HHmmss')
  }

  /**
   * 相对时间（多少分钟/小时前）
   */
  const formatRelative = (dateStr: string | number | Date | undefined | null): string => {
    if (!dateStr) return '-'
    try {
      const d = dayjs(dateStr)
      if (!d.isValid()) return '-'
      const now = dayjs()
      const diffMs = now.diff(d)
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMinutes < 1) return '刚刚'
      if (diffMinutes < 60) return `${diffMinutes}分钟前`
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 30) return `${diffDays}天前`
      return d.format('YYYY-MM-DD')
    } catch {
      return '-'
    }
  }

  return {
    formatDateTime,
    formatDate,
    formatTime,
    formatDateTimeShort,
    formatDateTimeCompact,
    formatRelative
  }
}

/**
 * 导出默认格式化函数，方便直接使用
 */
export const formatDateTime = (dateStr: any, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const { formatDateTime } = useFormatDate()
  return formatDateTime(dateStr, format)
}

export const formatDate = (dateStr: any): string => {
  const { formatDate } = useFormatDate()
  return formatDate(dateStr)
}

export const formatTime = (dateStr: any): string => {
  const { formatTime } = useFormatDate()
  return formatTime(dateStr)
}

export const formatDateTimeShort = (dateStr: any): string => {
  const { formatDateTimeShort } = useFormatDate()
  return formatDateTimeShort(dateStr)
}

export const formatDateTimeCompact = (dateStr: any): string => {
  const { formatDateTimeCompact } = useFormatDate()
  return formatDateTimeCompact(dateStr)
}

export const formatRelative = (dateStr: any): string => {
  const { formatRelative } = useFormatDate()
  return formatRelative(dateStr)
}
