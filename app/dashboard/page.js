'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/auth/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const userName = user?.email?.split('@')[0] || 'Teacher'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'communication', label: '📧 Communication Hub' },
    { id: 'grading', label: '📊 Grading & Assessment' },
    { id: 'compliance', label: '📋 Compliance & Documentation' },
    { id: 'classroom', label: '🎯 Classroom Systems' },
    { id: 'support', label: '💚 Student Support' },
    { id: 'instructional', label: '📚 Instructional Prep' },
  ]

  const tools = [
    // Communication Hub - Parent contact & meetings
    { id: 'batch-progress-reports', name: 'Batch Student Reports', icon: '📊', category: 'communication', categoryLabel: 'Communication', description: 'Progress reports OR report card comments for your whole class', badge: 'NEW' },
    { id: 'batch-parent-emails', name: 'Batch Parent Emails', icon: '📧', category: 'communication', categoryLabel: 'Communication', description: 'Personalized parent emails for your whole class', badge: 'NEW' },
    { id: 'batch-recommendation-letters', name: 'Batch Rec Letters', icon: '✉️', category: 'communication', categoryLabel: 'Communication', description: 'Personalized recommendation letters for multiple students', badge: 'NEW' },
    { id: 'diplomat-mode', name: 'Diplomat Mode', icon: '🕊️', category: 'communication', categoryLabel: 'Communication', description: 'Check email tone before sending - prevent conflicts', badge: 'NEW' },
    { id: 'parent-email', name: 'Parent Email', icon: '💌', category: 'communication', categoryLabel: 'Communication', description: 'Draft professional emails to parents with customizable tone' },
    { id: 'meeting-notes', name: 'Meeting Notes', icon: '📋', category: 'communication', categoryLabel: 'Communication', description: 'Generate organized meeting summaries' },
    { id: 'progress-report', name: 'Progress Report', icon: '📝', category: 'communication', categoryLabel: 'Communication', description: 'Generate individual student progress reports' },
    
    // Grading & Assessment - Evaluation workflows
    { id: 'batch-essay-feedback', name: 'Batch Essay Feedback', icon: '✍️', category: 'grading', categoryLabel: 'Grading', description: 'Template-based feedback for entire class using YOUR rubric', badge: 'NEW' },
    { id: 'rubric', name: 'Rubric Builder', icon: '📊', category: 'grading', categoryLabel: 'Grading', description: 'Create clear scoring criteria for any assignment' },
    { id: 'essay-feedback', name: 'Essay Feedback', icon: '📝', category: 'grading', categoryLabel: 'Grading', description: 'Quick feedback for a single essay' },
    { id: 'math-feedback', name: 'Math Feedback', icon: '✨', category: 'grading', categoryLabel: 'Grading', description: 'Growth-mindset feedback on math work' },
    { id: 'quiz', name: 'Quiz/Test Generator', icon: '📝', category: 'grading', categoryLabel: 'Grading', description: 'Generate aligned assessments with answer keys' },
    { id: 'question-bank', name: 'Question Bank', icon: '🏦', category: 'grading', categoryLabel: 'Grading', description: 'Build reusable questions by standard' },
    { id: 'exit-ticket', name: 'Exit Ticket', icon: '🎫', category: 'grading', categoryLabel: 'Grading', description: 'Quick formative assessment checks' },
   
    // Grading & Assessment - Evaluation workflows
    { id: 'quiz-grader', name: 'Quiz Grader', icon: '✅', category: 'grading', categoryLabel: 'Grading', description: 'Grade quizzes with personalized feedback and class analytics', badge: 'NEW' },
    
    // Compliance & Documentation - Legal & required paperwork
    { id: 'batch-iep-updates', name: 'Batch IEP Updates', icon: '📋', category: 'compliance', categoryLabel: 'Compliance', description: 'IDEA-compliant progress updates for your entire caseload', badge: 'NEW' },
    { id: 'fba-writer', name: 'FBA Writer', icon: '🔍', category: 'compliance', categoryLabel: 'Compliance', description: 'Generate FBAs with function hypothesis from ABC data', badge: 'NEW' },
    { id: 'bip-generator', name: 'BIP Generator', icon: '📋', category: 'compliance', categoryLabel: 'Compliance', description: 'Generate behavior intervention plans from FBA data', badge: 'NEW' },
    { id: 'plop-writer', name: 'PLOP Writer', icon: '📊', category: 'compliance', categoryLabel: 'Compliance', description: 'Generate Present Levels of Performance statements', badge: 'NEW' },
    { id: 'goals-writer', name: 'Measurable Goals Writer', icon: '🎯', category: 'compliance', categoryLabel: 'Compliance', description: 'Create SMART IEP goals with short-term objectives', badge: 'NEW' },
    { id: 'incident-report', name: 'Incident Report', icon: '⚠️', category: 'compliance', categoryLabel: 'Compliance', description: 'Document behavior incidents objectively' },
    { id: 'accommodation', name: 'Accommodations', icon: '♿', category: 'compliance', categoryLabel: 'Compliance', description: 'IEP/504/ELL support suggestions' },
    
    // Classroom Systems - Daily operations & management
    { id: 'procedure', name: 'Procedure Builder', icon: '📋', category: 'classroom', categoryLabel: 'Classroom Systems', description: 'Teachable routines with I Do/We Do/You Do' },
    { id: 'seating', name: 'Seating Chart', icon: '🪑', category: 'classroom', categoryLabel: 'Classroom Systems', description: 'Strategic grouping recommendations' },
    { id: 'behavior-plan', name: 'Behavior Plan', icon: '💚', category: 'classroom', categoryLabel: 'Classroom Systems', description: 'PBS interventions, function-based' },
    { id: 'sub-plan', name: 'Sub Plans', icon: '📝', category: 'classroom', categoryLabel: 'Classroom Systems', description: 'Emergency-ready substitute packets' },
    { id: 'xp-system', name: 'XP System', icon: '⚡', category: 'classroom', categoryLabel: 'Classroom Systems', description: 'Complete classroom point system' },
    { id: 'badges', name: 'Badge Designer', icon: '🏆', category: 'classroom', categoryLabel: 'Classroom Systems', description: 'Design achievement badges with tiers' },
    
    // Student Support - SEL & behavioral support
    { id: 'sel-checkin', name: 'SEL Check-In', icon: '💚', category: 'support', categoryLabel: 'Student Support', description: 'CASEL-aligned morning meeting prompts' },
    { id: 'sel-activity', name: 'SEL Activity', icon: '🎯', category: 'support', categoryLabel: 'Student Support', description: 'Classroom activities for all 5 competencies' },
    { id: 'calming-corner', name: 'Calming Corner', icon: '🧘', category: 'support', categoryLabel: 'Student Support', description: 'Self-regulation strategies with scripts' },
    { id: 'conflict-resolution', name: 'Conflict Resolution', icon: '🕊️', category: 'support', categoryLabel: 'Student Support', description: 'Restorative conversation scripts' },
    { id: 'sel-worksheet', name: 'SEL Worksheet', icon: '📝', category: 'support', categoryLabel: 'Student Support', description: 'Printable social-emotional skill builders' },
    { id: 'social-story', name: 'Social Story', icon: '📖', category: 'support', categoryLabel: 'Student Support', description: 'Visual social narratives using Carol Gray method' },
    { id: 'team-building', name: 'Team Building', icon: '🤝', category: 'support', categoryLabel: 'Student Support', description: 'Community-building activities with debrief' },
    
    // Instructional Prep - Lesson planning & content creation
    { id: 'batch-differentiation', name: 'Batch Differentiation', icon: '📚', category: 'instructional', categoryLabel: 'Instructional', description: 'One assignment → Three tiered versions (below, on, above level)', badge: 'NEW' },
    { id: 'worksheet-generator', name: 'Worksheet Generator', icon: '📄', category: 'instructional', categoryLabel: 'Instructional', description: 'Create differentiated worksheets for any subject with 3-tier leveling', badge: 'NEW' },
    { id: 'lesson-plan', name: 'Lesson Plan', icon: '📖', category: 'instructional', categoryLabel: 'Instructional', description: 'Create standards-aligned lesson plans with differentiation' },
    { id: 'pacing-guide', name: 'Pacing Guide', icon: '📅', category: 'instructional', categoryLabel: 'Instructional', description: 'Map curriculum across weeks or quarters' },
    { id: 'warm-up', name: 'Warm-Up Generator', icon: '🌅', category: 'instructional', categoryLabel: 'Instructional', description: 'Create engaging bell ringers and do-nows' },
    { id: 'writing-prompt', name: 'Writing Prompt', icon: '📝', category: 'instructional', categoryLabel: 'Instructional', description: 'Engaging prompts for all genres' },
    { id: 'comprehension', name: 'Comprehension Qs', icon: '📖', category: 'instructional', categoryLabel: 'Instructional', description: 'DOK-leveled text-dependent questions' },
    { id: 'vocabulary', name: 'Vocabulary Builder', icon: '📚', category: 'instructional', categoryLabel: 'Instructional', description: 'Deep word knowledge with Frayer model' },
    { id: 'word-problems', name: 'Word Problems', icon: '🔢', category: 'instructional', categoryLabel: 'Instructional', description: 'Engaging problems with student interests' },
    { id: 'concept-explainer', name: 'Concept Explainer', icon: '📐', category: 'instructional', categoryLabel: 'Instructional', description: 'Multiple representations for concepts' },
    { id: 'error-analysis', name: 'Error Analysis', icon: '🔍', category: 'instructional', categoryLabel: 'Instructional', description: 'Diagnose misconceptions with re-teaching' },
    { id: 'text-level', name: 'Text Leveler', icon: '📊', category: 'instructional', categoryLabel: 'Instructional', description: 'Adjust text to specific Lexile levels' },
    { id: 'tiered-activity', name: 'Tiered Activities', icon: '🎯', category: 'instructional', categoryLabel: 'Instructional', description: '3-tier differentiation, same objective' },
    { id: 'scaffold', name: 'Scaffold Builder', icon: '🛠️', category: 'instructional', categoryLabel: 'Instructional', description: 'Learning supports with gradual release' },
    { id: 'guided-reading', name: 'Guided Reading', icon: '📖', category: 'instructional', categoryLabel: 'Instructional', description: 'Small group lesson plans' },
    { id: 'reading-response', name: 'Reading Response', icon: '📝', category: 'instructional', categoryLabel: 'Instructional', description: 'Response prompts by genre' },
    { id: 'peer-review', name: 'Peer Review Guide', icon: '👥', category: 'instructional', categoryLabel: 'Instructional', description: 'Structured student feedback guides' },
    { id: 'writing-conference', name: 'Writing Conference', icon: '📋', category: 'instructional', categoryLabel: 'Instructional', description: 'Conference guides with questions and tips' },
   
    // Instructional tools section
    { id: 'project-creator', name: 'Project Creator', icon: '🎯', category: 'instructional', categoryLabel: 'Instructional', description: 'Generate creative project ideas and complete project packets from your lessons', badge: 'NEW' },
    { id: 'quest', name: 'Quest Designer', icon: '🗡️', category: 'instructional', categoryLabel: 'Instructional', description: 'Create learning adventures with storylines' },
    { id: 'boss-battle', name: 'Boss Battle', icon: '🐉', category: 'instructional', categoryLabel: 'Instructional', description: 'Turn review into epic game battles' },
  ]

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const recommendedTools = [
    tools.find(t => t.id === 'batch-progress-reports'),
    tools.find(t => t.id === 'batch-parent-emails'),
    tools.find(t => t.id === 'rubric'),
    tools.find(t => t.id === 'behavior-plan'),
  ].filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Teacher Operating System</h1>
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
              <span className="text-gray-600 text-sm">{displayName}</span>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {displayName.charAt(0)}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-500 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <button 
              onClick={() => router.push('/dashboard/axel-assistant')}
              className="group relative cursor-pointer transition-transform hover:scale-105"
            >
              <img 
                src="/axolotl-mascot.png" 
                alt="AXEL - Your AI Teaching Assistant" 
                className="w-48 h-auto"
                style={{ imageRendering: 'auto' }}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat with AXEL 🦎
              </div>
            </button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Hi {displayName}, you're amazing.
          </h2>
          <p className="text-gray-500">Your Teacher Operating System - Automate the admin work that steals your evenings</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search all tools"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
            />
          </div>
        </div>

        {/* Recommended Tools */}
        {!searchQuery && activeCategory === 'all' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-purple-500">✨</span>
              <h3 className="font-medium text-gray-700">Start automating your workflow with these high-impact tools</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedTools.map(tool => (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/dashboard/${tool.id}`)}
                  className="bg-white p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md cursor-pointer transition-all"
                >
                  <span className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <span>📄</span> {tool.categoryLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{tool.name}</h4>
                    {tool.badge && (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm text-gray-500">Filter by</span>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              onClick={() => router.push(`/dashboard/${tool.id}`)}
              className="bg-white p-5 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg cursor-pointer transition-all group"
            >
                <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {tool.name}
                    </h4>
                    {tool.badge && (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No tools found matching your search.</p>
          </div>
        )}
      </main>

      {/* Floating AXEL Button */}
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