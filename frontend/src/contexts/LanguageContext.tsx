// Language Context
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translation dictionaries
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.browse': 'Browse',
    'nav.professionals': 'Professionals',
    'nav.events': 'Events',
    'nav.messages': 'Messages',
    'nav.reviews': 'Reviews',
    'nav.dashboard': 'Dashboard',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    'nav.profile': 'Profile',
    
    // Home page
    'home.hero.title': 'Connect with Creative Professionals for Your Next Event',
    'home.hero.subtitle': 'Find talented photographers, videographers, DJs, decorators, and more. Make your event unforgettable.',
    'home.hero.cta.primary': 'Find Professionals',
    'home.hero.cta.secondary': 'Join as Professional',
    
    // Common
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loadMore': 'Load More',
    'common.viewAll': 'View All',
    'common.readMore': 'Read More',
    'common.showLess': 'Show Less',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Auth
    'auth.signIn.title': 'Sign In to Your Account',
    'auth.signUp.title': 'Create Your Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.rememberMe': 'Remember me',
    'auth.signInWithGoogle': 'Sign in with Google',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.stats.totalEvents': 'Total Events',
    'dashboard.stats.activeBookings': 'Active Bookings',
    'dashboard.stats.totalEarnings': 'Total Earnings',
    'dashboard.stats.clientReviews': 'Client Reviews',
    
    // Messages
    'messages.title': 'Messages',
    'messages.searchConversations': 'Search conversations...',
    'messages.typeMessage': 'Type a message...',
    'messages.online': 'Online',
    'messages.lastSeen': 'Last seen',
    'messages.selectConversation': 'Select a conversation',
    'messages.selectConversationDesc': 'Choose a conversation from the sidebar to start messaging',
    
    // Reviews
    'reviews.title': 'Reviews & Ratings',
    'reviews.writeReview': 'Write Review',
    'reviews.searchReviews': 'Search reviews...',
    'reviews.helpful': 'Helpful',
    'reviews.notHelpful': 'Not Helpful',
    'reviews.reviewFor': 'Review for:',
    'reviews.responseFrom': 'Response from',
    
    // Professionals
    'professionals.title': 'Find Creative Professionals',
    'professionals.subtitle': 'Discover talented professionals for your next event. Browse portfolios, read reviews, and connect with the perfect match.',
    'professionals.searchProfessionals': 'Search professionals...',
    'professionals.location': 'Location',
    'professionals.allCategories': 'All Categories',
    'professionals.anyPrice': 'Any Price',
    'professionals.anyAvailability': 'Any Availability',
    'professionals.available': 'Available',
    'professionals.viewProfile': 'View Profile',
    'professionals.contact': 'Contact',
    'professionals.verified': 'Verified',
    'professionals.hourlyRate': '/hr',
    
    // Events
    'events.title': 'Browse Events',
    'events.subtitle': 'Find exciting event opportunities. Apply to events that match your skills and grow your creative business.',
    'events.searchEvents': 'Search events...',
    'events.allTypes': 'All Types',
    'events.anyBudget': 'Any Budget',
    'events.anyLocation': 'Any Location',
    'events.applyNow': 'Apply Now',
    'events.viewDetails': 'View Details',
    'events.budget': 'Budget',
    'events.eventDate': 'Event Date',
    'events.applications': 'Applications',
    
    // Categories
    'category.photographer': 'Photographer',
    'category.videographer': 'Videographer',
    'category.dj': 'DJ',
    'category.musician': 'Musician',
    'category.caterer': 'Caterer',
    'category.decorator': 'Decorator',
    'category.florist': 'Florist',
    'category.mc': 'MC',
    'category.lightingTechnician': 'Lighting Technician',
    'category.soundTechnician': 'Sound Technician',
    'category.makeupArtist': 'Makeup Artist',
    'category.other': 'Other',
    
    // Event Types
    'eventType.wedding': 'Wedding',
    'eventType.corporate': 'Corporate Event',
    'eventType.birthday': 'Birthday Party',
    'eventType.conference': 'Conference',
    'eventType.concert': 'Concert',
    'eventType.festival': 'Festival',
    'eventType.graduation': 'Graduation',
    'eventType.other': 'Other'
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.browse': 'Explorar',
    'nav.professionals': 'Profesionales',
    'nav.events': 'Eventos',
    'nav.messages': 'Mensajes',
    'nav.reviews': 'Reseñas',
    'nav.dashboard': 'Panel',
    'nav.signIn': 'Iniciar Sesión',
    'nav.signUp': 'Registrarse',
    'nav.signOut': 'Cerrar Sesión',
    'nav.profile': 'Perfil',
    
    // Home page
    'home.hero.title': 'Conecta con Profesionales Creativos para tu Próximo Evento',
    'home.hero.subtitle': 'Encuentra fotógrafos talentosos, videofilmadores, DJs, decoradores y más. Haz que tu evento sea inolvidable.',
    'home.hero.cta.primary': 'Encontrar Profesionales',
    'home.hero.cta.secondary': 'Unirse como Profesional',
    
    // Common
    'common.loading': 'Cargando...',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.loadMore': 'Cargar Más',
    'common.viewAll': 'Ver Todo',
    'common.readMore': 'Leer Más',
    'common.showLess': 'Mostrar Menos',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.yes': 'Sí',
    'common.no': 'No',
    
    // Auth
    'auth.signIn.title': 'Iniciar Sesión en tu Cuenta',
    'auth.signUp.title': 'Crear tu Cuenta',
    'auth.forgotPassword': '¿Olvidaste tu Contraseña?',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.rememberMe': 'Recordarme',
    'auth.signInWithGoogle': 'Iniciar sesión con Google',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenido de vuelta',
    'dashboard.stats.totalEvents': 'Eventos Totales',
    'dashboard.stats.activeBookings': 'Reservas Activas',
    'dashboard.stats.totalEarnings': 'Ganancias Totales',
    'dashboard.stats.clientReviews': 'Reseñas de Clientes',
    
    // Messages
    'messages.title': 'Mensajes',
    'messages.searchConversations': 'Buscar conversaciones...',
    'messages.typeMessage': 'Escribe un mensaje...',
    'messages.online': 'En línea',
    'messages.lastSeen': 'Visto por última vez',
    'messages.selectConversation': 'Selecciona una conversación',
    'messages.selectConversationDesc': 'Elige una conversación de la barra lateral para comenzar a enviar mensajes',
    
    // Reviews
    'reviews.title': 'Reseñas y Calificaciones',
    'reviews.writeReview': 'Escribir Reseña',
    'reviews.searchReviews': 'Buscar reseñas...',
    'reviews.helpful': 'Útil',
    'reviews.notHelpful': 'No Útil',
    'reviews.reviewFor': 'Reseña para:',
    'reviews.responseFrom': 'Respuesta de',
    
    // Professionals
    'professionals.title': 'Encuentra Profesionales Creativos',
    'professionals.subtitle': 'Descubre profesionales talentosos para tu próximo evento. Explora portafolios, lee reseñas y conecta con la pareja perfecta.',
    'professionals.searchProfessionals': 'Buscar profesionales...',
    'professionals.location': 'Ubicación',
    'professionals.allCategories': 'Todas las Categorías',
    'professionals.anyPrice': 'Cualquier Precio',
    'professionals.anyAvailability': 'Cualquier Disponibilidad',
    'professionals.available': 'Disponible',
    'professionals.viewProfile': 'Ver Perfil',
    'professionals.contact': 'Contactar',
    'professionals.verified': 'Verificado',
    'professionals.hourlyRate': '/hora',
    
    // Events
    'events.title': 'Explorar Eventos',
    'events.subtitle': 'Encuentra oportunidades de eventos emocionantes. Aplica a eventos que coincidan con tus habilidades y haz crecer tu negocio creativo.',
    'events.searchEvents': 'Buscar eventos...',
    'events.allTypes': 'Todos los Tipos',
    'events.anyBudget': 'Cualquier Presupuesto',
    'events.anyLocation': 'Cualquier Ubicación',
    'events.applyNow': 'Aplicar Ahora',
    'events.viewDetails': 'Ver Detalles',
    'events.budget': 'Presupuesto',
    'events.eventDate': 'Fecha del Evento',
    'events.applications': 'Aplicaciones',
    
    // Categories
    'category.photographer': 'Fotógrafo',
    'category.videographer': 'Videofilmador',
    'category.dj': 'DJ',
    'category.musician': 'Músico',
    'category.caterer': 'Catering',
    'category.decorator': 'Decorador',
    'category.florist': 'Florista',
    'category.mc': 'Maestro de Ceremonias',
    'category.lightingTechnician': 'Técnico de Iluminación',
    'category.soundTechnician': 'Técnico de Sonido',
    'category.makeupArtist': 'Maquillista',
    'category.other': 'Otro',
    
    // Event Types
    'eventType.wedding': 'Boda',
    'eventType.corporate': 'Evento Corporativo',
    'eventType.birthday': 'Fiesta de Cumpleaños',
    'eventType.conference': 'Conferencia',
    'eventType.concert': 'Concierto',
    'eventType.festival': 'Festival',
    'eventType.graduation': 'Graduación',
    'eventType.other': 'Otro'
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.browse': 'Parcourir',
    'nav.professionals': 'Professionnels',
    'nav.events': 'Événements',
    'nav.messages': 'Messages',
    'nav.reviews': 'Avis',
    'nav.dashboard': 'Tableau de Bord',
    'nav.signIn': 'Se Connecter',
    'nav.signUp': 'S\'inscrire',
    'nav.signOut': 'Se Déconnecter',
    'nav.profile': 'Profil',
    
    // Home page
    'home.hero.title': 'Connectez-vous avec des Professionnels Créatifs pour votre Prochain Événement',
    'home.hero.subtitle': 'Trouvez des photographes talentueux, des vidéastes, des DJs, des décorateurs et plus encore. Rendez votre événement inoubliable.',
    'home.hero.cta.primary': 'Trouver des Professionnels',
    'home.hero.cta.secondary': 'Rejoindre en tant que Professionnel',
    
    // Common
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.loadMore': 'Charger Plus',
    'common.viewAll': 'Voir Tout',
    'common.readMore': 'Lire Plus',
    'common.showLess': 'Afficher Moins',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.submit': 'Soumettre',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    
    // Auth
    'auth.signIn.title': 'Connectez-vous à votre Compte',
    'auth.signUp.title': 'Créer votre Compte',
    'auth.forgotPassword': 'Mot de Passe Oublié?',
    'auth.email': 'Email',
    'auth.password': 'Mot de Passe',
    'auth.confirmPassword': 'Confirmer le Mot de Passe',
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.signInWithGoogle': 'Se connecter avec Google',
    
    // Dashboard
    'dashboard.welcome': 'Bon retour',
    'dashboard.stats.totalEvents': 'Événements Totaux',
    'dashboard.stats.activeBookings': 'Réservations Actives',
    'dashboard.stats.totalEarnings': 'Gains Totaux',
    'dashboard.stats.clientReviews': 'Avis Clients',
    
    // Messages
    'messages.title': 'Messages',
    'messages.searchConversations': 'Rechercher des conversations...',
    'messages.typeMessage': 'Tapez un message...',
    'messages.online': 'En ligne',
    'messages.lastSeen': 'Vu pour la dernière fois',
    'messages.selectConversation': 'Sélectionnez une conversation',
    'messages.selectConversationDesc': 'Choisissez une conversation dans la barre latérale pour commencer à envoyer des messages',
    
    // Reviews
    'reviews.title': 'Avis et Évaluations',
    'reviews.writeReview': 'Écrire un Avis',
    'reviews.searchReviews': 'Rechercher des avis...',
    'reviews.helpful': 'Utile',
    'reviews.notHelpful': 'Pas Utile',
    'reviews.reviewFor': 'Avis pour:',
    'reviews.responseFrom': 'Réponse de',
    
    // Professionals
    'professionals.title': 'Trouver des Professionnels Créatifs',
    'professionals.subtitle': 'Découvrez des professionnels talentueux pour votre prochain événement. Parcourez les portfolios, lisez les avis et connectez-vous avec la correspondance parfaite.',
    'professionals.searchProfessionals': 'Rechercher des professionnels...',
    'professionals.location': 'Emplacement',
    'professionals.allCategories': 'Toutes les Catégories',
    'professionals.anyPrice': 'Tout Prix',
    'professionals.anyAvailability': 'Toute Disponibilité',
    'professionals.available': 'Disponible',
    'professionals.viewProfile': 'Voir le Profil',
    'professionals.contact': 'Contacter',
    'professionals.verified': 'Vérifié',
    'professionals.hourlyRate': '/heure',
    
    // Events
    'events.title': 'Parcourir les Événements',
    'events.subtitle': 'Trouvez des opportunités d\'événements passionnantes. Postulez à des événements qui correspondent à vos compétences et développez votre entreprise créative.',
    'events.searchEvents': 'Rechercher des événements...',
    'events.allTypes': 'Tous les Types',
    'events.anyBudget': 'Tout Budget',
    'events.anyLocation': 'Tout Emplacement',
    'events.applyNow': 'Postuler Maintenant',
    'events.viewDetails': 'Voir les Détails',
    'events.budget': 'Budget',
    'events.eventDate': 'Date de l\'Événement',
    'events.applications': 'Candidatures',
    
    // Categories
    'category.photographer': 'Photographe',
    'category.videographer': 'Vidéaste',
    'category.dj': 'DJ',
    'category.musician': 'Musicien',
    'category.caterer': 'Traiteur',
    'category.decorator': 'Décorateur',
    'category.florist': 'Fleuriste',
    'category.mc': 'Maître de Cérémonie',
    'category.lightingTechnician': 'Technicien Éclairage',
    'category.soundTechnician': 'Technicien Son',
    'category.makeupArtist': 'Maquilleur',
    'category.other': 'Autre',
    
    // Event Types
    'eventType.wedding': 'Mariage',
    'eventType.corporate': 'Événement d\'Entreprise',
    'eventType.birthday': 'Fête d\'Anniversaire',
    'eventType.conference': 'Conférence',
    'eventType.concert': 'Concert',
    'eventType.festival': 'Festival',
    'eventType.graduation': 'Remise de Diplômes',
    'eventType.other': 'Autre'
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguage(lang)
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
