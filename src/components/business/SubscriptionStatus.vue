<template>
  <div class="subscription-status">
    <a-space :size="8">
      <a-tag :color="planColor">
        {{ planDisplayName }}
      </a-tag>
      <span v-if="showQuota && quota" class="quota-info">
        <a-tooltip :title="quotaTooltip">
          <span class="quota-text">
            设备: {{ quota.currentDevices }}/{{ quota.maxDevices }}
          </span>
        </a-tooltip>
      </span>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMySubscription, getMyResourceQuota, getPlanDisplayName, getPlanColor } from '@/api/subscription'
import type { Subscription, ResourceQuota } from '@/api/subscription'

interface Props {
  showQuota?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showQuota: true
})

const subscription = ref<Subscription | null>(null)
const quota = ref<ResourceQuota | null>(null)
const loading = ref(false)

const planDisplayName = computed(() => {
  if (!subscription.value) return '加载中...'
  return getPlanDisplayName(subscription.value.planType)
})

const planColor = computed(() => {
  if (!subscription.value) return '#666'
  return getPlanColor(subscription.value.planType)
})

const quotaTooltip = computed(() => {
  if (!quota.value) return ''
  return `设备: ${quota.value.currentDevices}/${quota.value.maxDevices}
标签: ${quota.value.maxTagsPerDevice}/设备
仿真器: ${quota.value.currentSimInstances}/${quota.value.maxSimInstances}`
})

const loadSubscription = async () => {
  loading.value = true
  try {
    const [subRes, quotaRes] = await Promise.all([
      getMySubscription(),
      props.showQuota ? getMyResourceQuota() : Promise.resolve(null)
    ])
    subscription.value = subRes
    quota.value = quotaRes
  } catch (error) {
    console.error('加载订阅信息失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSubscription()
})

defineExpose({
  refresh: loadSubscription
})
</script>

<style scoped>
.subscription-status {
  display: inline-flex;
  align-items: center;
}

.quota-info {
  font-size: 12px;
  color: #666;
}

.quota-text {
  cursor: help;
}
</style>
