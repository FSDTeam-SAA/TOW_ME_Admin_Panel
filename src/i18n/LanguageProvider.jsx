import React, { useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './LanguageContext'
import { translations } from './translations'

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('towme-language') || 'he')
  const t = translations[language]

  useEffect(() => {
    localStorage.setItem('towme-language', language)
    document.documentElement.lang = language
    document.documentElement.dir = t.dir
  }, [language, t.dir])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
