'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const HELP_CONTENT = {
  gettingStarted: {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    color: 'purple',
    description: 'New here? Start with this guide to get up and running in minutes.',
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to Teacher AI Assistant',
        content: `Teacher AI Assistant is a free platform built by educators, for educators. It gives you 59 AI-powered tools to reduce paperwork, save time, and focus more energy on your students.

Every tool is designed around three principles:
• Privacy-first: We use placeholders like [Student Name] instead of real names to keep you FERPA-compliant.
• Batch-ready: Many tools let you generate content for your entire class at once — not just one student at a time.
• Educator-built: Every prompt and feature was designed by a former school counselor with 10+ years in education.`,
        steps: [
          'Create your free account and log in',
          'Browse the dashboard — tools are organized into 6 categories',
          'Pick a tool that matches your immediate need',
          'Fill in the inputs (no real student names needed!)',
          'Generate, copy, export, or save to Google Drive',
        ],
        tips: ['Start with the tool that solves your most pressing problem this week', 'Use the Demo button on any tool to see an example before you start'],
      },
      {
        id: 'navigation',
        title: 'Navigating the Dashboard',
        content: `The dashboard is organized into 6 categories. Each category groups related tools together so you can find what you need quickly.

Use the search bar at the top to find any tool instantly — just type a keyword like "rubric", "email", or "IEP" and matching tools will appear.

The Quick Access bar at the top gives you one-click access to the most commonly used tools.`,
        steps: [
          'Use the search bar to find any tool by name or keyword',
          'Click any category header to expand or collapse it',
          'Click any tool card to open that tool',
          'Use the breadcrumb at the top of each tool to return to the dashboard',
        ],
        tips: ['The Quick Access bar can be your daily starting point', 'All your generated documents are saved automatically in Saved Documents'],
      },
      {
        id: 'privacy',
        title: 'Privacy & FERPA Compliance',
        content: `Teacher AI Assistant is designed to protect student privacy at every step.

We never ask you to enter real student names. Instead, every tool uses placeholders:
• [Student Name] — replaces any student's name
• [Parent Name] — replaces parent/guardian names  
• [Teacher Name] — your name in communications

When you generate a document, you simply replace the placeholders with real names in your own email system or word processor — the AI never sees the actual name.

Your documents are saved to your personal account and are not shared with other users. We do not sell your data or use it to train AI models.`,
        steps: [
          'Enter descriptive notes about a student without using their real name',
          'Generate the document — it will use [Student Name] throughout',
          'Copy or export the document',
          'Replace placeholders with real names in your own system before sending',
        ],
        tips: ['You can refer to a student by role: "my student who struggles with reading" is perfectly descriptive', 'The Privacy badge on each tool confirms it uses the placeholder system'],
      },
    ],
  },
  communication: {
    id: 'communication',
    title: 'Communication Hub',
    icon: '📧',
    color: 'blue',
    description: 'Tools for parent emails, progress reports, and meeting documentation.',
    articles: [
      {
        id: 'parent-email',
        title: 'Parent Email',
        toolId: 'parent-email',
        content: 'The Parent Email tool generates professional, warm parent communications in seconds. Choose from 7 email types and 5 tone options, then enter your key points and let the AI draft the full email.',
        steps: [
          'Select the Email Type (General Update, Behavior Concern, Positive News, etc.)',
          'Choose your Tone (Warm & Friendly, Professional, Formal, etc.)',
          'Enter your key points in the notes field — bullet points are fine',
          'Click Generate',
          'Review, copy, and paste into your email system — replace [Student Name] and [Parent Name]',
        ],
        tips: ['For behavior concerns, choose "Concerned but Supportive" tone to keep communication collaborative', 'You can upload a .txt file of notes instead of typing them'],
      },
      {
        id: 'batch-parent-emails',
        title: 'Batch Parent Emails',
        toolId: 'batch-parent-emails',
        content: 'Generate personalized parent emails for your entire class at once. Enter a class roster with brief notes for each student and receive individual emails for every family.',
        steps: [
          'Enter each student\'s identifier (e.g., "Student 1") and their key notes',
          'Select the email type and tone for the batch',
          'Click Generate All',
          'Review each email individually',
          'Export as a batch or copy individually',
        ],
        tips: ['Use simple identifiers like "Student A" or seat numbers — never real names', 'This is ideal for end-of-quarter updates when you need to contact every family'],
      },
      {
        id: 'meeting-notes',
        title: 'Meeting Notes',
        toolId: 'meeting-notes',
        content: 'Transform rough meeting notes or a transcript into organized, professional summaries with clear action items.',
        steps: [
          'Paste your raw notes or meeting transcript',
          'Select the meeting type (IEP, Parent Conference, Team Meeting, etc.)',
          'Click Generate',
          'Review the organized summary and action items panel',
          'Export as .docx or save to Google Drive',
        ],
        tips: ['Even messy bullet points produce great output — you don\'t need perfect notes', 'The Action Items panel pulls out all follow-up tasks automatically'],
      },
    ],
  },
  grading: {
    id: 'grading',
    title: 'Grading & Assessment',
    icon: '📊',
    color: 'green',
    description: 'Tools for rubrics, feedback, quizzes, and formative assessment.',
    articles: [
      {
        id: 'rubric',
        title: 'Rubric Builder',
        toolId: 'rubric',
        content: 'Build detailed, standards-aligned rubrics in seconds. Specify the assignment type, grade level, and criteria — the AI generates a complete rubric with performance level descriptors.',
        steps: [
          'Enter the assignment name and type',
          'Select grade level',
          'List the criteria you want assessed',
          'Choose number of performance levels (3 or 4)',
          'Generate and export as .docx',
        ],
        tips: ['Add your learning standard or objective in the notes field for tighter alignment', 'Use the editable output to tweak any descriptor before exporting'],
      },
      {
        id: 'essay-feedback',
        title: 'Essay Feedback',
        toolId: 'essay-feedback',
        content: 'Paste a student essay and receive detailed, growth-focused feedback aligned to your rubric criteria.',
        steps: [
          'Paste the essay text',
          'Select grade level and assignment type',
          'Choose feedback focus (structure, argumentation, mechanics, etc.)',
          'Click Generate',
          'Copy feedback and paste into your grading system',
        ],
        tips: ['Feedback is always framed as growth-oriented — never punitive', 'Use batch essay feedback for an entire class at once'],
      },
    ],
  },
  compliance: {
    id: 'compliance',
    title: 'IEP & Compliance',
    icon: '📋',
    color: 'purple',
    description: 'Tools for IEP documentation, behavior plans, and special education paperwork.',
    articles: [
      {
        id: 'bip-generator',
        title: 'BIP Generator',
        toolId: 'bip-generator',
        content: 'Generate a complete, PBIS-aligned Behavior Intervention Plan. Enter the target behavior, function of behavior, and current supports — the AI generates a structured BIP ready for team review.',
        steps: [
          'Enter the target behavior (observable and measurable)',
          'Select the hypothesized function (attention, escape, sensory, tangible)',
          'Describe current antecedents and consequences',
          'Enter existing strengths and supports',
          'Generate the full BIP',
        ],
        tips: ['Always have a behavior specialist or psychologist review before finalizing', 'The output uses [Student Name] — replace before adding to an official IEP'],
      },
      {
        id: 'plop-writer',
        title: 'PLOP Writer',
        toolId: 'plop-writer',
        content: 'Write Present Levels of Performance statements that are specific, data-driven, and compliant with IDEA requirements.',
        steps: [
          'Enter assessment data and current performance levels',
          'Describe how the disability impacts academic and functional performance',
          'Select the area (academic, behavioral, social-emotional, communication)',
          'Generate the PLOP statement',
          'Review and edit before adding to the IEP',
        ],
        tips: ['Include specific data points (percentages, grade levels, scores) for stronger PLOPs', 'Each PLOP should connect directly to the goals you\'ll write next'],
      },
    ],
  },
  sel: {
    id: 'sel',
    title: 'SEL & Student Support',
    icon: '💚',
    color: 'teal',
    description: 'Tools for social-emotional learning, behavior support, and student wellbeing.',
    articles: [
      {
        id: 'sel-activity',
        title: 'SEL Activity',
        toolId: 'sel-activity',
        content: 'Generate ready-to-use SEL activities aligned to all 5 CASEL competencies: Self-Awareness, Self-Management, Social Awareness, Relationship Skills, and Responsible Decision-Making.',
        steps: [
          'Select the CASEL competency',
          'Choose grade level band (K-2, 3-5, 6-8, 9-12)',
          'Select activity format (discussion, journaling, role play, etc.)',
          'Enter any specific context or theme',
          'Generate the activity with facilitation guide',
        ],
        tips: ['Activities include a debrief section — always use it to solidify learning', 'Pair with the SEL Worksheet tool for a complete lesson'],
      },
      {
        id: 'sel-checkin',
        title: 'SEL Check-In & Early Warning',
        toolId: 'sel-checkin',
        content: 'Track student emotional check-ins over time and receive automatic Tier 2 flags when a student shows consistent distress patterns.',
        steps: [
          'Enter check-in data for your class',
          'The system tracks trends across multiple check-ins',
          'Review the Early Warning panel for flagged students',
          'Use suggested Tier 2 interventions for flagged students',
          'Document follow-up actions',
        ],
        tips: ['Consistency matters — daily or weekly check-ins are more useful than occasional ones', 'Flags are suggestions, not diagnoses — always apply your professional judgment'],
      },
    ],
  },
  instructional: {
    id: 'instructional',
    title: 'Lesson Planning & Prep',
    icon: '📚',
    color: 'indigo',
    description: 'Tools for lesson plans, differentiation, assessments, and PD presentations.',
    articles: [
      {
        id: 'lesson-plan',
        title: 'Lesson Plan',
        toolId: 'lesson-plan',
        content: 'Generate complete, standards-aligned lesson plans with objectives, materials, instructional sequence, and assessment.',
        steps: [
          'Enter the subject, grade level, and topic',
          'Paste or type the standard(s) being addressed',
          'Select lesson duration',
          'Add any specific requirements or constraints',
          'Generate the full lesson plan',
        ],
        tips: ['The more specific your standard and topic, the better the alignment', 'Use the Differentiation Engine to create tiered versions after generating'],
      },
      {
        id: 'pd-generator',
        title: 'PD Generator',
        toolId: 'pd-generator',
        content: 'Generate complete, research-grounded professional development presentations with speaker notes, activities, and resources. Export as PowerPoint or save to Google Slides.',
        steps: [
          'Enter the PD title and select a topic category',
          'Choose your audience and duration',
          'Optionally enter specific learning objectives',
          'Choose Quick Export (ready to present) or Draft & Edit mode',
          'Generate — then download as .pptx or save to Google Drive',
        ],
        tips: ['Click "Show Notes" to see detailed presenter notes for every slide', 'All content is research-grounded with citations — check the Resources slide for references', 'The Demo button shows a complete trauma-informed PD example'],
      },
    ],
  },
}

