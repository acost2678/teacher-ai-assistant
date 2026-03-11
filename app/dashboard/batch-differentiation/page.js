'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

// ─── Constants ───────────────────────────────────────────────────────────────

const GRADE_LEVELS = ['Kindergarten','1st Grade','2nd Grade','3rd Grade','4th Grade','5th Grade',
  '6th Grade','7th Grade','8th Grade','9th Grade','10th Grade','11th Grade','12th Grade']

const SUBJECTS = ['English Language Arts','Mathematics','Science','Social Studies','Writing','Reading']

const ASSIGNMENT_TYPES = [
  { id: 'worksheet',      name: 'Worksheet/Questions' },
  { id: 'writing-prompt', name: 'Writing Prompt' },
  { id: 'project',        name: 'Project/Task' },
  { id: 'assessment',     name: 'Assessment/Quiz' },
  { id: 'activity',       name: 'Activity/Game' },
  { id: 'homework',       name: 'Homework' },
]

const ACCOMMODATION_OPTIONS = [
  { id: 'extended-time',        label: 'Extended Time',           icon: '⏱️' },
  { id: 'reduced-items',        label: 'Reduced # of Items',      icon: '📝' },
  { id: 'graphic-organizer',    label: 'Graphic Organizer',       icon: '🗂️' },
  { id: 'word-bank',            label: 'Word Bank',               icon: '📋' },
  { id: 'sentence-starters',    label: 'Sentence Starters',       icon: '✏️' },
  { id: 'preferential-seating', label: 'Preferential Seating',    icon: '🪑' },
  { id: 'read-aloud',           label: 'Read Aloud Support',      icon: '🔊' },
  { id: 'chunking',             label: 'Task Chunking',           icon: '🧩' },
]

const MODALITY_OPTIONS = [
  { id: 'visual-supports',  label: 'Visual Supports',         icon: '🖼️',  desc: 'Diagrams, icons, picture cues' },
  { id: 'ell-frames',       label: 'ELL Sentence Frames',     icon: '🌎',  desc: 'Language scaffolds for ELL students' },
  { id: 'exec-chunking',    label: 'Executive Function Chunking', icon: '🧠', desc: 'Step-by-step breakdowns, checklists' },
  { id: 'iep-simplify',     label: 'IEP Complexity Reduction', icon: '♿', desc: 'Simplified syntax, shorter sentences' },
]

const TIER_META = {
  below: { label: 'Approaching',    lexile: '2–3 levels below',  desc: 'Scaffolded support, simplified language', color: 'blue',   icon: '📘', border: 'border-blue-300',   bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'focus:ring-blue-400'   },
  on:    { label: 'On Grade Level', lexile: 'At grade level',    desc: 'Standard expectations',                  color: 'green',  icon: '📗', border: 'border-green-300',  bg: 'bg-green-50',  text: 'text-green-700',  ring: 'focus:ring-green-400'  },
  above: { label: 'Above',          lexile: '1–2 levels above',  desc: 'Extended challenge, deeper thinking',    color: 'purple', icon: '📕', border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'focus:ring-purple-400' },
}

