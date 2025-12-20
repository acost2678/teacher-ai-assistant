'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function WordProblemsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [mathSkill, setMathSkill] = useState('')
  const [theme, setTheme] = useState('random')
  const [numberOfProblems, setNumberOfProblems] = useState('5')
  const [difficulty, setDifficulty] = useState('proficient')
  const [problemStyle, setProblemStyle] = useState('real-world')
  const [includeScaffolding, setIncludeScaffolding] = useState(true)
  const [includeVisualSupport, setIncludeVisualSupport] = useState(true)
  
  const [generatedProblems, setGeneratedProblems] = useState('')
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
    setGradeLevel('4th Grade')
    setMathSkill('Multi-digit multiplication')
    setTheme('sports')
    setNumberOfProblems('5')
    setDifficulty('developing')
    setProblemStyle('real-world')
    setIncludeScaffolding(true)
    setIncludeVisualSupport(true)
    setShowDemo(true)
    setGeneratedProblems('')
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setMathSkill('')
    setTheme('random')
    setNumberOfProblems('5')
    setDifficulty('proficient')
    setProblemStyle('real-world')
    setIncludeScaffolding(true)
    setIncludeVisualSupport(true)
    setShowDemo(false)
    setGeneratedProblems('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!mathSkill.trim()) {
      alert('Please enter a math skill')
      return
    }
    
    setGenerating(true)
    setGeneratedProblems('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-word-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, mathSkill, theme, numberOfProblems,
          difficulty, problemStyle, includeScaffolding, includeVisualSupport,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedProblems(data.problems); await handleSave(data.problems) }
    } catch (error) { alert('Error generating problems. Please try again.') }
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
          title: `Word Problems: ${mathSkill} (${gradeLevel})`,
          toolType: 'word-problems',
          toolName: 'Word Problems',
          content,
          metadata: { gradeLevel, mathSkill, theme, numberOfProblems },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedProblems) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Word Problems - ${mathSkill}`, 
          content: generatedProblems, 
          toolName: 'Word Problems' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Word_Problems_${mathSkill.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedProblems); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🔢 Word Problem Generator</h1>
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
                <p className="text-purple-600 text-sm">We've filled in sports-themed multi-digit multiplication problems. Click Generate to see word problems with scaffolding.</p>
              </div>
              <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                Scroll to output ↓
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6">
        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>⚠️ Important:</strong> This tool generates word problem contexts and scaffolding. 
            <strong> You must verify all answers yourself before using with students.</strong> 
            Answer spaces are left blank for you to fill in after solving.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Problem Settings</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', 'Algebra 1', 'Geometry'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Problems</label>
                <select value={numberOfProblems} onChange={(e) => setNumberOfProblems(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  <option value="3">3 problems</option>
                  <option value="5">5 problems</option>
                  <option value="8">8 problems</option>
                  <option value="10">10 problems</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Math Skill <span className="text-rose-500">*</span>
              </label>
              <input type="text" value={mathSkill} onChange={(e) => setMathSkill(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                placeholder="e.g., Adding fractions, Multi-digit multiplication, Solving equations" />
            </div>

            {/* Theme */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Theme/Context</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sports', label: '⚽ Sports' },
                  { id: 'food', label: '🍕 Food' },
                  { id: 'animals', label: '🐾 Animals' },
                  { id: 'games', label: '🎮 Games' },
                  { id: 'music', label: '🎵 Music' },
                  { id: 'space', label: '🚀 Space' },
                  { id: 'nature', label: '🌲 Nature' },
                  { id: 'shopping', label: '🛒 Shopping' },
                  { id: 'travel', label: '✈️ Travel' },
                  { id: 'school', label: '🏫 School' },
                  { id: 'seasonal', label: '🎃 Seasonal' },
                  { id: 'random', label: '🎲 Mixed' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)}
                    className={`p-2 rounded-lg border text-center text-sm transition-all ${theme === t.id ? 'border-amber-500 bg-amber-100' : 'border-gray-200 hover:border-amber-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'entry', label: '🌱 Entry', desc: 'Single-step, friendly numbers' },
                  { id: 'developing', label: '📈 Developing', desc: 'May need two steps' },
                  { id: 'proficient', label: '⭐ Proficient', desc: 'Multi-step, planning needed' },
                  { id: 'advanced', label: '🚀 Advanced', desc: 'Complex, extra info' },
                ].map(d => (
                  <button key={d.id} type="button" onClick={() => setDifficulty(d.id)}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${difficulty === d.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}>
                    <div className="font-medium text-gray-800 text-sm">{d.label}</div>
                    <div className="text-xs text-gray-500">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Style */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Problem Style</label>
              <select value={problemStyle} onChange={(e) => setProblemStyle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                <option value="real-world">🌍 Real-World Scenarios</option>
                <option value="traditional">📝 Traditional Format</option>
                <option value="open-ended">🔓 Open-Ended</option>
                <option value="numberless">🔢 Numberless First</option>
                <option value="three-act">🎬 Three-Act Math</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeScaffolding}
                    onChange={(e) => setIncludeScaffolding(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                  <span className="text-gray-700">🛠️ Scaffolding (understand, plan, sentence starters)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVisualSupport}
                    onChange={(e) => setIncludeVisualSupport(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                  <span className="text-gray-700">🎨 Visual Model Suggestions</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !mathSkill.trim()}
              className="w-full bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700 disabled:opacity-50">
              {generating ? '🔢 Generating Problems...' : '🔢 Generate Word Problems'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Problems</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedProblems && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-amber-600 hover:text-amber-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedProblems ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[65vh]">
                {generatedProblems}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🔢</p>
                  <p className="mb-2">Word problems will appear here</p>
                  <p className="text-xs">With scaffolding • Teacher verifies answers</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}