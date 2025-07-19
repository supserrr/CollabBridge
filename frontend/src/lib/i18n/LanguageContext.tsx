'use client'

import React, { createContext, useContext, useState } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Basic translations - can be extended with proper i18n later
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.browse': 'Browse',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'hero.title': 'Connect. Collaborate. Create.',
    'hero.subtitle': 'The premier marketplace for event planning collaborations',
    'hero.cta.planner': 'Find Professionals',
    'hero.cta.creative': 'Find Events',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.apply': 'Apply',
    'common.contact': 'Contact',
  },
  es: {
    'nav.dashboard': 'Panel',
    'nav.browse': 'Explorar',
    'nav.messages': 'Mensajes',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'hero.title': 'Conecta. Colabora. Crea.',
    'hero.subtitle': 'El mercado principal para colaboraciones de planificación de eventos',
    'hero.cta.planner': 'Encontrar Profesionales',
    'hero.cta.creative': 'Encontrar Eventos',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.apply': 'Aplicar',
    'common.contact': 'Contacto',
  },
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