const FAQ_ITEMS = [
  { q: 'Is this really free?', a: 'Teacher AI Assistant is free for members of the Thrive & Learn Online Skool community. Membership is $9/month and gives you full access to all 59 tools plus the community. There are no additional fees or hidden charges beyond the membership.' },
  { q: 'Is my data private?', a: 'Yes. We use a placeholder system ([Student Name], [Parent Name]) so real student data never enters the AI. Your documents are saved to your personal account and are never shared or sold.' },
  { q: 'Do I need to know how to use AI?', a: 'Not at all. Every tool has clearly labeled inputs — you just fill in the fields and click Generate. No prompting knowledge needed.' },
  { q: 'Can I edit the generated content?', a: 'Yes. All output is fully editable. You can modify the text directly in the tool before copying or exporting.' },
  { q: 'What file formats can I export to?', a: 'Most tools support .docx export (Microsoft Word). The PD Generator also exports to .pptx (PowerPoint). You can also save any document directly to Google Drive.' },
  { q: 'How do I save my work?', a: 'Documents are automatically saved to your Saved Documents library after generation. You can also export as .docx, copy to clipboard, or save to Google Drive.' },
  { q: 'Can I use this for IEP documentation?', a: 'Yes — the IEP & Compliance category includes tools for PLOPs, measurable goals, FBAs, BIPs, and batch IEP progress updates. Always have a qualified specialist review IEP documents before finalizing.' },
  { q: 'What is AXEL?', a: 'AXEL is our AI assistant (the axolotl mascot 🦎). You can ask AXEL questions about education, get help choosing the right tool, or brainstorm ideas.' },
  { q: 'How do I connect Google Drive?', a: 'Click the "Save to Google Drive" button on any tool output. You\'ll be prompted to sign in with your Google account. Once connected, you can save any document directly to your Drive.' },
  { q: 'Can I use this on my phone?', a: 'Yes — the platform is mobile-responsive and works on any device with a browser.' },
]

