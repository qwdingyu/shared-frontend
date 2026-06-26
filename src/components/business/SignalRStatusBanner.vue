<template>
  <!-- 仅当已连接过但断开 / 重连中时显示；首次尚未连接时不显示（避免页面刚进来就吓用户） -->
  <a-alert
    v-if="showReconnecting"
    type="warning"
    show-icon
    :closable="false"
    class="signalr-banner"
  >
    <template #message>
      <span>实时推送重连中…（第 {{ reconnectAttempts }} 次）</span>
    </template>
    <template #description>
      <span style="font-size: 12px; color: #8c8c8c">
        页面将通过轮询刷新数据；恢复后会自动切回实时推送。
      </span>
    </template>
  </a-alert>

  <a-alert
    v-else-if="showDisconnected"
    type="error"
    show-icon
    :closable="true"
    class="signalr-banner"
  >
    <template #message>
      <span>实时推送已断开</span>
    </template>
    <template #description>
      <span style="font-size: 12px">
        设备监控页的实时数据将不会自动更新。
        <a-button type="link" size="small" :loading="retrying" @click="handleRetry">
          重试连接
        </a-button>
        ·
        <a-button type="link" size="small" @click="dismissed = true">不再提示</a-button>
      </span>
    </template>
  </a-alert>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlcSignalR } from '@/utils/plcSignalR'

const {
  isConnected,
  isReconnecting,
  reconnectAttempts,
  connect,
} = usePlcSignalR()

const retrying = ref(false)
const dismissed = ref(false)
const hasConnectedOnce = ref(false)

// 首次连接成功后才进入"观察断线"模式
onMounted(() => {
  if (isConnected.value) {
    hasConnectedOnce.value = true
    return
  }
  const timer = setInterval(() => {
    if (isConnected.value) {
      hasConnectedOnce.value = true
      clearInterval(timer)
    }
  }, 1000)
  onUnmounted(() => clearInterval(timer))
})

const showReconnecting = computed(
  () => !dismissed.value && hasConnectedOnce.value && isReconnecting.value && !isConnected.value,
)

const showDisconnected = computed(
  () => !dismissed.value && hasConnectedOnce.value && !isConnected.value && !isReconnecting.value,
)

/**
 * 重试连接：调用 connect()（= signalRManager.acquire）触发一次连接尝试。
 * 不会增加有效引用计数（父组件已持有），只是给 manager 一个"重连"信号。
 */
const handleRetry = async () => {
  retrying.value = true
  try {
    await connect()
  } catch {
    // 忽略：失败时 isReconnecting / isConnected 仍会正确更新，横幅继续显示
  } finally {
    retrying.value = false
  }
}
</script>

<style scoped>
.signalr-banner {
  margin-bottom: 12px;
}
</style>
