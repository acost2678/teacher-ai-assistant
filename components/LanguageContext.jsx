'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
})

const translations = {
  en: {
    'app.name': 'Teacher AI Assistant',
    'app.tagline': '59 tools to save your evenings',
    'nav.askAxel': 'Ask AXEL',
    'nav.history': 'History',
    'nav.help': 'Help',
    'nav.tools': 'Tools',
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': 'What would you like to create today?',
    'dashboard.search': 'Search 59 tools...',
    'dashboard.quickAccess': '⚡ Quick Access',
    'dashboard.noResults': 'No tools found for',
    'dashboard.clearSearch': 'Clear search',
    'stats.tools': 'Tools',
    'stats.languages': 'Languages',
    'stats.membership': 'Membership',
    'category.communication': 'Communication Hub',
    'category.communication.desc': 'Parent emails, reports & meeting notes',
    'category.grading': 'Grading & Assessment',
    'category.grading.desc': 'Rubrics, feedback & quiz tools',
    'category.compliance': 'IEP & Compliance',
    'category.compliance.desc': 'IEP documentation, FBAs & BIPs',
    'category.classroom': 'Classroom Systems',
    'category.classroom.desc': 'Procedures, seating & management',
    'category.support': 'SEL & Student Support',
    'category.support.desc': 'Social-emotional learning & wellbeing',
    'category.instructional': 'Lesson Planning & Prep',
    'category.instructional.desc': 'Lessons, differentiation & content',
    'tool.generate': 'Generate',
    'tool.generating': 'Generating...',
    'tool.copy': '📋 Copy',
    'tool.copied': '✓ Copied!',
    'tool.export': '📄 Export .docx',
    'tool.exporting': 'Exporting...',
    'tool.saved': '✓ Saved',
    'tool.showDemo': 'Show Demo',
    'tool.reset': 'Reset',
    'tool.addFile': '📎 Add File',
    'tool.back': 'Tools',
    'tool.saveToGoogleDrive': 'Save to Google Drive',
    'tool.openInGoogleDocs': 'Open in Google Docs',
    'tool.savingToDrive': 'Saving...',
    'privacy.title': 'Privacy-First Design',
    'privacy.desc': 'Generated content uses "[Student Name]", "[Parent Name]", and "[Teacher Name]" placeholders. Replace them with actual names when you use the content.',
    'help.needHelp': 'Need help? Ask AXEL!',
  },
  es: {
    'app.name': 'Asistente IA para Maestros',
    'app.tagline': '59 herramientas para ahorrar tiempo',
    'nav.askAxel': 'Preguntarle a AXEL',
    'nav.history': 'Historial',
    'nav.help': 'Ayuda',
    'nav.tools': 'Herramientas',
    'dashboard.welcome': 'Bienvenido/a de nuevo',
    'dashboard.subtitle': '¿Qué te gustaría crear hoy?',
    'dashboard.search': 'Buscar entre 59 herramientas...',
    'dashboard.quickAccess': '⚡ Acceso Rápido',
    'dashboard.noResults': 'No se encontraron herramientas para',
    'dashboard.clearSearch': 'Borrar búsqueda',
    'stats.tools': 'Herramientas',
    'stats.languages': 'Idiomas',
    'stats.membership': 'Membresía',
    'category.communication': 'Centro de Comunicación',
    'category.communication.desc': 'Correos a padres, reportes y notas de reuniones',
    'category.grading': 'Calificación y Evaluación',
    'category.grading.desc': 'Rúbricas, retroalimentación y cuestionarios',
    'category.compliance': 'IEP y Cumplimiento',
    'category.compliance.desc': 'Documentación IEP, FBAs y BIPs',
    'category.classroom': 'Sistemas de Aula',
    'category.classroom.desc': 'Procedimientos, asientos y manejo',
    'category.support': 'SEL y Apoyo Estudiantil',
    'category.support.desc': 'Aprendizaje socioemocional y bienestar',
    'category.instructional': 'Planificación de Lecciones',
    'category.instructional.desc': 'Lecciones, diferenciación y contenido',
    'tool.generate': 'Generar',
    'tool.generating': 'Generando...',
    'tool.copy': '📋 Copiar',
    'tool.copied': '✓ ¡Copiado!',
    'tool.export': '📄 Exportar .docx',
    'tool.exporting': 'Exportando...',
    'tool.saved': '✓ Guardado',
    'tool.showDemo': 'Ver Demo',
    'tool.reset': 'Reiniciar',
    'tool.addFile': '📎 Agregar Archivo',
    'tool.back': 'Herramientas',
    'tool.saveToGoogleDrive': 'Guardar en Google Drive',
    'tool.openInGoogleDocs': 'Abrir en Google Docs',
    'tool.savingToDrive': 'Guardando...',
    'privacy.title': 'Diseño que Protege la Privacidad',
    'privacy.desc': 'El contenido generado usa los marcadores "[Nombre del Estudiante]", "[Nombre del Padre/Madre]" y "[Nombre del Maestro/a]". Reemplázalos con los nombres reales antes de usar el contenido.',
    'help.needHelp': '¿Necesitas ayuda? ¡Pregúntale a AXEL!',
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en')
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred-language')
    if (saved === 'es' || saved === 'en') {
      setLanguageState(saved)
    }
    setMounted(true)
  }, [])

  // Save to localStorage whenever language changes
  const setLanguage = (lang) => {
    setLanguageState(lang)
    localStorage.setItem('preferred-language', lang)
  }

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export default LanguageContext