const COLOR_MAP = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', header: 'bg-purple-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', header: 'bg-blue-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', header: 'bg-green-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700', header: 'bg-teal-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', header: 'bg-indigo-600' },
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('getting-started')
  const [activeArticle, setActiveArticle] = useState('welcome')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackName, setFeedbackName] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const articleRef = useRef(null)

  const allSections = [
    HELP_CONTENT.gettingStarted,
    HELP_CONTENT.communication,
    HELP_CONTENT.grading,
    HELP_CONTENT.compliance,
    HELP_CONTENT.sel,
    HELP_CONTENT.instructional,
  ]

  // Search across all articles
  const searchResults = searchQuery.length > 1
    ? allSections.flatMap(section =>
        section.articles
          .filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (article.steps || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map(article => ({ ...article, sectionId: section.id, sectionTitle: section.title, sectionIcon: section.icon, sectionColor: section.color }))
      )
    : []

  const currentSection = allSections.find(s => s.id === activeSection) || allSections[0]
  const currentArticle = currentSection?.articles.find(a => a.id === activeArticle) || currentSection?.articles[0]

  const handleSelectArticle = (sectionId, articleId) => {
    setActiveSection(sectionId)
    setActiveArticle(articleId)
    setSearchQuery('')
    setTimeout(() => articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleSendFeedback = async () => {
    if (!feedbackMessage) return
    setSending(true)
    // Simulate send — in production wire to /api/send-feedback
    await new Promise(r => setTimeout(r, 1000))
    setFeedbackSent(true)
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
              <span>←</span>
              <span className="text-sm">Dashboard</span>
            </button>
            <span className="text-gray-200">|</span>
            <h1 className="text-lg font-bold text-gray-800">Help Center</h1>
          </div>
          <div className="text-sm text-gray-500">59 tools · support@thriveandlearnonline.com</div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🦎</div>
          <h2 className="text-3xl font-bold mb-2">How can we help you?</h2>
          <p className="text-purple-200 mb-6">Search our help articles or browse by category below</p>
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-700 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-base"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.length > 1 && (
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-sm text-gray-500 mb-4">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500">No articles found. Try a different search term or <button onClick={() => setFeedbackMessage(`I searched for "${searchQuery}" and couldn't find what I needed. `)} className="text-purple-600 underline">send us feedback</button>.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(result => {
                const colors = COLOR_MAP[result.sectionColor] || COLOR_MAP.purple
                return (
                  <button key={result.id} onClick={() => handleSelectArticle(result.sectionId, result.id)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-purple-300 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                        {result.sectionIcon} {result.sectionTitle}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mt-2">{result.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.content}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-6">

            {/* Sidebar */}
            <aside className="w-64 shrink-0 space-y-1 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-6">
              {allSections.map(section => {
                const colors = COLOR_MAP[section.color] || COLOR_MAP.purple
                const isActive = activeSection === section.id
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => { setActiveSection(section.id); setActiveArticle(section.articles[0].id) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${isActive ? `${colors.bg} ${colors.text}` : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span>{section.icon}</span>
                      {section.title}
                    </button>
                    {isActive && (
                      <div className="ml-4 mt-1 space-y-0.5">
                        {section.articles.map(article => (
                          <button key={article.id}
                            onClick={() => handleSelectArticle(section.id, article.id)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${activeArticle === article.id ? `${colors.text} font-semibold bg-white shadow-sm` : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}>
                            {article.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button onClick={() => setActiveSection('faq')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeSection === 'faq' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <span>❓</span> FAQ
                </button>
                <button onClick={() => setActiveSection('contact')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeSection === 'contact' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <span>📬</span> Contact & Feedback
                </button>
              </div>
            </aside>

            {/* Article Content */}
            <main className="flex-1 min-w-0" ref={articleRef}>

              {/* Getting Started Video Placeholder */}
              {activeSection === 'getting-started' && activeArticle === 'welcome' && (
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 mb-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🎬</span>
                    <div>
                      <h3 className="font-bold text-lg">Getting Started Video</h3>
                      <p className="text-purple-200 text-sm">A quick walkthrough of the platform — coming soon!</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-white/30">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">▶</span>
                      </div>
                      <p className="text-white/80 text-sm">Video walkthrough coming soon</p>
                      <p className="text-white/60 text-xs mt-1">In the meantime, follow the steps below</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular article */}
              {activeSection !== 'faq' && activeSection !== 'contact' && currentArticle && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Article header */}
                  <div className={`${COLOR_MAP[currentSection?.color]?.header || 'bg-purple-600'} px-8 py-6`}>
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                      <span>{currentSection?.icon}</span>
                      <span>{currentSection?.title}</span>
                      <span>›</span>
                      <span>{currentArticle.title}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{currentArticle.title}</h2>
                    {currentArticle.toolId && (
                      <button onClick={() => router.push(`/dashboard/${currentArticle.toolId}`)}
                        className="mt-3 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Open this tool →
                      </button>
                    )}
                  </div>

                  <div className="p-8">
                    {/* Content */}
                    <div className="prose prose-gray max-w-none mb-8">
                      {currentArticle.content.split('\n').map((line, i) => (
                        line.trim() === '' ? <br key={i} /> :
                        line.startsWith('•') ? (
                          <div key={i} className="flex items-start gap-2 mb-2">
                            <span className="text-purple-500 mt-0.5 shrink-0">▸</span>
                            <span className="text-gray-700">{line.substring(1).trim()}</span>
                          </div>
                        ) : (
                          <p key={i} className="text-gray-700 leading-relaxed mb-3">{line}</p>
                        )
                      ))}
                    </div>

                    {/* Steps */}
                    {currentArticle.steps && currentArticle.steps.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                          How to use it
                        </h3>
                        <div className="space-y-3">
                          {currentArticle.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                {i + 1}
                              </span>
                              <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips */}
                    {currentArticle.tips && currentArticle.tips.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="text-amber-800 font-semibold mb-3 flex items-center gap-2">
                          <span>💡</span> Pro Tips
                        </h3>
                        <ul className="space-y-2">
                          {currentArticle.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-amber-900 text-sm">
                              <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Article navigation */}
                  <div className="border-t border-gray-100 px-8 py-4 flex items-center justify-between bg-gray-50">
                    <div className="text-sm text-gray-500">Was this helpful?</div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:border-green-300 hover:bg-green-50 transition-colors">👍 Yes</button>
                      <button onClick={() => { setActiveSection('contact'); setFeedbackMessage('I need more help with: ') }}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:border-red-300 hover:bg-red-50 transition-colors">
                        👎 No — I need more help
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {activeSection === 'faq' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-amber-500 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
                    <p className="text-amber-100 mt-1">Quick answers to the most common questions</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {FAQ_ITEMS.map((item, i) => (
                      <div key={i}>
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="w-full text-left px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-800 pr-4">{item.q}</span>
                          <span className={`text-gray-400 transition-transform shrink-0 ${expandedFaq === i ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {expandedFaq === i && (
                          <div className="px-8 pb-5">
                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeSection === 'contact' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-pink-500 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Contact & Feedback</h2>
                    <p className="text-pink-100 mt-1">We read every message and typically respond within 1-2 business days</p>
                  </div>
                  <div className="p-8">
                    {feedbackSent ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Message sent!</h3>
                        <p className="text-gray-500">Thank you for your feedback. We'll get back to you at the email you provided.</p>
                        <button onClick={() => { setFeedbackSent(false); setFeedbackMessage(''); setFeedbackName(''); setFeedbackEmail('') }}
                          className="mt-6 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <div className="max-w-lg">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
                          📧 You can also reach us directly at <strong>support@thriveandlearnonline.com</strong>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input type="text" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)}
                              placeholder="Optional"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                            <input type="email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)}
                              placeholder="So we can get back to you"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                            <textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)}
                              placeholder="Tell us what you need help with, what's not working, or share a feature idea..."
                              rows={5}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                          </div>
                          <button onClick={handleSendFeedback} disabled={sending || !feedbackMessage}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-3 rounded-xl transition-colors">
                            {sending ? 'Sending...' : '📬 Send Message'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category overview when no article selected */}
              {activeSection !== 'faq' && activeSection !== 'contact' && !currentArticle && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentSection?.title}</h2>
                  <p className="text-gray-500 mb-6">{currentSection?.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSection?.articles.map(article => (
                      <button key={article.id} onClick={() => setActiveArticle(article.id)}
                        className="text-left p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all">
                        <h3 className="font-semibold text-gray-800 mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{article.content}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  )
}