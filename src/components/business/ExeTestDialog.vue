<template>
  <a-modal
    v-model:open="visible"
    title="Exe 执行测试"
    width="700px"
    :footer="null"
    :destroyOnClose="true"
    @cancel="handleClose"
  >
    <!-- 加载状态 -->
    <a-spin :spinning="loading">
      <!-- 变量输入表单 -->
      <a-form
        v-if="!testResult && variables.length > 0"
        :labelCol="{ span: 6 }"
        :wrapperCol="{ span: 16 }"
      >
        <a-alert type="info" show-icon style="margin-bottom: 16px">
          <template #message>
            <span>脚本中检测到 {{ variables.length }} 个变量，请填入测试值</span>
          </template>
        </a-alert>

        <a-form-item label="原始脚本">
          <a-textarea
            :value="originalScript"
            :rows="3"
            readonly
            style="background: #f5f5f5; font-family: monospace"
          />
        </a-form-item>

        <a-divider>变量参数</a-divider>

        <a-form-item
          v-for="variable in variables"
          :key="variable.name"
          :label="`${variable.name} (${variable.type})`"
        >
          <a-input
            v-model:value="paramValues[variable.name]"
            :placeholder="`输入 ${variable.format} 的值`"
          >
            <template #prefix>
              <span style="color: #999; font-family: monospace">{{ variable.format }}</span>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item :wrapperCol="{ span: 16, offset: 6 }">
          <a-space>
            <a-button type="primary" @click="handleTest" :loading="testing"> 执行测试 </a-button>
            <a-button @click="handleClose">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 无变量时直接测试 -->
      <div v-else-if="!testResult && variables.length === 0">
        <a-alert type="warning" show-icon style="margin-bottom: 16px">
          <template #message>
            <span>脚本中未检测到变量，将直接执行脚本</span>
          </template>
        </a-alert>

        <a-form-item label="脚本内容">
          <a-textarea
            :value="originalScript"
            :rows="4"
            readonly
            style="background: #f5f5f5; font-family: monospace"
          />
        </a-form-item>

        <a-form-item :wrapperCol="{ span: 16, offset: 6 }">
          <a-space>
            <a-button type="primary" @click="handleTest" :loading="testing"> 直接执行 </a-button>
            <a-button @click="handleClose">取消</a-button>
          </a-space>
        </a-form-item>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult">
        <a-result
          :class="testResult.success ? 'result-success' : 'result-error'"
          :status="testResult.success ? 'success' : 'error'"
          :title="testResult.success ? '执行成功' : '执行失败'"
        >
          <template #subTitle>
            <div>
              <p style="margin: 8px 0">
                <strong>执行时间：</strong> {{ testResult.elapsedMs }} ms
              </p>
              <p v-if="testResult.exeTypeDescription" style="margin: 8px 0">
                <strong>执行类型：</strong> {{ testResult.exeTypeDescription }}
              </p>
              <p v-if="testResult.affectedRows !== undefined" style="margin: 8px 0">
                <strong>影响行数：</strong> {{ testResult.affectedRows }}
              </p>
            </div>
          </template>

          <template #extra>
            <a-space direction="vertical" style="width: 100%; max-width: 600px">
              <!-- 执行后的脚本 -->
              <a-collapse v-if="testResult.executedScript">
                <a-collapse-panel key="1" header="执行脚本（已替换变量）">
                  <pre
                    style="
                      margin: 0;
                      white-space: pre-wrap;
                      word-break: break-all;
                      font-family: monospace;
                      font-size: 12px;
                    "
                    >{{ testResult.executedScript }}</pre
                  >
                </a-collapse-panel>
              </a-collapse>

              <!-- 错误信息 -->
              <a-alert
                v-if="testResult.errorMessage"
                type="error"
                :message="testResult.errorMessage"
                style="margin-top: 8px"
              />

              <!-- 查询结果 -->
              <a-collapse v-if="resultRows.length > 0">
                <a-collapse-panel key="1" header="查询结果">
                  <a-table
                    :dataSource="resultRows"
                    :columns="resultColumns"
                    :pagination="{ pageSize: 10 }"
                    size="small"
                    :scroll="{ x: true }"
                  />
                </a-collapse-panel>
              </a-collapse>

              <!-- 操作按钮 -->
              <a-space style="margin-top: 16px">
                <a-button type="primary" @click="handleRetry"> 重新测试 </a-button>
                <a-button @click="handleClose"> 关闭 </a-button>
              </a-space>
            </a-space>
          </template>
        </a-result>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { message } from 'ant-design-vue'
  import {
    parseExeVariables,
    testExe,
    testScript,
    type ExeVariableInfo,
    type ExeTestResult,
  } from '@/api/device/iotDevice'
  import { normalizeList } from '@/api/response'

  // Props
  interface Props {
    exeId: number
    /** 快速测试模式：直接传入脚本内容，无需保存 Exe */
    quickTestScript?: string
    /** 快速测试模式：执行类型 (S/Q/M/R) */
    quickTestExeType?: string
  }

  const props = defineProps<Props>()

  // Emits
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'close'): void
  }>()

  // 弹窗可见性（快速测试模式 exeId=0 时也允许打开）
  const isQuickTest = computed(() => props.exeId === 0 && !!props.quickTestScript)
  const visible = computed({
    get: () => props.exeId > 0 || isQuickTest.value,
    set: val => emit('update:visible', val),
  })

  // 状态
  const loading = ref(false)
  const testing = ref(false)
  const variables = ref<ExeVariableInfo[]>([])
  const originalScript = ref('')
  const paramValues = ref<Record<string, string>>({})
  const testResult = ref<ExeTestResult | null>(null)

  // 错误信息
  const errorMessage = ref('')

  function normalizeExeResult(raw: any): ExeTestResult {
    const src = raw?.data && typeof raw.data === 'object' ? raw.data : raw
    return {
      success: !!(src?.success ?? src?.Success),
      errorMessage: src?.errorMessage ?? src?.ErrorMessage,
      executedScript: src?.executedScript ?? src?.ExecutedScript,
      exeTypeDescription: src?.exeTypeDescription ?? src?.ExeTypeDescription,
      elapsedMs: Number(src?.elapsedMs ?? src?.ElapsedMs ?? 0),
      resultData: normalizeList<Record<string, any>>(src?.resultData ?? src?.ResultData),
      affectedRows: Number(src?.affectedRows ?? src?.AffectedRows ?? 0),
    } as ExeTestResult
  }

  function normalizeParseResult(raw: any): {
    success: boolean
    errorMessage?: string
    variables: ExeVariableInfo[]
    originalScript: string
  } {
    const src = raw?.data && typeof raw.data === 'object' ? raw.data : raw
    return {
      success: !!(src?.success ?? src?.Success),
      errorMessage: src?.errorMessage ?? src?.ErrorMessage,
      variables: normalizeList<ExeVariableInfo>(src?.variables ?? src?.Variables),
      originalScript: String(src?.originalScript ?? src?.OriginalScript ?? ''),
    }
  }

  // 解析变量
  const loadVariables = async () => {
    if (!props.exeId) return

    loading.value = true
    errorMessage.value = ''
    testResult.value = null

    try {
      const raw = (await parseExeVariables(props.exeId)) as any
      const res = normalizeParseResult(raw)
      if (res.success) {
        variables.value = res.variables
        originalScript.value = res.originalScript
        // 初始化参数值
        paramValues.value = {}
        variables.value.forEach(v => {
          paramValues.value[v.name] = ''
        })
      } else {
        errorMessage.value = res.errorMessage || '解析变量失败'
        message.error(errorMessage.value)
      }
    } catch (error: any) {
      errorMessage.value = error.message || '解析变量失败'
      message.error(errorMessage.value)
    } finally {
      loading.value = false
    }
  }

  // 执行测试
  const handleTest = async () => {
    testing.value = true

    try {
      // 快速测试模式：直接调用 testScript API
      if (isQuickTest.value) {
        const request = {
          script: props.quickTestScript!,
          exeType: props.quickTestExeType || 'S',
          parameters: paramValues.value,
        }

        const raw = (await testScript(request)) as any
        const res = normalizeExeResult(raw)
        testResult.value = res

        if (res.success) {
          message.success('执行成功')
        } else {
          message.error(res.errorMessage || '执行失败')
        }
      } else {
        // 正常测试模式：调用 testExe API
        const request = {
          exeId: props.exeId,
          parameters: paramValues.value,
        }

        const raw = (await testExe(request)) as any
        const res = normalizeExeResult(raw)
        testResult.value = res

        if (res.success) {
          message.success('执行成功')
        } else {
          message.error(res.errorMessage || '执行失败')
        }
      }
    } catch (error: any) {
      testResult.value = {
        success: false,
        errorMessage: error.message || '执行异常',
        elapsedMs: 0,
        affectedRows: 0,
      }
      message.error(error.message || '执行异常')
    } finally {
      testing.value = false
    }
  }

  // 重新测试
  const handleRetry = () => {
    testResult.value = null
  }

  // 关闭
  const handleClose = () => {
    emit('update:visible', false)
    emit('close')
  }

  // 监听 exeId 变化，加载变量
  watch(
    () => [props.exeId, props.quickTestScript],
    ([newExeId, newScript]) => {
      if (newExeId > 0) {
        loadVariables()
      } else if (newScript) {
        // 快速测试模式：直接设置脚本内容，无需解析变量
        originalScript.value = newScript
        variables.value = []
        testResult.value = null
      }
    },
    { immediate: true },
  )

  // 结果表格列
  const resultRows = computed(() =>
    normalizeList<Record<string, any>>((testResult.value as any)?.resultData),
  )

  const resultColumns = computed(() => {
    if (resultRows.value.length === 0) {
      return []
    }
    const firstRow = resultRows.value[0]
    return Object.keys(firstRow).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      width: 150,
      ellipsis: true,
    }))
  })
</script>

<style scoped>
  pre {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
  }

  .result-success :deep(.ant-result-title) {
    color: #52c41a;
  }

  .result-error :deep(.ant-result-title) {
    color: #ff4d4f;
  }
</style>
