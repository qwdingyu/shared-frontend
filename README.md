# @usethink/shared-frontend

`@usethink/shared-frontend` 是一个独立发布的 Vue 3 前端共享库，提供工具函数、Hooks、API 封装、组件、类型定义、样式和业务能力。

## 安装

```bash
pnpm add @usethink/shared-frontend
```

## 使用

```ts
import { formatDate, deepMerge } from '@usethink/shared-frontend/utils'
import { useWindowSizeFn } from '@usethink/shared-frontend/hooks'
import { http } from '@usethink/shared-frontend/api'
import type { ApiResponse, PaginationResult } from '@usethink/shared-frontend/types'
import { Layout } from '@usethink/shared-frontend/components'
```

## 开发

```bash
pnpm install
pnpm dev
pnpm typecheck
```

## 构建

```bash
pnpm build
```

## 发布

```bash
NPM_TOKEN=npm_xxx pnpm run publish
```

## 目录结构

```
src/
├── utils/        # 工具函数
├── hooks/        # Vue Composition API Hooks
├── api/          # HTTP 请求封装、API 接口定义
├── components/   # 共享 UI 组件
├── store/        # Pinia Store
├── types/        # TypeScript 类型定义
├── constants/    # 常量
├── enums/        # 枚举定义
├── styles/       # 样式
├── layout/       # 布局组件
├── locales/      # 国际化配置和翻译
├── permission/   # 权限控制
├── plugins/      # 插件配置
├── router/       # 路由配置
└── rootTypes/    # 根目录类型定义
```
