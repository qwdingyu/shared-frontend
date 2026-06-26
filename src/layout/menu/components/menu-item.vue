<template>
  <Menu.Item :key="item?.name">
    <MenuItemContent :item="item" />
  </Menu.Item>
</template>

<script setup lang="ts">
  import { Menu } from 'ant-design-vue'
  import MenuItemContent from './menu-item-content.vue'
  import type { PropType } from 'vue'
  import type { RouteRecordRaw } from 'vue-router'

  defineOptions({
    name: 'MyMenuItem',
  })

  defineProps({
    item: {
      type: Object as PropType<RouteRecordRaw>,
      default: () => ({}),
    },
  })
</script>
