import React, { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
]

// Sample translations for demonstration
const translations: Translations = {
  en: {
    'nav.home': 'Home',
    'nav.events': 'Events',
    'nav.professionals': 'Browse Professionals',
    'nav.messages': 'Messages',
    'nav.reviews': 'Reviews',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log In',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Log Out',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'home.title': 'Connect. Collaborate. Create.',
    'home.subtitle': 'The marketplace where event planners and creative professionals come together.',
    'events.title': 'Discover Events',
    'events.subtitle': 'Find exciting opportunities to showcase your talent.',
    'professionals.title': 'Find Creative Professionals',
    'professionals.subtitle': 'Discover talented professionals for your next event.'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.events': 'Eventos',
    'nav.professionals': 'Buscar Profesionales',
    'nav.messages': 'Mensajes',
    'nav.reviews': 'Reseñas',
    'nav.dashboard': 'Panel',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'home.title': 'Conectar. Colaborar. Crear.',
    'home.subtitle': 'El mercado donde planificadores de eventos y profesionales creativos se unen.',
    'events.title': 'Descubrir Eventos',
    'events.subtitle': 'Encuentra oportunidades emocionantes para mostrar tu talento.',
    'professionals.title': 'Encontrar Profesionales Creativos',
    'professionals.subtitle': 'Descubre profesionales talentosos para tu próximo evento.'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.events': 'Événements',
    'nav.professionals': 'Trouver des Professionnels',
    'nav.messages': 'Messages',
    'nav.reviews': 'Avis',
    'nav.dashboard': 'Tableau de Bord',
    'nav.login': 'Se Connecter',
    'nav.signup': 'S\'inscrire',
    'nav.logout': 'Se Déconnecter',
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.submit': 'Soumettre',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'home.title': 'Connecter. Collaborer. Créer.',
    'home.subtitle': 'Le marché où les planificateurs d\'événements et les professionnels créatifs se rencontrent.',
    'events.title': 'Découvrir les Événements',
    'events.subtitle': 'Trouvez des opportunités passionnantes pour montrer votre talent.',
    'professionals.title': 'Trouver des Professionnels Créatifs',
    'professionals.subtitle': 'Découvrez des professionnels talentueux pour votre prochain événement.'
  }
}

// Language Context
export const LanguageContext = React.createContext<{
  currentLanguage: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}>({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key: string) => key
})

// Language Provider Component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('collabbridge_language')
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (languages.find(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang)
      }
    }
  }, [])

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang)
    localStorage.setItem('collabbridge_language', lang)
    
    // Update HTML lang attribute
    document.documentElement.lang = lang
    
    // Update direction for RTL languages
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  const t = (key: string): string => {
    const translation = translations[currentLanguage]?.[key]
    return translation || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export const useLanguage = () => {
  const context = React.useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Language Switcher Component
interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'simple'
  showFlag?: boolean
  showNativeName?: boolean
  className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currentLanguage, setLanguage } = useLanguage()

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  if (variant === 'simple') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <LanguageIcon className="h-5 w-5 text-neutral-600 mr-2" />
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-transparent border-none text-sm text-neutral-700 focus:outline-none focus:ring-0"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {showFlag && `${lang.flag} `}
              {showNativeName ? lang.nativeName : lang.name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {showFlag && (
          <span className="mr-2 text-lg">{currentLang.flag}</span>
        )}
        <span className="hidden sm:inline">
          {showNativeName ? currentLang.nativeName : currentLang.name}
        </span>
        <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
        <ChevronDownIcon 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 flex items-center transition-colors ${
                  lang.code === currentLanguage 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-neutral-700'
                }`}
              >
                {showFlag && (
                  <span className="mr-3 text-lg">{lang.flag}</span>
                )}
                <div className="flex-1">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-neutral-500">{lang.nativeName}</div>
                </div>
                {lang.code === currentLanguage && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full ml-2"></div>
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-neutral-200 px-4 py-3">
            <p className="text-xs text-neutral-500">
              Don't see your language? 
              <a 
                href="/contact" 
                className="text-primary-600 hover:text-primary-700 ml-1"
              >
                Let us know
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
