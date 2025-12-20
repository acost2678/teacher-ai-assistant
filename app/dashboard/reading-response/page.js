'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ReadingResponsePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [responseType, setResponseType] = useState('text-evidence')
  const [textType, setTextType] = useState('fiction')
  const [textTitle, setTextTitle] = useState('')
  const [focusStandard, setFocusStandard] = useState('')
  const [numberOfPrompts, setNumberOfPrompts] = useState('5')
  const [includeGraphicOrganizer, setIncludeGraphicOrganizer] = useState(true)
  const [includeRubric, setIncludeRubric] = useState(true)
  const [includeSentenceStarters, setIncludeSentenceStarters] = useState(true)
  
  const [generatedResponse, setGeneratedResponse] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const outputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setResponseType('character-analysis')
    setTextType('fiction')
    setTextTitle('Charlotte\'s Web')
    setFocusStandard('')
    setNumberOfPrompts('5')
    setIncludeGraphicOrganizer(true)
    setIncludeRubric(true)
    setIncludeSentenceStarters(true)
    setShowDemo(true)
    setGeneratedResponse('')
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setResponseType('text-evidence')
    setTextType('fiction')
    setTextTitle('')
    setFocusStandard('')
    setNumberOfPrompts('5')
    setIncludeGraphicOrganizer(true)
    setIncludeRubric(true)
    setIncludeSentenceStarters(true)
    setShowDemo(false)
    setGeneratedResponse('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedResponse('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-reading-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, responseType, textType, textTitle, focusStandard,
          numberOfPrompts, includeGraphicOrganizer, includeRubric, includeSentenceStarters,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedResponse(data.response); await handleSave(data.response) }
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
          title: `Reading Response: ${responseType} (${gradeLevel})`,
          toolType: 'reading-response',
          toolName: 'Reading Response',
          content,
          metadata: { gradeLevel, responseType, textType, textTitle },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedResponse) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Reading Response - ${responseType}`, 
          content: generatedResponse, 
          toolName: 'Reading Response' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Reading_Response_${responseType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedResponse); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📝 Reading Response Generator</h1>
          </div>
          <div className="flex items-center gap-3">
            {showDemo && (
              <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors text-xl" title="Reset Demo">↺</button>
            )}
            <button onClick={handleShowDemo} className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${showDemo ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              See Demo
            </button>
          </div>
        </div>
      </nav>

      {showDemo && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-xl">✨</span>
              <div className="flex-1">
                <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                <p className="text-purple-600 text-sm">We've filled in example inputs for "Charlotte's Web" character analysis. Click Generate to see sample prompts.</p>
              </div>
              <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                Scroll to output ↓
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Response Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                    '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Prompts</label>
                <select value={numberOfPrompts} onChange={(e) => setNumberOfPrompts(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  <option value="3">3 prompts</option>
                  <option value="5">5 prompts</option>
                  <option value="8">8 prompts</option>
                  <option value="10">10 prompts</option>
                </select>
              </div>
            </div>

            {/* Response Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Response Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'text-evidence', label: '📚 Text Evidence' },
                  { id: 'character-analysis', label: '👤 Character Analysis' },
                  { id: 'theme', label: '💡 Theme' },
                  { id: 'compare-contrast', label: '⚖️ Compare/Contrast' },
                  { id: 'cause-effect', label: '🔗 Cause & Effect' },
                  { id: 'summary', label: '📝 Summary' },
                  { id: 'inference', label: '🔍 Inference' },
                  { id: 'author-craft', label: '✍️ Author\'s Craft' },
                  { id: 'opinion', label: '💭 Opinion' },
                  { id: 'mixed', label: '🔄 Mixed' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setResponseType(t.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${responseType === t.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}>
                    <span className="text-gray-800 text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Text Type</label>
                <select value={textType} onChange={(e) => setTextType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  <option value="fiction">📚 Fiction</option>
                  <option value="nonfiction">📰 Nonfiction</option>
                  <option value="poetry">📝 Poetry</option>
                  <option value="drama">🎭 Drama</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Text Title (optional)</label>
                <input type="text" value={textTitle} onChange={(e) => setTextTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
                  placeholder="e.g., Charlotte's Web" />
              </div>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-violet-50 rounded-lg border border-violet-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeSentenceStarters}
                    onChange={(e) => setIncludeSentenceStarters(e.target.checked)} className="w-5 h-5 text-violet-600 rounded" />
                  <span className="text-gray-700">💬 Sentence Starters</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeGraphicOrganizer}
                    onChange={(e) => setIncludeGraphicOrganizer(e.target.checked)} className="w-5 h-5 text-violet-600 rounded" />
                  <span className="text-gray-700">📊 Graphic Organizers</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeRubric}
                    onChange={(e) => setIncludeRubric(e.target.checked)} className="w-5 h-5 text-violet-600 rounded" />
                  <span className="text-gray-700">📋 Scoring Rubric</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-violet-600 text-white p-3 rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {generating ? '📝 Creating Prompts...' : '📝 Generate Reading Response'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Materials</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedResponse && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-violet-600 hover:text-violet-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedResponse ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedResponse}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📝</p>
                  <p className="mb-2">Your prompts & organizers will appear here</p>
                  <p className="text-xs">With sentence starters and rubrics</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}