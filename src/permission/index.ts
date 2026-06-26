/**
 * example
 * path -> ./modules/user
 * <a-button v-if="$auth('user.add')">Button</a-button>
 * path -> ./modules/sys/user
 * <a-button v-if="$auth('sysUser.add')">Button</a-button>
 */

import type { PermissionType } from './permCode'
import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 验证权限（支持通配符匹配）
 * @param {PermissionType} perm  权限码或API路径
 * @returns {boolean} true | false
 *
 * 支持的通配符格式：
 * - *:*:* 匹配所有权限（超级管理员）
 * - device:* 匹配 device 下的所有权限
 * - device:iot:* 匹配 device:iot 下的所有权限
 *
 * 支持的API路径格式：
 * - /api/IotDevice/BatchStart -> 匹配 api:IotDevice:BatchStart
 */
export const hasPermission = (permCode: string) => {
  const permissionList = useUserStore().perms

  // 精确匹配
  if (permissionList.includes(permCode)) {
    return true
  }

  // 将权限码标准化（支持 API 路径格式）
  // /api/IotDevice/BatchStart -> api:IotDevice:BatchStart
  const normalizedPermCode = permCode
    .replace(/^\//, '')
    .replace(/\//g, ':')

  // 精确匹配标准化后的权限码
  if (permissionList.includes(normalizedPermCode)) {
    return true
  }

  // 通配符匹配
  for (const perm of permissionList) {
    // 超级管理员
    if (perm === '*:*:*' || perm === '*') {
      return true
    }
    
    // 将通配符转换为正则表达式
    // device:iot:* -> ^device:iot:[^:]*$
    // device:* -> ^device:[^:]*(:[^:]*)*$
    const regexPattern = perm
      .replace(/\./g, '\\.')
      .replace(/\*/g, '[^:]*')
    
    const regex = new RegExp(`^${regexPattern}$`)
    
    if (regex.test(normalizedPermCode)) {
      return true
    }
  }

  return false
}

const vAuth: Directive = {
  mounted(el: Element, binding: DirectiveBinding<any>) {
    const bindVal = binding.value

    if (bindVal == undefined) return

    if (!hasPermission(bindVal)) {
      el.remove()
    }
  },
}

export default {
  install(app: App) {
    app.config.globalProperties.$auth = hasPermission
    app.directive('auth', vAuth)
  },
}
