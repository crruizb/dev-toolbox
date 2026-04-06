import { useEffect, useState } from 'react'

export type Lang = 'en' | 'es'

const translations = {
  en: {
    // App shell
    appTitle: 'Toolbox',
    toggleDark: 'Toggle dark mode',
    // Nav
    navDateDiff: 'Date Diff',
    navUuid: 'UUID',
    navCron: 'Cron',
    // Date Diff
    title: 'Date Diff',
    subtitle: 'Calculate days between date pairs',
    addPair: '+ Add date pair',
    total: 'Total',
    pair: 'pair',
    pairs: 'pairs',
    day: 'day',
    days: 'days',
    removePair: 'Remove pair',
    noDays: '— days',
    // UUID Generator
    uuidSubtitle: 'Generate random UUIDs',
    uuidGenerate: 'Generate',
    uuidCopy: 'Copy',
    uuidCopied: 'Copied!',
    uuidCopyAll: 'Copy all',
    uuidCount: 'Count',
    uuidEmpty: 'Click Generate to create UUIDs',
    // Cron Explainer
    cronSubtitle: 'Explain a cron expression',
    cronPlaceholder: 'e.g. 0 9 * * 1-5',
    cronInvalid: 'Invalid cron expression',
    cronAt: 'At',
    cronOn: 'on',
    cronIn: 'in',
    cronEvery: 'every',
    cronThrough: 'through',
    cronAnd: 'and',
    cronMinutes: 'minutes',
    cronHours: 'hours',
    cronDays: 'days',
    cronEveryMinute: 'every minute',
    cronEveryHour: 'every hour',
    cronEveryDay: 'every day',
    cronEveryMonth: 'every month',
    cronFieldMin: 'min',
    cronFieldHour: 'hour',
    cronFieldDay: 'day',
    cronFieldMonth: 'month',
    cronFieldWeekday: 'weekday',
  },
  es: {
    // App shell
    appTitle: 'Caja de Herramientas',
    toggleDark: 'Cambiar modo oscuro',
    // Nav
    navDateDiff: 'Fechas',
    navUuid: 'UUID',
    navCron: 'Cron',
    // Date Diff
    title: 'Diferencia de Fechas',
    subtitle: 'Calcula los días entre pares de fechas',
    addPair: '+ Agregar par de fechas',
    total: 'Total',
    pair: 'par',
    pairs: 'pares',
    day: 'día',
    days: 'días',
    removePair: 'Eliminar par',
    noDays: '— días',
    // UUID Generator
    uuidSubtitle: 'Genera UUIDs aleatorios',
    uuidGenerate: 'Generar',
    uuidCopy: 'Copiar',
    uuidCopied: '¡Copiado!',
    uuidCopyAll: 'Copiar todo',
    uuidCount: 'Cantidad',
    uuidEmpty: 'Haz clic en Generar para crear UUIDs',
    // Cron Explainer
    cronSubtitle: 'Explica una expresión cron',
    cronPlaceholder: 'ej. 0 9 * * 1-5',
    cronInvalid: 'Expresión cron inválida',
    cronAt: 'A las',
    cronOn: 'el',
    cronIn: 'en',
    cronEvery: 'cada',
    cronThrough: 'hasta el',
    cronAnd: 'y',
    cronMinutes: 'minutos',
    cronHours: 'horas',
    cronDays: 'días',
    cronEveryMinute: 'cada minuto',
    cronEveryHour: 'cada hora',
    cronEveryDay: 'cada día',
    cronEveryMonth: 'cada mes',
    cronFieldMin: 'min',
    cronFieldHour: 'hora',
    cronFieldDay: 'día',
    cronFieldMonth: 'mes',
    cronFieldWeekday: 'día-sem',
  },
} as const

export type TranslationKey = keyof typeof translations.en

const LANG_KEY = 'lang'

function detectLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved === 'en' || saved === 'es') return saved
  const browserLang = navigator.language.split('-')[0]
  return browserLang === 'es' ? 'es' : 'en'
}

export function useLocale() {
  const [lang, setLang] = useState<Lang>(detectLang)

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
  }, [lang])

  function t(key: TranslationKey): string {
    return translations[lang][key]
  }

  return { lang, setLang, t }
}
