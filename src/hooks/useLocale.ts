import { useLocaleStore } from '@/store/modules/locale'
import { i18n, setHtmlPageLang } from '@/plugins/vueI18n'

const setI18nLanguage = (locale: LocaleType) => {
  const localeStore = useLocaleStore()

  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    ;(i18n.global.locale as any).value = locale
  }
  localeStore.setCurrentLocale({
    lang: locale
  })
  setHtmlPageLang(locale)
}

export const useLocale = () => {
  // Switching the language will change the locale of useI18n
  // And submit to configuration modification
  const changeLocale = async (locale: LocaleType) => {
    const globalI18n = i18n.global

    const langModule = await import(`@/locales/${locale}.json`)

    setI18nLanguage(locale)
    globalI18n.setLocaleMessage(locale, langModule.default)
  }

  return {
    changeLocale
  }
}
