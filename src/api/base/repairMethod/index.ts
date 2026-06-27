import { http } from '@/api/http'

export default {
  /**
   * 获取分页列表
   * @param query
   * @returns
   */
  getWithPage: (query: API.PageParams) =>
    http.get<API.TableListResult>('/RepairMethod/GetWithPage', query),

  /**
   * 根据Id获取单条
   * @param id
   * @returns
   */
  getById: (id: number) => http.get(`/RepairMethod/Get/${id}`),

  /**
   * 新增一条数据
   * @param data
   * @returns
   */
  add: (data: any) => http.post(`/RepairMethod/Add`, data),

  /**
   * 删除数据
   * @param ids 主键Ids
   * @returns
   */
  delete: (ids: number[]) => http.delete(`/RepairMethod/Delete`, { ids: ids.join(',') }),

  /**
   * 更新数据
   * @param data
   * @returns
   */
  update: (data: any) => http.put(`/RepairMethod/Update`, data),
}

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __repairMethodIndexMarker = true
