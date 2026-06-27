import { http } from '@/api/http'

export default {
  /**
   * 获取分页列表
   * @param query
   * @returns
   */
  getWithPage: (query: API.PageParams) =>
    http.get<API.TableListResult>('/PartGroup/GetWithPage', query),

  /**
   * 根据Id获取单条
   * @param id
   * @returns
   */
  getById: (id: number) => http.get(`/PartGroup/Get/${id}`),

  /**
   * 新增一条数据
   * @param data
   * @returns
   */
  add: (data: any) => http.post(`/PartGroup/Add`, data),

  /**
   * 删除数据
   * @param ids 主键Ids
   * @returns
   */
  delete: (ids: number[]) => http.delete(`/PartGroup/Delete`, { ids: ids.join(',') }),

  /**
   * 更新数据
   * @param data
   * @returns
   */
  update: (data: any) => http.put(`/PartGroup/Update`, data),

  /**
   * 根据分类获取主数据群组
   * @param type 分类
   * @returns
   */
  getListByType: (type: string) => http.get<any[]>(`/PartGroup/GetListByType?type=${type}`),
}

// 确保该入口模块在 preserveModules 输出中落盘，避免消费方把目录当成文件导入
export const __partGroupIndexMarker = true