const LANGUAGES = [
  'Spanish','French','Portuguese','Mandarin','Arabic','Vietnamese',
  'Haitian Creole','Somali','Russian','Korean','Tagalog','Hindi',
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function BatchDifferentiationPage() {
  const router = useRouter()

  // Auth
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // UI state
  const [activeTab,    setActiveTab]    = useState('input')   // 'input' | 'output'
  const [viewMode,     setViewMode]     = useState('single')  // 'single' | 'sidebyside'
  const [selectedTier, setSelectedTier] = useState('on')
  const [generating,   setGenerating]   = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [showDemo,     setShowDemo]     = useState(false)

  // Assignment settings
  const [gradeLevel,      setGradeLevel]      = useState('5th Grade')
  const [subject,         setSubject]         = useState('English Language Arts')
  const [assignmentType,  setAssignmentType]  = useState('worksheet')

  // Assignment input
  const [originalAssignment, setOriginalAssignment] = useState('')
  const [learningObjective,  setLearningObjective]  = useState('')
  const [additionalNotes,    setAdditionalNotes]    = useState('')

  // Tier toggles
  const [generateBelow, setGenerateBelow] = useState(true)
  const [generateOn,    setGenerateOn]    = useState(true)
  const [generateAbove, setGenerateAbove] = useState(true)

  // NEW: Accommodations & modalities
  const [selectedAccommodations, setSelectedAccommodations] = useState([])
  const [selectedModalities,     setSelectedModalities]     = useState([])

  // NEW: Translation / cultural adaptation
  const [enableTranslation,    setEnableTranslation]    = useState(false)
  const [targetLanguage,       setTargetLanguage]       = useState('Spanish')
  const [culturalAdaptation,   setCulturalAdaptation]   = useState(false)

  // Output
  const [generatedTiers, setGeneratedTiers] = useState(null)
  const [editedTiers,    setEditedTiers]    = useState({ below: '', on: '', above: '' })

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else router.push('/auth/login')
    }
    checkSession()
  }, [router])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toggleItem = (list, setList, id) =>
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  // ── Demo ────────────────────────────────────────────────────────────────────
  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('English Language Arts')
    setAssignmentType('worksheet')
    setOriginalAssignment(`Reading Comprehension: "The Water Cycle"\n\nRead the passage about the water cycle and answer the following questions.\n\n1. What are the four main stages of the water cycle? Explain each one in 2-3 sentences.\n\n2. How does the sun contribute to the water cycle? Use evidence from the text.\n\n3. Compare and contrast evaporation and condensation.\n\n4. Write a paragraph explaining why the water cycle is important for life on Earth.\n\n5. Create a diagram of the water cycle with labels and arrows showing the direction of water movement.`)
    setLearningObjective('Students will understand the stages of the water cycle and explain how they connect to each other.')
    setAdditionalNotes('Some students have reading IEPs. Advanced students are ready for extension activities.')
    setSelectedAccommodations(['graphic-organizer', 'word-bank', 'chunking'])
    setSelectedModalities(['visual-supports', 'iep-simplify'])
    setEnableTranslation(false)
    setGenerateBelow(true); setGenerateOn(true); setGenerateAbove(true)
    setGeneratedTiers(null); setActiveTab('input'); setShowDemo(true)
  }

  const handleResetDemo = () => {
    setOriginalAssignment(''); setLearningObjective(''); setAdditionalNotes('')
    setSelectedAccommodations([]); setSelectedModalities([])
    setEnableTranslation(false); setCulturalAdaptation(false); setTargetLanguage('Spanish')
    setGenerateBelow(true); setGenerateOn(true); setGenerateAbove(true)
    setGeneratedTiers(null); setEditedTiers({ below: '', on: '', above: '' })
    setActiveTab('input'); setShowDemo(false)
  }

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!originalAssignment.trim()) { alert('Please enter the original assignment'); return }
    if (!generateBelow && !generateOn && !generateAbove) { alert('Please select at least one tier to generate'); return }

    setGenerating(true); setGeneratedTiers(null)

    try {
      const res  = await fetch('/api/batch-differentiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, assignmentType,
          originalAssignment, learningObjective, additionalNotes,
          generateBelow, generateOn, generateAbove,
          // NEW fields passed to API
          accommodations:      selectedAccommodations,
          modalities:          selectedModalities,
          enableTranslation,
          targetLanguage:      enableTranslation ? targetLanguage : null,
          culturalAdaptation:  enableTranslation ? culturalAdaptation : false,
        }),
      })

      const data = await res.json()
      if (data.error) { alert(`Error: ${data.error}`) }
      else {
        setGeneratedTiers(data.tiers)
        setEditedTiers({ below: data.tiers.below || '', on: data.tiers.on || '', above: data.tiers.above || '' })
        setActiveTab('output')
        setSelectedTier(generateBelow ? 'below' : generateOn ? 'on' : 'above')
      }
    } catch { alert('Error generating differentiated assignments. Please try again.') }

    setGenerating(false)
  }

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExportAll = async () => {
    if (!generatedTiers) return
    setExporting(true)
    try {
      let content = `DIFFERENTIATED ASSIGNMENT\n${subject} | ${gradeLevel}\nType: ${assignmentType}\nGenerated: ${new Date().toLocaleDateString()}\n${'='.repeat(60)}\n\n`
      if (learningObjective) content += `LEARNING OBJECTIVE:\n${learningObjective}\n\n${'='.repeat(60)}\n\n`
      if (selectedAccommodations.length) content += `ACCOMMODATIONS APPLIED:\n${selectedAccommodations.join(', ')}\n\n`
      if (selectedModalities.length)     content += `MODALITY SUPPORTS:\n${selectedModalities.join(', ')}\n\n`
      if (enableTranslation)             content += `LANGUAGE: ${targetLanguage}${culturalAdaptation ? ' (culturally adapted)' : ''}\n\n`
      content += `${'='.repeat(60)}\n\n`
      if (editedTiers.below) content += `--- TIER 1: APPROACHING GRADE LEVEL (${TIER_META.below.lexile}) ---\n\n${editedTiers.below}\n\n${'='.repeat(60)}\n\n`
      if (editedTiers.on)    content += `--- TIER 2: ON GRADE LEVEL (${TIER_META.on.lexile}) ---\n\n${editedTiers.on}\n\n${'='.repeat(60)}\n\n`
      if (editedTiers.above) content += `--- TIER 3: ABOVE GRADE LEVEL (${TIER_META.above.lexile}) ---\n\n${editedTiers.above}\n\n${'='.repeat(60)}\n\n`

      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Differentiated Assignment - ${subject}`, content, toolName: 'Batch Differentiation' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url  = window.URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `Differentiated_${assignmentType}_${new Date().toISOString().split('T')[0]}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopyTier = (tier) => {
    navigator.clipboard.writeText(editedTiers[tier])
    alert(`${TIER_META[tier].label} tier copied!`)
  }
  const handleCopyAll = () => {
    const content = Object.entries(editedTiers)
      .filter(([, v]) => v)
      .map(([k, v]) => `=== ${TIER_META[k].label.toUpperCase()} ===\n\n${v}`)
      .join('\n\n')
    navigator.clipboard.writeText(content)
    alert('All tiers copied to clipboard!')
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Batch Differentiation</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Title Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📚</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch Differentiation</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Input ONE assignment → Get THREE tiered versions with accommodations built in. Same learning objective, different access points.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h3 className="text-blue-800 font-medium">How It Works</h3>
                <p className="text-blue-700 text-sm">All three tiers target the SAME learning objective. Specify accommodations and modality supports below — they are woven directly into each tier's output rather than listed as afterthoughts.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!showDemo
              ? <button onClick={handleShowDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"><span>✨</span> See Demo</button>
              : <button onClick={handleResetDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"><span>↺</span> Reset Demo</button>
            }
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
            1. Original Assignment
          </button>
          <button onClick={() => setActiveTab('output')} disabled={!generatedTiers}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
            2. Differentiated Tiers
          </button>
        </div>

        {/* ════════════════════════════════════════════
            INPUT TAB
        ════════════════════════════════════════════ */}
        {activeTab === 'input' && (
          <div className="space-y-6">

            {/* Assignment Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Assignment Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Grade Level', value: gradeLevel, setter: setGradeLevel, options: GRADE_LEVELS.map(g => ({ id: g, name: g })) },
                  { label: 'Subject',     value: subject,     setter: setSubject,     options: SUBJECTS.map(s => ({ id: s, name: s })) },
                  { label: 'Assignment Type', value: assignmentType, setter: setAssignmentType, options: ASSIGNMENT_TYPES },
                ].map(({ label, value, setter, options }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <select value={value} onChange={e => setter(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Original Assignment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Original Assignment</h2>
              <textarea value={originalAssignment} onChange={e => setOriginalAssignment(e.target.value)}
                placeholder="Paste or type your original assignment here. Include all questions, instructions, and requirements..."
                rows={10} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            {/* Learning Objective */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Learning Objective</h2>
              <p className="text-sm text-gray-500 mb-4">What should ALL students be able to do after completing this assignment?</p>
              <textarea value={learningObjective} onChange={e => setLearningObjective(e.target.value)}
                placeholder="e.g., Students will be able to identify the main idea and supporting details in an informational text."
                rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            {/* ── NEW: Accommodations Checklist ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">IEP / 504 Accommodations</h2>
                <p className="text-sm text-gray-500 mt-1">Select applicable accommodations — these will be woven into the <span className="font-medium text-blue-600">Approaching</span> tier output automatically.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ACCOMMODATION_OPTIONS.map(opt => {
                  const active = selectedAccommodations.includes(opt.id)
                  return (
                    <button key={opt.id} onClick={() => toggleItem(selectedAccommodations, setSelectedAccommodations, opt.id)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all text-sm font-medium ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                      <span>{opt.icon}</span>{opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── NEW: Modality Scaffolding ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Modality Scaffolding</h2>
                <p className="text-sm text-gray-500 mt-1">Select supports to embed across tiers beyond reading level adjustment.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODALITY_OPTIONS.map(opt => {
                  const active = selectedModalities.includes(opt.id)
                  return (
                    <button key={opt.id} onClick={() => toggleItem(selectedModalities, setSelectedModalities, opt.id)}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${active ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      <span className="text-xl mt-0.5">{opt.icon}</span>
                      <div>
                        <span className={`font-medium text-sm block ${active ? 'text-purple-700' : 'text-gray-700'}`}>{opt.label}</span>
                        <span className="text-xs text-gray-500">{opt.desc}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── NEW: Translation & Cultural Adaptation ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Translation & Cultural Adaptation</h2>
                  <p className="text-sm text-gray-500 mt-1">Generate output in another language with optional cultural responsiveness rewrite.</p>
                </div>
                <button onClick={() => setEnableTranslation(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableTranslation ? 'bg-purple-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableTranslation ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {enableTranslation && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                    <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}
                      className="w-full md:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all w-full md:w-auto ${culturalAdaptation ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={culturalAdaptation} onChange={e => setCulturalAdaptation(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <div>
                      <span className="font-medium text-gray-800 block">Cultural Adaptation</span>
                      <span className="text-xs text-gray-500">Rewrite examples, names, and contexts to be culturally relevant — not just a literal translation.</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Tier Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Tiers</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'below', state: generateBelow, setter: setGenerateBelow },
                  { key: 'on',    state: generateOn,    setter: setGenerateOn    },
                  { key: 'above', state: generateAbove, setter: setGenerateAbove },
                ].map(({ key, state, setter }) => {
                  const m = TIER_META[key]
                  return (
                    <label key={key} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${state ? `${m.border} ${m.bg}` : 'border-gray-200'}`}>
                      <input type="checkbox" checked={state} onChange={e => setter(e.target.checked)}
                        className={`w-5 h-5 rounded border-gray-300 focus:ring-${m.color}-500 mt-0.5`} />
                      <div>
                        <span className="font-medium text-gray-800 block">{m.icon} {m.label}</span>
                        <span className={`text-xs font-medium ${m.text}`}>{m.lexile}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Additional Notes (Optional)</h2>
              <p className="text-sm text-gray-500 mb-3">Anything not captured above — specific student context, pacing notes, etc.</p>
              <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
                placeholder="e.g., Two students are newcomers with very limited English. Advanced group is working on argument writing."
                rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base">
              {generating
                ? <><span className="animate-spin">⏳</span> Generating differentiated tiers...</>
                : <><span>✨</span> Generate Differentiated Assignments</>
              }
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════
            OUTPUT TAB
        ════════════════════════════════════════════ */}
        {activeTab === 'output' && generatedTiers && (
          <div className="space-y-6">

            {/* Output Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Differentiated Tiers</h2>
                  <p className="text-gray-500 text-sm">Same objective, different pathways. Edit as needed.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">

                  {/* ── NEW: View Mode Toggle ── */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                    <button onClick={() => setViewMode('single')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'single' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>
                      ▣ Single
                    </button>
                    <button onClick={() => setViewMode('sidebyside')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'sidebyside' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>
                      ⊟ Side by Side
                    </button>
                  </div>

                  <button onClick={handleCopyAll} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm">
                    📋 Copy All
                  </button>
                  <button onClick={handleExportAll} disabled={exporting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm">
                    {exporting ? 'Exporting...' : '📄 Export All (.docx)'}
                  </button>
                </div>
              </div>

              {/* Applied tags summary */}
              {(selectedAccommodations.length > 0 || selectedModalities.length > 0 || enableTranslation) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {selectedAccommodations.map(id => {
                    const opt = ACCOMMODATION_OPTIONS.find(o => o.id === id)
                    return <span key={id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{opt.icon} {opt.label}</span>
                  })}
                  {selectedModalities.map(id => {
                    const opt = MODALITY_OPTIONS.find(o => o.id === id)
                    return <span key={id} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{opt.icon} {opt.label}</span>
                  })}
                  {enableTranslation && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🌎 {targetLanguage}{culturalAdaptation ? ' + Cultural Adapt.' : ''}</span>
                  )}
                </div>
              )}
            </div>

            {/* ── SINGLE VIEW ── */}
            {viewMode === 'single' && (
              <div className="grid grid-cols-4 gap-6">
                {/* Tier Selector */}
                <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <h3 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">Tiers</h3>
                  <div className="space-y-2">
                    {(['below','on','above']).filter(k => (k === 'below' ? generateBelow : k === 'on' ? generateOn : generateAbove)).map(key => {
                      const m = TIER_META[key]
                      return (
                        <button key={key} onClick={() => setSelectedTier(key)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all border-2 ${selectedTier === key ? `${m.bg} ${m.text} ${m.border}` : 'hover:bg-gray-100 text-gray-700 border-transparent'}`}>
                          <div className="flex items-center gap-2">
                            <span>{m.icon}</span>
                            <div>
                              <span className="font-medium block text-sm">{m.label}</span>
                              <span className={`text-xs ${selectedTier === key ? m.text : 'text-gray-400'}`}>{m.lexile}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tier Content */}
                <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{TIER_META[selectedTier].icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{TIER_META[selectedTier].label}</h3>
                        <span className={`text-xs font-medium ${TIER_META[selectedTier].text}`}>{TIER_META[selectedTier].lexile} · {TIER_META[selectedTier].desc}</span>
                      </div>
                    </div>
                    <button onClick={() => handleCopyTier(selectedTier)} className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium">📋 Copy</button>
                  </div>
                  <textarea value={editedTiers[selectedTier]}
                    onChange={e => setEditedTiers(prev => ({ ...prev, [selectedTier]: e.target.value }))}
                    rows={20} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>
              </div>
            )}

            {/* ── SIDE BY SIDE VIEW ── */}
            {viewMode === 'sidebyside' && (
              <div className={`grid gap-4 ${[generateBelow, generateOn, generateAbove].filter(Boolean).length === 3 ? 'grid-cols-3' : [generateBelow, generateOn, generateAbove].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {(['below','on','above']).filter(k => (k === 'below' ? generateBelow : k === 'on' ? generateOn : generateAbove)).map(key => {
                  const m = TIER_META[key]
                  return (
                    <div key={key} className={`bg-white rounded-2xl border-2 ${m.border} shadow-sm p-4 flex flex-col`}>
                      {/* Tier Header */}
                      <div className={`flex items-center justify-between mb-3 pb-3 border-b ${m.border}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.icon}</span>
                          <div>
                            <span className={`font-semibold text-sm ${m.text}`}>{m.label}</span>
                            <p className="text-xs text-gray-400">{m.lexile}</p>
                          </div>
                        </div>
                        <button onClick={() => handleCopyTier(key)} className={`text-xs px-2 py-1 rounded-lg font-medium ${m.bg} ${m.text} hover:opacity-80 transition-opacity`}>📋 Copy</button>
                      </div>
                      {/* Editable content */}
                      <textarea value={editedTiers[key]}
                        onChange={e => setEditedTiers(prev => ({ ...prev, [key]: e.target.value }))}
                        className={`flex-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${m.ring} text-gray-700 resize-none text-xs leading-relaxed`}
                        style={{ minHeight: '520px' }} />
                    </div>
                  )
                })}
              </div>
            )}

            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium text-sm">← Back to Original Assignment</button>
          </div>
        )}
      </main>
    </div>
  )
}