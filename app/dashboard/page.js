'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../components/LanguageContext'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState({})
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const displayName = 'Teacher'

  const toolCategories = [
    {
      id: 'communication',
      name: t('category.communication'),
      icon: '📧',
      color: 'blue',
      description: t('category.communication.desc'),
      tools: [
        { id: 'batch-progress-reports', name: language === 'es' ? 'Reportes en Lote' : 'Batch Student Reports', icon: '📊', description: language === 'es' ? 'Reportes de progreso para toda la clase' : 'Progress reports for your whole class', badge: 'NEW' },
        { id: 'batch-parent-emails', name: language === 'es' ? 'Correos en Lote' : 'Batch Parent Emails', icon: '📧', description: language === 'es' ? 'Correos personalizados para toda la clase' : 'Personalized emails for entire class', badge: 'NEW' },
        { id: 'batch-recommendation-letters', name: language === 'es' ? 'Cartas de Recomendación' : 'Batch Rec Letters', icon: '✉️', description: language === 'es' ? 'Cartas de recomendación para múltiples estudiantes' : 'Recommendation letters for multiple students', badge: 'NEW' },
        { id: 'diplomat-mode', name: language === 'es' ? 'Modo Diplomático' : 'Diplomat Mode', icon: '🕊️', description: language === 'es' ? 'Revisa el tono del correo antes de enviar' : 'Check email tone before sending', badge: 'NEW' },
        { id: 'parent-email', name: language === 'es' ? 'Correo a Padres' : 'Parent Email', icon: '💌', description: language === 'es' ? 'Redacta correos profesionales a padres' : 'Draft professional parent emails' },
        { id: 'meeting-notes', name: language === 'es' ? 'Notas de Reunión' : 'Meeting Notes', icon: '📋', description: language === 'es' ? 'Resúmenes organizados de reuniones' : 'Organized meeting summaries' },
        { id: 'progress-report', name: language === 'es' ? 'Reporte de Progreso' : 'Progress Report', icon: '📝', description: language === 'es' ? 'Reportes de progreso individuales' : 'Individual student progress reports' },
      ]
    },
    {
      id: 'grading',
      name: t('category.grading'),
      icon: '📊',
      color: 'green',
      description: t('category.grading.desc'),
      tools: [
        { id: 'batch-essay-feedback', name: language === 'es' ? 'Retroalimentación en Lote' : 'Batch Essay Feedback', icon: '✍️', description: language === 'es' ? 'Retroalimentación para toda la clase' : 'Feedback for entire class', badge: 'NEW' },
        { id: 'quiz-grader', name: language === 'es' ? 'Calificador de Exámenes' : 'Quiz Grader', icon: '✅', description: language === 'es' ? 'Califica con retroalimentación personalizada' : 'Grade with personalized feedback', badge: 'NEW' },
        { id: 'rubric', name: language === 'es' ? 'Creador de Rúbricas' : 'Rubric Builder', icon: '📊', description: language === 'es' ? 'Crea criterios de evaluación' : 'Create scoring criteria' },
        { id: 'essay-feedback', name: language === 'es' ? 'Retroalimentación de Ensayos' : 'Essay Feedback', icon: '📝', description: language === 'es' ? 'Retroalimentación rápida para un ensayo' : 'Quick single essay feedback' },
        { id: 'math-feedback', name: language === 'es' ? 'Retroalimentación de Matemáticas' : 'Math Feedback', icon: '✨', description: language === 'es' ? 'Retroalimentación con mentalidad de crecimiento' : 'Growth-mindset math feedback' },
        { id: 'quiz', name: language === 'es' ? 'Generador de Exámenes' : 'Quiz/Test Generator', icon: '📝', description: language === 'es' ? 'Evaluaciones alineadas con claves' : 'Aligned assessments with keys' },
        { id: 'question-bank', name: language === 'es' ? 'Banco de Preguntas' : 'Question Bank', icon: '🏦', description: language === 'es' ? 'Preguntas reutilizables por estándar' : 'Reusable questions by standard' },
        { id: 'exit-ticket', name: language === 'es' ? 'Boleto de Salida' : 'Exit Ticket', icon: '🎫', description: language === 'es' ? 'Verificaciones formativas rápidas' : 'Quick formative checks' },
      ]
    },
    {
      id: 'compliance',
      name: t('category.compliance'),
      icon: '📋',
      color: 'purple',
      description: t('category.compliance.desc'),
      tools: [
        { id: 'batch-iep-updates', name: language === 'es' ? 'Actualizaciones IEP en Lote' : 'Batch IEP Updates', icon: '📋', description: language === 'es' ? 'Actualizaciones de progreso para toda la carga' : 'Progress updates for caseload', badge: 'NEW' },
        { id: 'plop-writer', name: language === 'es' ? 'Escritor de PLOP' : 'PLOP Writer', icon: '📊', description: language === 'es' ? 'Declaraciones de Niveles Presentes' : 'Present Levels statements', badge: 'NEW' },
        { id: 'goals-writer', name: language === 'es' ? 'Metas Medibles' : 'Measurable Goals', icon: '🎯', description: language === 'es' ? 'Metas IEP SMART' : 'SMART IEP goals', badge: 'NEW' },
        { id: 'fba-writer', name: language === 'es' ? 'Escritor de FBA' : 'FBA Writer', icon: '🔍', description: language === 'es' ? 'Evaluaciones Funcionales de Conducta' : 'Functional Behavior Assessments', badge: 'NEW' },
        { id: 'bip-generator', name: language === 'es' ? 'Generador de BIP' : 'BIP Generator', icon: '📋', description: language === 'es' ? 'Planes de Intervención de Conducta' : 'Behavior Intervention Plans', badge: 'NEW' },
        { id: 'incident-report', name: language === 'es' ? 'Reporte de Incidente' : 'Incident Report', icon: '⚠️', description: language === 'es' ? 'Documenta incidentes objetivamente' : 'Document incidents objectively' },
        { id: 'accommodation', name: language === 'es' ? 'Acomodaciones' : 'Accommodations', icon: '♿', description: language === 'es' ? 'Sugerencias de apoyo IEP/504/ELL' : 'IEP/504/ELL support suggestions' },
      ]
    },
    {
      id: 'classroom',
      name: t('category.classroom'),
      icon: '🎯',
      color: 'orange',
      description: t('category.classroom.desc'),
      tools: [
        { id: 'behavior-plan', name: language === 'es' ? 'Plan de Conducta' : 'Behavior Plan', icon: '💚', description: language === 'es' ? 'Intervenciones PBS basadas en función' : 'PBS function-based interventions' },
        { id: 'procedure', name: language === 'es' ? 'Constructor de Procedimientos' : 'Procedure Builder', icon: '📋', description: language === 'es' ? 'Rutinas enseñables' : 'Teachable routines' },
        { id: 'seating', name: language === 'es' ? 'Mapa de Asientos' : 'Seating Chart', icon: '🪑', description: language === 'es' ? 'Agrupación estratégica' : 'Strategic grouping' },
        { id: 'sub-plan', name: language === 'es' ? 'Plan para Sustituto' : 'Sub Plans', icon: '📝', description: language === 'es' ? 'Paquetes para maestro sustituto' : 'Emergency substitute packets' },
        { id: 'xp-system', name: language === 'es' ? 'Sistema de XP' : 'XP System', icon: '⚡', description: language === 'es' ? 'Sistema de puntos en el aula' : 'Classroom point system' },
        { id: 'badges', name: language === 'es' ? 'Diseñador de Insignias' : 'Badge Designer', icon: '🏆', description: language === 'es' ? 'Insignias de logros' : 'Achievement badges' },
      ]
    },
    {
      id: 'support',
      name: t('category.support'),
      icon: '💚',
      color: 'teal',
      description: t('category.support.desc'),
      tools: [
        { id: 'sel-checkin', name: language === 'es' ? 'SEL Check-In y Alerta Temprana' : 'SEL Check-In & Early Warning', icon: '💚', description: language === 'es' ? 'Check-ins, tendencias y alertas Nivel 2' : 'Check-ins, trend tracking & Tier 2 flags', badge: 'MEJORADO' },
        { id: 'sel-activity', name: language === 'es' ? 'Actividad SEL' : 'SEL Activity', icon: '🎯', description: language === 'es' ? 'Las 5 competencias CASEL' : 'All 5 CASEL competencies' },
        { id: 'calming-corner', name: language === 'es' ? 'Rincón de Calma' : 'Calming Corner', icon: '🧘', description: language === 'es' ? 'Estrategias de autorregulación' : 'Self-regulation strategies' },
        { id: 'conflict-resolution', name: language === 'es' ? 'Resolución de Conflictos' : 'Conflict Resolution', icon: '🕊️', description: language === 'es' ? 'Conversaciones restaurativas' : 'Restorative conversations' },
        { id: 'sel-worksheet', name: language === 'es' ? 'Hoja de Trabajo SEL' : 'SEL Worksheet', icon: '📝', description: language === 'es' ? 'Hojas imprimibles de habilidades' : 'Printable skill builders' },
        { id: 'social-story', name: language === 'es' ? 'Historia Social' : 'Social Story', icon: '📖', description: language === 'es' ? 'Narrativas del método Carol Gray' : 'Carol Gray method narratives' },
        { id: 'team-building', name: language === 'es' ? 'Construcción de Equipo' : 'Team Building', icon: '🤝', description: language === 'es' ? 'Actividades de construcción comunitaria' : 'Community-building activities' },
        { id: 'coloring-page-generator', name: language === 'es' ? 'Generador de Páginas para Colorear' : 'Coloring Page Generator', icon: '🎨', description: language === 'es' ? 'Páginas para colorear SEL y académicas' : 'Print-ready SEL & academic coloring pages', badge: 'NEW' },
      ]
    },
    {
      id: 'instructional',
      name: t('category.instructional'),
      icon: '📚',
      color: 'indigo',
      description: t('category.instructional.desc'),
      tools: [
        { id: 'pd-generator', name: language === 'es' ? 'Generador de Desarrollo Profesional' : 'PD Generator', icon: '🎓', description: language === 'es' ? 'Presentaciones de DP con base en investigación' : 'Research-based PD presentations with speaker notes', badge: 'NEW' },
        { id: 'lesson-plan', name: language === 'es' ? 'Plan de Lección' : 'Lesson Plan', icon: '📖', description: language === 'es' ? 'Planes alineados a estándares' : 'Standards-aligned plans' },
        { id: 'batch-differentiation', name: language === 'es' ? 'Diferenciación en Lote' : 'Batch Differentiation', icon: '📚', description: language === 'es' ? 'Tres versiones por nivel' : 'Three tiered versions', badge: 'NEW' },
        { id: 'worksheet-generator', name: language === 'es' ? 'Generador de Hojas de Trabajo' : 'Worksheet Generator', icon: '📄', description: language === 'es' ? 'Hojas de trabajo diferenciadas' : 'Differentiated worksheets', badge: 'NEW' },
        { id: 'project-creator', name: language === 'es' ? 'Creador de Proyectos' : 'Project Creator', icon: '🎯', description: language === 'es' ? 'Paquetes creativos de proyectos' : 'Creative project packets', badge: 'NEW' },
        { id: 'pacing-guide', name: language === 'es' ? 'Guía de Ritmo' : 'Pacing Guide', icon: '📅', description: language === 'es' ? 'Mapeo curricular' : 'Curriculum mapping' },
        { id: 'warm-up', name: language === 'es' ? 'Generador de Calentamiento' : 'Warm-Up Generator', icon: '🌅', description: language === 'es' ? 'Actividades de inicio de clase' : 'Bell ringers & do-nows' },
        { id: 'writing-prompt', name: language === 'es' ? 'Indicación de Escritura' : 'Writing Prompt', icon: '📝', description: language === 'es' ? 'Indicaciones atractivas' : 'Engaging prompts' },
        { id: 'comprehension', name: language === 'es' ? 'Preguntas de Comprensión' : 'Comprehension Qs', icon: '📖', description: language === 'es' ? 'Preguntas por nivel DOK' : 'DOK-leveled questions' },
        { id: 'vocabulary', name: language === 'es' ? 'Constructor de Vocabulario' : 'Vocabulary Builder', icon: '📚', description: language === 'es' ? 'Palabras con modelo Frayer' : 'Frayer model words' },
        { id: 'word-problems', name: language === 'es' ? 'Problemas de Palabras' : 'Word Problems', icon: '🔢', description: language === 'es' ? 'Problemas de interés estudiantil' : 'Student interest problems' },
        { id: 'concept-explainer', name: language === 'es' ? 'Explicador de Conceptos' : 'Concept Explainer', icon: '📐', description: language === 'es' ? 'Múltiples representaciones' : 'Multiple representations' },
        { id: 'error-analysis', name: language === 'es' ? 'Análisis de Errores' : 'Error Analysis', icon: '🔍', description: language === 'es' ? 'Diagnostica conceptos erróneos' : 'Diagnose misconceptions' },
        { id: 'text-level', name: language === 'es' ? 'Nivelador de Textos' : 'Text Leveler', icon: '📊', description: language === 'es' ? 'Ajusta niveles Lexile' : 'Adjust Lexile levels' },
        { id: 'tiered-activity', name: language === 'es' ? 'Actividades por Niveles' : 'Tiered Activities', icon: '🎯', description: language === 'es' ? 'Diferenciación en 3 niveles' : '3-tier differentiation' },
        { id: 'scaffold', name: language === 'es' ? 'Constructor de Andamiaje' : 'Scaffold Builder', icon: '🛠️', description: language === 'es' ? 'Apoyos de liberación gradual' : 'Gradual release supports' },
        { id: 'guided-reading', name: language === 'es' ? 'Lectura Guiada' : 'Guided Reading', icon: '📖', description: language === 'es' ? 'Planes para grupos pequeños' : 'Small group plans' },
        { id: 'reading-response', name: language === 'es' ? 'Respuesta a la Lectura' : 'Reading Response', icon: '📝', description: language === 'es' ? 'Indicaciones por género' : 'Genre-based prompts' },
        { id: 'peer-review', name: language === 'es' ? 'Guía de Revisión por Pares' : 'Peer Review Guide', icon: '👥', description: language === 'es' ? 'Guías de retroalimentación estudiantil' : 'Student feedback guides' },
        { id: 'writing-conference', name: language === 'es' ? 'Conferencia de Escritura' : 'Writing Conference', icon: '📋', description: language === 'es' ? 'Guías de conferencia' : 'Conference guides' },
        { id: 'quest', name: language === 'es' ? 'Diseñador de Misiones' : 'Quest Designer', icon: '🗡️', description: language === 'es' ? 'Aventuras de aprendizaje' : 'Learning adventures' },
        { id: 'boss-battle', name: language === 'es' ? 'Batalla Final' : 'Boss Battle', icon: '🐉', description: language === 'es' ? 'Repaso gamificado' : 'Gamified review' },
        { id: 'standards-alignment', name: language === 'es' ? 'Alineación de Estándares' : 'Standards Alignment', icon: '📐', description: language === 'es' ? 'Etiqueta, genera y exporta reportes de alineación' : 'Tag, generate & export alignment reports', badge: 'NEW' },
      ]
    },
  ]

  const quickAccessTools = [
    { id: 'batch-progress-reports', name: language === 'es' ? 'Reportes' : 'Batch Reports', icon: '📊', color: 'blue' },
    { id: 'batch-parent-emails', name: language === 'es' ? 'Correos' : 'Batch Emails', icon: '📧', color: 'green' },
    { id: 'batch-iep-updates', name: language === 'es' ? 'IEP' : 'IEP Updates', icon: '📋', color: 'purple' },
    { id: 'lesson-plan', name: language === 'es' ? 'Lección' : 'Lesson Plan', icon: '📖', color: 'indigo' },
    { id: 'rubric', name: language === 'es' ? 'Rúbrica' : 'Rubric', icon: '📊', color: 'orange' },
    { id: 'pd-generator', name: language === 'es' ? 'Des. Profesional' : 'PD Generator', icon: '🎓', color: 'teal' },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', header: 'bg-blue-100', badge: 'bg-blue-500' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', header: 'bg-green-100', badge: 'bg-green-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', header: 'bg-purple-100', badge: 'bg-purple-500' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', header: 'bg-orange-100', badge: 'bg-orange-500' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', header: 'bg-teal-100', badge: 'bg-teal-500' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', header: 'bg-indigo-100', badge: 'bg-indigo-500' },
    }
    return colors[color] || colors.blue
  }

  const filterTools = (tools) => {
    if (!searchQuery) return tools
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const hasSearchResults = searchQuery && toolCategories.some(cat => filterTools(cat.tools).length > 0)
  const noSearchResults = searchQuery && !hasSearchResults

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/axolotl-mascot.png" alt="AXEL" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">{t('app.name')}</h1>
              <p className="text-xs text-gray-500">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'es' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ES
              </button>
            </div>
            <button
              onClick={() => router.push('/dashboard/axel-assistant')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm font-medium transition-colors"
            >
              <span>🦎</span>
              <span>{t('nav.askAxel')}</span>
            </button>
            <button onClick={() => router.push('/dashboard/history')} className="text-gray-500 hover:text-gray-700 text-sm">
              📜 {t('nav.history')}
            </button>
            <button onClick={() => router.push('/dashboard/help')} className="text-gray-500 hover:text-gray-700 text-sm">
              ❓ {t('nav.help')}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {displayName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {t('dashboard.welcome')}, {displayName} 👋
          </h2>
          <p className="text-gray-500 mb-6">{t('dashboard.subtitle')}</p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder={t('dashboard.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
          </div>
        </div>

        {!searchQuery && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('dashboard.quickAccess')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickAccessTools.map(tool => {
                const colors = getColorClasses(tool.color)
                return (
                  <button key={tool.id} onClick={() => router.push(`/dashboard/${tool.id}`)}
                    className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 text-center hover:shadow-md transition-all hover:scale-105`}>
                    <div className="text-2xl mb-1">{tool.icon}</div>
                    <div className={`text-sm font-medium ${colors.text}`}>{tool.name}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {noSearchResults && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">{t('dashboard.noResults')} "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="mt-3 text-purple-600 hover:text-purple-700 font-medium">
              {t('dashboard.clearSearch')}
            </button>
          </div>
        )}

        <div className="space-y-6">
          {toolCategories.map(category => {
            const filteredTools = filterTools(category.tools)
            if (searchQuery && filteredTools.length === 0) return null
            const colors = getColorClasses(category.color)
            const isCollapsed = collapsedSections[category.id]
            return (
              <div key={category.id} className={`rounded-2xl border-2 ${colors.border} overflow-hidden`}>
                <button onClick={() => toggleSection(category.id)}
                  className={`w-full ${colors.header} px-6 py-4 flex items-center justify-between hover:opacity-90 transition-opacity`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="text-left">
                      <h3 className={`font-bold ${colors.text}`}>{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <span className={`${colors.badge} text-white text-xs font-bold px-2 py-1 rounded-full ml-2`}>
                      {filteredTools.length}
                    </span>
                  </div>
                  <span className={`text-xl ${colors.text} transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>▼</span>
                </button>

                {!isCollapsed && (
                  <div className={`${colors.bg} p-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredTools.map(tool => (
                        <button key={tool.id} onClick={() => router.push(`/dashboard/${tool.id}`)}
                          className="bg-white rounded-xl p-4 text-left border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{tool.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors truncate">{tool.name}</h4>
                                {tool.badge && (
                                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">{tool.badge}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{tool.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!searchQuery && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 bg-white rounded-full px-8 py-3 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">59</div>
                <div className="text-xs text-gray-500">{t('stats.tools')}</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15</div>
                <div className="text-xs text-gray-500">{t('stats.languages')}</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$9</div>
                <div className="text-xs text-gray-500">{t('stats.membership')}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <button onClick={() => router.push('/dashboard/axel-assistant')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group z-50">
        <span className="text-2xl">🦎</span>
        <div className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t('help.needHelp')}
        </div>
      </button>
    </div>
  )
}