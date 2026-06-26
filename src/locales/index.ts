import { createI18n, type CreateI18nOptions, type I18n } from 'vue-i18n'
import { localeMap } from './config'
import { setHtmlPageLang, setLoadLocalePool } from './helper'
import type { App } from 'vue'
import { useLocaleStoreWithOut } from '@/store/modules/locale'

async function createI18nOptions(): Promise<CreateI18nOptions> {
  const localeStore = useLocaleStoreWithOut()
  const locale = localeStore.getLocale
  const defaultLocal = await import(`./lang/${locale}.ts`)
  const message = defaultLocal.default?.message ?? {}

  setHtmlPageLang(locale)
  setLoadLocalePool((loadLocalePool) => {
    loadLocalePool.push(locale)
  })

  return {
    locale,
    fallbackLocale: localeMap.zh_CN,
    messages: {
      [locale]: message as { [key: string]: string },
    },
    globalInjection: true,
    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true,
  }
}

/**
 * 延迟创建的 i18n 实例；消费方需先调用 setupI18n(app)。
 */
export let i18n: I18n | null = null

/**
 * 初始化 i18n。
 * 说明：shared-frontend 作为库被消费时，需要消费方传入 Vue App 后再挂载。
 */
export async function setupI18n(app: App) {
  if (!i18n) {
    i18n = createI18n(await createI18nOptions())
  }
  app.use(i18n)
}
