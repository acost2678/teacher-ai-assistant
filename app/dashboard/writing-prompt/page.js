'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function WritingPromptPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('9th Grade')
  const [writingType, setWritingType] = useState('argumentative')
  const [topic, setTopic] = useState('')
  const [standards, setStandards] = useState('')
  const [numberOfPrompts, setNumberOfPrompts] = useState('1')
  const [complexity, setComplexity] = useState('standard')
  const [includeRubric, setIncludeRubric] = useState(true)
  const [rubricType, setRubricType] = useState('analytic')
  const [includePrewriting, setIncludePrewriting] = useState(true)
  const [includeExemplar, setIncludeExemplar] = useState(false)
  const [timeAllotted, setTimeAllotted] = useState('')
  const [customRequirements, setCustomRequirements] = useState('')
  
  const [generatedPrompts, setGeneratedPrompts] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedPrompts('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-writing-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, writingType, topic, standards, numberOfPrompts,
          complexity, includeRubric, rubricType, includePrewriting,
          includeExemplar, timeAllotted, customRequirements,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedPrompts(data.prompts); await handleSave(data.prompts) }
    } catch (error) { alert('Error generating prompts. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Writing Prompt: ${writingType} (${gradeLevel})`,
          toolType: 'writing-prompt',
          toolName: 'Writing Prompt',
          content,
          metadata: { gradeLevel, writingType, topic, includeRubric },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedPrompts) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Writing Prompt - ${writingType}`, content: generatedPrompts, toolName: 'Writing Prompt' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Writing_Prompt_${writingType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedPrompts); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📝 Writing Prompt Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Prompt Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                    '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Prompts</label>
                <select value={numberOfPrompts} onChange={(e) => setNumberOfPrompts(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  <option value="1">1 prompt</option>
                  <option value="2">2 prompts</option>
                  <option value="3">3 prompts</option>
                  <option value="5">5 prompts</option>
                </select>
              </div>
            </div>

            {/* Writing Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Writing Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'argumentative', label: '⚖️ Argumentative' },
                  { id: 'expository', label: '📖 Expository' },
                  { id: 'narrative', label: '📚 Narrative' },
                  { id: 'literary-analysis', label: '🔍 Literary Analysis' },
                  { id: 'research', label: '🔬 Research' },
                  { id: 'compare-contrast', label: '⚡ Compare/Contrast' },
                  { id: 'personal-narrative', label: '💭 Personal Narrative' },
                  { id: 'response-to-text', label: '📝 Response to Text' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setWritingType(t.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${writingType === t.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                    <span className="text-gray-800 text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic/Theme (optional)</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                placeholder="e.g., Social media, Climate change, Identity, Coming of age..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Complexity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'scaffold', label: '🛠️ Scaffolded', desc: 'Extra support' },
                  { id: 'standard', label: '📐 Standard', desc: 'Grade-level' },
                  { id: 'advanced', label: '🚀 Advanced', desc: 'More challenge' },
                ].map(c => (
                  <button key={c.id} type="button" onClick={() => setComplexity(c.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${complexity === c.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                    <div className="text-gray-800 text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-gray-500">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Time Allotted (optional)</label>
              <select value={timeAllotted} onChange={(e) => setTimeAllotted(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                <option value="">Not specified</option>
                <option value="30 minutes">30 minutes (timed write)</option>
                <option value="45 minutes">45 minutes</option>
                <option value="1 class period">1 class period</option>
                <option value="2-3 class periods">2-3 class periods</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks (major assignment)</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeRubric}
                    onChange={(e) => setIncludeRubric(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                  <span className="text-gray-700">📊 Scoring Rubric</span>
                </label>
                {includeRubric && (
                  <div className="ml-8">
                    <select value={rubricType} onChange={(e) => setRubricType(e.target.value)}
                      className="w-full p-2 border rounded text-gray-800 text-sm">
                      <option value="analytic">Analytic (by trait)</option>
                      <option value="holistic">Holistic (overall score)</option>
                    </select>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includePrewriting}
                    onChange={(e) => setIncludePrewriting(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                  <span className="text-gray-700">🧠 Prewriting Support</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeExemplar}
                    onChange={(e) => setIncludeExemplar(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                  <span className="text-gray-700">🌟 Mentor Text Suggestions</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Custom Requirements (optional)</label>
              <textarea value={customRequirements} onChange={(e) => setCustomRequirements(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Must include 3 sources, needs counterargument, focus on sensory details..." />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {generating ? '📝 Creating Prompt...' : '📝 Generate Writing Prompt'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Prompt</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedPrompts && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-orange-600 hover:text-orange-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedPrompts ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedPrompts}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📝</p>
                  <p className="mb-2">Your writing prompt will appear here</p>
                  <p className="text-xs">With rubric, prewriting support & more</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}