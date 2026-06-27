import { request } from '@/utils/request'
import { http } from '@/api/http'

/**
 * 代码生成接口
 */
export default {
  /**
   * 自动生成各层文件
   * @param query
   * @returns
   */
  createFiles: (data: any) => {
    data.createVue = data.createVue === 1
    data.tableNames = (data.tableNames as string)?.split(',')
    return request({
      url: '/CodeFirst/GetAllFrameFilesByEntities',
      method: 'POST',
      data,
    })
  },

  /**
   * 数据库表结构修改
   * @param data 表名称集合
   * @returns
   */
  dbMigration: data => http.post(`/CodeFirst/DbMigration`, data),

  /**
   * 获取后端appsettings.json中配置的vue路径
   * @returns
   */
  getVuePath: () => http.get(`/CodeFirst/GetVuePath`),
}

// 兼容 preserveModules 目录导入：确保该模块作为目录时有 index.js 落盘
export const __codeFirstIndexMarker = true
