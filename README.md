# @tmom/shared-frontend

TMom 前端共享库

## 使用方式

本共享库通过 TypeScript paths 别名直接引用源代码，无需构建。

### 在 web/ 项目中使用

在 `web/tsconfig.json` 中添加路径映射：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@tmom/shared-utils": ["../packages/shared-frontend/src/utils"],
      "@tmom/shared-hooks": ["../packages/shared-frontend/src/hooks"],
      "@tmom/shared-api": ["../packages/shared-frontend/src/api"],
      "@tmom/shared-components": ["../packages/shared-frontend/src/components"],
      "@tmom/shared-types": ["../packages/shared-frontend/src/types"],
      "@tmom/shared-constants": ["../packages/shared-frontend/src/constants"],
      "@tmom/shared-enums": ["../packages/shared-frontend/src/enums"],
      "@tmom/shared-store": ["../packages/shared-frontend/src/store"],
      "@tmom/shared-layout": ["../packages/shared-frontend/src/layout"],
      "@tmom/shared-locales": ["../packages/shared-frontend/src/locales"],
      "@tmom/shared-permission": ["../packages/shared-frontend/src/permission"],
      "@tmom/shared-plugins": ["../packages/shared-frontend/src/plugins"],
      "@tmom/shared-router": ["../packages/shared-frontend/src/router"]
    }
  }
}
```

在 `web/vite.config.ts` 中添加别名：

```ts
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@tmom/shared-utils": resolve(
        __dirname,
        "../packages/shared-frontend/src/utils",
      ),
      "@tmom/shared-hooks": resolve(
        __dirname,
        "../packages/shared-frontend/src/hooks",
      ),
      "@tmom/shared-api": resolve(
        __dirname,
        "../packages/shared-frontend/src/api",
      ),
      "@tmom/shared-components": resolve(
        __dirname,
        "../packages/shared-frontend/src/components",
      ),
      "@tmom/shared-types": resolve(
        __dirname,
        "../packages/shared-frontend/src/types",
      ),
      "@tmom/shared-constants": resolve(
        __dirname,
        "../packages/shared-frontend/src/constants",
      ),
      "@tmom/shared-enums": resolve(
        __dirname,
        "../packages/shared-frontend/src/enums",
      ),
      "@tmom/shared-store": resolve(
        __dirname,
        "../packages/shared-frontend/src/store",
      ),
      "@tmom/shared-layout": resolve(
        __dirname,
        "../packages/shared-frontend/src/layout",
      ),
      "@tmom/shared-locales": resolve(
        __dirname,
        "../packages/shared-frontend/src/locales",
      ),
      "@tmom/shared-permission": resolve(
        __dirname,
        "../packages/shared-frontend/src/permission",
      ),
      "@tmom/shared-plugins": resolve(
        __dirname,
        "../packages/shared-frontend/src/plugins",
      ),
      "@tmom/shared-router": resolve(
        __dirname,
        "../packages/shared-frontend/src/router",
      ),
    },
  },
});
```

### 导入示例

```ts
// 从共享库导入工具函数
import { formatDate, deepMerge } from "@tmom/shared-utils";

// 从共享库导入 Hooks
import { useWindowSizeFn, useI18n } from "@tmom/shared-hooks";

// 从共享库导入 API
import { http } from "@tmom/shared-api";

// 从共享库导入类型
import type { ApiResponse, PaginationResult } from "@tmom/shared-types";

// 从共享库导入布局组件
import { Layout } from "@tmom/shared-layout";

// 从共享库导入国际化
import { useLocale } from "@tmom/shared-locales";

// 从共享库导入权限控制
import { hasPermission } from "@tmom/shared-permission";

// 从共享库导入路由配置
import { router } from "@tmom/shared-router";
```

## 目录结构

```
packages/shared-frontend/
├── src/
│   ├── utils/        # 工具函数
│   ├── hooks/        # Vue Hooks
│   ├── api/          # API 相关
│   ├── components/   # 共享组件
│   ├── store/        # Pinia Store
│   ├── types/        # 类型定义
│   ├── constants/    # 常量
│   ├── enums/        # 枚举
│   ├── styles/       # 样式
│   ├── layout/       # 布局组件
│   ├── locales/      # 国际化
│   ├── permission/   # 权限控制
│   ├── plugins/      # 插件配置
│   ├── router/       # 路由配置
│   └── rootTypes/    # 根目录类型定义
└── README.md
```

## 共享模块说明

| 模块       | 别名                    | 说明                                 |
| ---------- | ----------------------- | ------------------------------------ |
| utils      | @tmom/shared-utils      | 通用工具函数，如日期格式化、深拷贝等 |
| hooks      | @tmom/shared-hooks      | Vue Composition API Hooks            |
| api        | @tmom/shared-api        | HTTP 请求封装、API 接口定义          |
| components | @tmom/shared-components | 共享 UI 组件                         |
| store      | @tmom/shared-store      | Pinia 状态管理                       |
| types      | @tmom/shared-types      | TypeScript 类型定义                  |
| constants  | @tmom/shared-constants  | 应用常量                             |
| enums      | @tmom/shared-enums      | 枚举定义                             |
| layout     | @tmom/shared-layout     | 页面布局组件                         |
| locales    | @tmom/shared-locales    | 国际化配置和翻译                     |
| permission | @tmom/shared-permission | 权限控制和验证                       |
| plugins    | @tmom/shared-plugins    | Vue 插件配置                         |
| router     | @tmom/shared-router     | Vue Router 路由配置                  |

## 优势

1. **无需构建**：直接引用源代码，开发体验更好
2. **实时更新**：修改共享代码后立即生效
3. **类型安全**：TypeScript 完整支持
4. **简单维护**：不需要管理构建配置和依赖版本

## 注意事项

1. 修改共享库代码后，两个项目都会受到影响
2. 建议在修改前确保两个项目都能正常编译
3. 对于项目特定的代码，请保留在各自项目的 `src/` 目录中
