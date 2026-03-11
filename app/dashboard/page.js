'use client'
 import { useState } from 'react'
 import { useRouter } from 'next/navigation'

  export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState({})
  const router = useRouter()

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
      name: 'Communication Hub',
      icon: '📧',
      color: 'blue',
      description: 'Parent emails, reports & meeting notes',
      tools: [
        { id: 'batch-progress-reports', name: 'Batch Student Reports', icon: '📊', description: 'Progress reports for your whole class', badge: 'NEW' },
        { id: 'batch-parent-emails', name: 'Batch Parent Emails', icon: '📧', description: 'Personalized emails for entire class', badge: 'NEW' },
        { id: 'batch-recommendation-letters', name: 'Batch Rec Letters', icon: '✉️', description: 'Recommendation letters for multiple students', badge: 'NEW' },
        { id: 'diplomat-mode', name: 'Diplomat Mode', icon: '🕊️', description: 'Check email tone before sending', badge: 'NEW' },
        { id: 'parent-email', name: 'Parent Email', icon: '💌', description: 'Draft professional parent emails' },
        { id: 'meeting-notes', name: 'Meeting Notes', icon: '📋', description: 'Organized meeting summaries' },
        { id: 'progress-report', name: 'Progress Report', icon: '📝', description: 'Individual student progress reports' },
      ]
    },
    {
      id: 'grading',
      name: 'Grading & Assessment',
      icon: '📊',
      color: 'green',
      description: 'Rubrics, feedback & quiz tools',
      tools: [
        { id: 'batch-essay-feedback', name: 'Batch Essay Feedback', icon: '✍️', description: 'Feedback for entire class', badge: 'NEW' },
        { id: 'quiz-grader', name: 'Quiz Grader', icon: '✅', description: 'Grade with personalized feedback', badge: 'NEW' },
        { id: 'rubric', name: 'Rubric Builder', icon: '📊', description: 'Create scoring criteria' },
        { id: 'essay-feedback', name: 'Essay Feedback', icon: '📝', description: 'Quick single essay feedback' },
        { id: 'math-feedback', name: 'Math Feedback', icon: '✨', description: 'Growth-mindset math feedback' },
        { id: 'quiz', name: 'Quiz/Test Generator', icon: '📝', description: 'Aligned assessments with keys' },
        { id: 'question-bank', name: 'Question Bank', icon: '🏦', description: 'Reusable questions by standard' },
        { id: 'exit-ticket', name: 'Exit Ticket', icon: '🎫', description: 'Quick formative checks' },
      ]
    },
    {
      id: 'compliance',
      name: 'IEP & Compliance',
      icon: '📋',
      color: 'purple',
      description: 'IEP documentation, FBAs & BIPs',
      tools: [
        { id: 'batch-iep-updates', name: 'Batch IEP Updates', icon: '📋', description: 'Progress updates for caseload', badge: 'NEW' },
        { id: 'plop-writer', name: 'PLOP Writer', icon: '📊', description: 'Present Levels statements', badge: 'NEW' },
        { id: 'goals-writer', name: 'Measurable Goals', icon: '🎯', description: 'SMART IEP goals', badge: 'NEW' },
        { id: 'fba-writer', name: 'FBA Writer', icon: '🔍', description: 'Functional Behavior Assessments', badge: 'NEW' },
        { id: 'bip-generator', name: 'BIP Generator', icon: '📋', description: 'Behavior Intervention Plans', badge: 'NEW' },
        { id: 'incident-report', name: 'Incident Report', icon: '⚠️', description: 'Document incidents objectively' },
        { id: 'accommodation', name: 'Accommodations', icon: '♿', description: 'IEP/504/ELL support suggestions' },
      ]
    },
    {
      id: 'classroom',
      name: 'Classroom Systems',
      icon: '🎯',
      color: 'orange',
      description: 'Procedures, seating & management',
      tools: [
        { id: 'behavior-plan', name: 'Behavior Plan', icon: '💚', description: 'PBS function-based interventions' },
        { id: 'procedure', name: 'Procedure Builder', icon: '📋', description: 'Teachable routines' },
        { id: 'seating', name: 'Seating Chart', icon: '🪑', description: 'Strategic grouping' },
        { id: 'sub-plan', name: 'Sub Plans', icon: '📝', description: 'Emergency substitute packets' },
        { id: 'xp-system', name: 'XP System', icon: '⚡', description: 'Classroom point system' },
        { id: 'badges', name: 'Badge Designer', icon: '🏆', description: 'Achievement badges' },
      ]
    },
    {
      id: 'support',
      name: 'SEL & Student Support',
      icon: '💚',
      color: 'teal',
      description: 'Social-emotional learning & wellbeing',
      tools: [
        { id: 'sel-checkin', name: 'SEL Check-In & Early Warning', icon: '💚', description: 'Check-ins, trend tracking & Tier 2 flags', badge: 'UPGRADED' },
        { id: 'sel-activity', name: 'SEL Activity', icon: '🎯', description: 'All 5 CASEL competencies' },
        { id: 'calming-corner', name: 'Calming Corner', icon: '🧘', description: 'Self-regulation strategies' },
        { id: 'conflict-resolution', name: 'Conflict Resolution', icon: '🕊️', description: 'Restorative conversations' },
        { id: 'sel-worksheet', name: 'SEL Worksheet', icon: '📝', description: 'Printable skill builders' },
        { id: 'social-story', name: 'Social Story', icon: '📖', description: 'Carol Gray method narratives' },
        { id: 'team-building', name: 'Team Building', icon: '🤝', description: 'Community-building activities' },
        { id: 'coloring-page-generator', name: 'Coloring Page Generator', icon: '🎨', description: 'Print-ready SEL & academic coloring pages', badge: 'NEW' },
      ]
    },
    {
      id: 'instructional',
      name: 'Lesson Planning & Prep',
      icon: '📚',
      color: 'indigo',
      description: 'Lessons, differentiation & content',
      tools: [
        { id: 'lesson-plan', name: 'Lesson Plan', icon: '📖', description: 'Standards-aligned plans' },
        { id: 'batch-differentiation', name: 'Batch Differentiation', icon: '📚', description: 'Three tiered versions', badge: 'NEW' },
        { id: 'worksheet-generator', name: 'Worksheet Generator', icon: '📄', description: 'Differentiated worksheets', badge: 'NEW' },
        { id: 'project-creator', name: 'Project Creator', icon: '🎯', description: 'Creative project packets', badge: 'NEW' },
        { id: 'pacing-guide', name: 'Pacing Guide', icon: '📅', description: 'Curriculum mapping' },
        { id: 'warm-up', name: 'Warm-Up Generator', icon: '🌅', description: 'Bell ringers & do-nows' },
        { id: 'writing-prompt', name: 'Writing Prompt', icon: '📝', description: 'Engaging prompts' },
        { id: 'comprehension', name: 'Comprehension Qs', icon: '📖', description: 'DOK-leveled questions' },
        { id: 'vocabulary', name: 'Vocabulary Builder', icon: '📚', description: 'Frayer model words' },
        { id: 'word-problems', name: 'Word Problems', icon: '🔢', description: 'Student interest problems' },
        { id: 'concept-explainer', name: 'Concept Explainer', icon: '📐', description: 'Multiple representations' },
        { id: 'error-analysis', name: 'Error Analysis', icon: '🔍', description: 'Diagnose misconceptions' },
        { id: 'text-level', name: 'Text Leveler', icon: '📊', description: 'Adjust Lexile levels' },
        { id: 'tiered-activity', name: 'Tiered Activities', icon: '🎯', description: '3-tier differentiation' },
        { id: 'scaffold', name: 'Scaffold Builder', icon: '🛠️', description: 'Gradual release supports' },
        { id: 'guided-reading', name: 'Guided Reading', icon: '📖', description: 'Small group plans' },
        { id: 'reading-response', name: 'Reading Response', icon: '📝', description: 'Genre-based prompts' },
        { id: 'peer-review', name: 'Peer Review Guide', icon: '👥', description: 'Student feedback guides' },
        { id: 'writing-conference', name: 'Writing Conference', icon: '📋', description: 'Conference guides' },
        { id: 'quest', name: 'Quest Designer', icon: '🗡️', description: 'Learning adventures' },
        { id: 'boss-battle', name: 'Boss Battle', icon: '🐉', description: 'Gamified review' },
        { id: 'standards-alignment', name: 'Standards Alignment', icon: '📐', description: 'Tag, generate & export alignment reports', badge: 'NEW' }
      ]
    },
  ]

  const quickAccessTools = [
    { id: 'batch-progress-reports', name: 'Batch Reports', icon: '📊', color: 'blue' },
    { id: 'batch-parent-emails', name: 'Batch Emails', icon: '📧', color: 'green' },
    { id: 'batch-iep-updates', name: 'IEP Updates', icon: '📋', color: 'purple' },
    { id: 'lesson-plan', name: 'Lesson Plan', icon: '📖', color: 'indigo' },
    { id: 'rubric', name: 'Rubric', icon: '📊', color: 'orange' },
    { id: 'behavior-plan', name: 'Behavior Plan', icon: '💚', color: 'teal' },
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
              <h1 className="text-lg font-bold text-gray-800">Teacher AI Assistant</h1>
              <p className="text-xs text-gray-500">58 tools to save your evenings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/axel-assistant')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm font-medium transition-colors"
            >
              <span>🦎</span>
              <span>Ask AXEL</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/history')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              📜 History
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
            Welcome back, {displayName} 👋
          </h2>
          <p className="text-gray-500 mb-6">What would you like to create today?</p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search 58 tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {!searchQuery && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">⚡ Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickAccessTools.map(tool => {
                const colors = getColorClasses(tool.color)
                return (
                  <button
                    key={tool.id}
                    onClick={() => router.push(`/dashboard/${tool.id}`)}
                    className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 text-center hover:shadow-md transition-all hover:scale-105`}
                  >
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
            <p className="text-gray-500">No tools found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear search
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
                <button
                  onClick={() => toggleSection(category.id)}
                  className={`w-full ${colors.header} px-6 py-4 flex items-center justify-between hover:opacity-90 transition-opacity`}
                >
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
                  <span className={`text-xl ${colors.text} transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
                    ▼
                  </span>
                </button>

                {!isCollapsed && (
                  <div className={`${colors.bg} p-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredTools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => router.push(`/dashboard/${tool.id}`)}
                          className="bg-white rounded-xl p-4 text-left border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{tool.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                                  {tool.name}
                                </h4>
                                {tool.badge && (
                                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                                    {tool.badge}
                                  </span>
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
                <div className="text-2xl font-bold text-purple-600">58</div>
                <div className="text-xs text-gray-500">Tools</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15</div>
                <div className="text-xs text-gray-500">Languages</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-xs text-gray-500">Free</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <button
        onClick={() => router.push('/dashboard/axel-assistant')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group z-50"
      >
        <span className="text-2xl">🦎</span>
        <div className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help? Ask AXEL!
        </div>
      </button>
    </div>
  )
}