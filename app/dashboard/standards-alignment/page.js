'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StandardsSelector from '../../../components/StandardsSelector' 

// ─── Mode definitions ─────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'tag',
    icon: '🏷️',
    label: 'Tag My Content',
    desc: 'Paste existing content and get standards tags applied automatically',
    color: 'blue',
  },
  {
    id: 'generate',
    icon: '✨',
    label: 'Generate From Standard',
    desc: 'Pick a standard first — get ready-to-use content generated from it',
    color: 'purple',
  },
  {
    id: 'report',
    icon: '📄',
    label: 'Alignment Report',
    desc: 'Export a standards alignment summary for admin or district review',
    color: 'green',
  },
]

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700',   btn: 'bg-blue-600 hover:bg-blue-700'   },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-700',  btn: 'bg-green-600 hover:bg-green-700'  },
}

const CONTENT_TYPES = [
  'Lesson Plan', 'Assessment / Quiz', 'Worksheet', 'Writing Prompt',
  'Rubric', 'SEL Activity', 'Exit Ticket', 'Project / Task',
]

const GRADE_LEVELS = ['Kindergarten','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th']

// ─── Component ────────────────────────────────────────────────────────────────
export default function StandardsAlignmentPage() {
  const router = useRouter()

  const [activeMode,         setActiveMode]         = useState('tag')
  const [selectedStandards,  setSelectedStandards]  = useState([])
  const [generating,         setGenerating]         = useState(false)
  const [exporting,          setExporting]          = useState(false)
  const [result,             setResult]             = useState(null)
  const [activeOutputTab,    setActiveOutputTab]    = useState('tagged') // 'tagged' | 'report'

  // Tag mode
  const [pastedContent,  setPastedContent]  = useState('')
  const [contentType,    setContentType]    = useState('Lesson Plan')
  const [gradeLevel,     setGradeLevel]     = useState('5th')

  // Generate mode
  const [generateType,   setGenerateType]   = useState('Lesson Plan')
  const [generateGrade,  setGenerateGrade]  = useState('5th')
  const [generateNotes,  setGenerateNotes]  = useState('')

  // Report mode
  const [reportTitle,    setReportTitle]    = useState('')
  const [reportTool,     setReportTool]     = useState('')
  const [reportNotes,    setReportNotes]    = useState('')

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (selectedStandards.length === 0 && activeMode !== 'tag') {
      alert('Please select at least one standard first.')
      return
    }
    if (activeMode === 'tag' && !pastedContent.trim()) {
      alert('Please paste your content to tag.')
      return
    }

    setGenerating(true)
    setResult(null)

    try {
      const res = await fetch('/api/standards-alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          selectedStandards,
          // Tag mode
          pastedContent,
          contentType,
          gradeLevel,
          // Generate mode
          generateType,
          generateGrade,
          generateNotes,
          // Report mode
          reportTitle,
          reportTool,
          reportNotes,
        }),
      })

      const data = await res.json()
      if (data.error) { alert(`Error: ${data.error}`); return }
      setResult(data)
      setActiveOutputTab(activeMode === 'report' ? 'report' : 'tagged')
    } catch { alert('Error processing request. Please try again.') }

    setGenerating(false)
  }

  const handleExport = async () => {
    if (!result) return
    setExporting(true)
    try {
      const content = activeMode === 'report' ? result.report : (result.taggedContent || result.generatedContent)
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeMode === 'report'
            ? `Standards Alignment Report — ${reportTitle || contentType}`
            : `Standards-Aligned ${contentType}`,
          content,
          toolName: 'Standards Alignment',
        }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url  = window.URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url
        a.download = `Standards_Alignment_${new Date().toISOString().split('T')[0]}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch { alert('Export failed. Please try again.') }
    setExporting(false)
  }

  const handleCopy = () => {
    const text = activeMode === 'report' ? result?.report : (result?.taggedContent || result?.generatedContent)
    if (text) { navigator.clipboard.writeText(text); alert('Copied to clipboard!') }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Standards Alignment</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Title */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📐</span>
            <h1 className="text-2xl font-semibold text-gray-800">Standards Alignment</h1>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">DISTRICT READY</span>
          </div>
          <p className="text-gray-500">Tag existing content, generate standard-first resources, or export alignment reports for admin and district review — across CCSS, CASEL, NGSS, and state frameworks.</p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {MODES.map(m => {
            const c = COLOR_MAP[m.color]
            const active = activeMode === m.id
            return (
              <button key={m.id} onClick={() => { setActiveMode(m.id); setResult(null) }}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${active ? `${c.bg} ${c.border}` : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="text-3xl mb-2">{m.icon}</div>
                <div className={`font-semibold text-sm mb-1 ${active ? c.text : 'text-gray-700'}`}>{m.label}</div>
                <div className="text-xs text-gray-500 leading-snug">{m.desc}</div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Input panel ── */}
          <div className="space-y-5">

            {/* Standards Selector — always visible */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-1">
                {activeMode === 'tag' ? 'Standards to Check Against' : activeMode === 'generate' ? 'Standard to Generate From' : 'Standards to Include in Report'}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {activeMode === 'tag'
                  ? 'Select the standards you want the AI to check your content against and tag.'
                  : activeMode === 'generate'
                  ? 'Select the standard(s) you want to build content around.'
                  : 'Select all standards to include in the alignment report.'}
              </p>
              <StandardsSelector
                selectedStandards={selectedStandards}
                onStandardsChange={setSelectedStandards}
                allowMultiple={true}
              />
            </div>

            {/* ── TAG MODE: Paste content ── */}
            {activeMode === 'tag' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Your Content</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Content Type</label>
                    <select value={contentType} onChange={e => setContentType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700">
                      {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Grade Level</label>
                    <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700">
                      {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <textarea value={pastedContent} onChange={e => setPastedContent(e.target.value)}
                  placeholder="Paste your lesson plan, assessment, worksheet, or other content here..."
                  rows={12} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 resize-none text-sm" />
              </div>
            )}

            {/* ── GENERATE MODE: Settings ── */}
            {activeMode === 'generate' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Content Settings</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Content Type</label>
                    <select value={generateType} onChange={e => setGenerateType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700">
                      {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Grade Level</label>
                    <select value={generateGrade} onChange={e => setGenerateGrade(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700">
                      {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <textarea value={generateNotes} onChange={e => setGenerateNotes(e.target.value)}
                  placeholder="Any additional context? (e.g., class needs, unit theme, format preferences...)"
                  rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 resize-none text-sm" />
              </div>
            )}

            {/* ── REPORT MODE: Settings ── */}
            {activeMode === 'report' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Report Details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Report Title</label>
                    <input value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                      placeholder="e.g., Q2 SEL Curriculum Alignment — Grades 3-5"
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Tool / Curriculum Being Aligned</label>
                    <input value={reportTool} onChange={e => setReportTool(e.target.value)}
                      placeholder="e.g., Teacher AI Assistant — SEL & Student Support Tools"
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Additional Notes for Reviewers</label>
                    <textarea value={reportNotes} onChange={e => setReportNotes(e.target.value)}
                      placeholder="Context for the administrator or school board reviewing this report..."
                      rows={4} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Run Button */}
            <button onClick={handleRun} disabled={generating}
              className={`w-full text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base disabled:opacity-60
                ${activeMode === 'tag' ? 'bg-blue-600 hover:bg-blue-700' : activeMode === 'generate' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {generating
                ? <><span className="animate-spin">⏳</span> Processing...</>
                : activeMode === 'tag'      ? <><span>🏷️</span> Tag My Content</>
                : activeMode === 'generate' ? <><span>✨</span> Generate Aligned Content</>
                : <><span>📄</span> Generate Alignment Report</>
              }
            </button>
          </div>

          {/* ── RIGHT: Output panel ── */}
          <div>
            {!result ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">📐</div>
                <p className="text-gray-400 font-medium">Your output will appear here</p>
                <p className="text-gray-300 text-sm mt-1">Select standards and run your chosen mode</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">

                {/* Output toolbar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-semibold text-gray-800">Output</h2>
                    {result.standardsApplied && (
                      <p className="text-xs text-gray-500">{result.standardsApplied} standard{result.standardsApplied !== 1 ? 's' : ''} applied</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors">
                      📋 Copy
                    </button>
                    <button onClick={handleExport} disabled={exporting}
                      className="px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors">
                      {exporting ? 'Exporting...' : '📄 Export .docx'}
                    </button>
                  </div>
                </div>

                {/* Standards tags summary */}
                {result.matchedStandards?.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Standards Tagged ({result.matchedStandards.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedStandards.map((s, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                    {result.alignmentScore && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">Alignment Strength: {result.alignmentScore}</p>
                    )}
                  </div>
                )}

                {/* Content */}
                <textarea
                  value={result.taggedContent || result.generatedContent || result.report || ''}
                  onChange={e => setResult(prev => ({
                    ...prev,
                    taggedContent:    activeMode === 'tag'      ? e.target.value : prev.taggedContent,
                    generatedContent: activeMode === 'generate' ? e.target.value : prev.generatedContent,
                    report:           activeMode === 'report'   ? e.target.value : prev.report,
                  }))}
                  className="flex-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 resize-none text-sm leading-relaxed"
                  style={{ minHeight: '480px' }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}