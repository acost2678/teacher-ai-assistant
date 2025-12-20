'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PeerReviewPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('9th Grade')
  const [writingType, setWritingType] = useState('argumentative')
  const [focusAreas, setFocusAreas] = useState('')
  const [reviewStyle, setReviewStyle] = useState('tag')
  const [includeExamples, setIncludeExamples] = useState(true)
  const [includeSentenceStarters, setIncludeSentenceStarters] = useState(true)
  const [numberOfRounds, setNumberOfRounds] = useState('1')
  
  const [generatedGuide, setGeneratedGuide] = useState('')
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
    setGradeLevel('7th Grade')
    setWritingType('argumentative')
    setFocusAreas('Thesis statements, supporting evidence, counterarguments')
    setReviewStyle('tag')
    setIncludeExamples(true)
    setIncludeSentenceStarters(true)
    setNumberOfRounds('1')
    setShowDemo(true)
    setGeneratedGuide('')
  }

  const handleResetDemo = () => {
    setGradeLevel('9th Grade')
    setWritingType('argumentative')
    setFocusAreas('')
    setReviewStyle('tag')
    setIncludeExamples(true)
    setIncludeSentenceStarters(true)
    setNumberOfRounds('1')
    setShowDemo(false)
    setGeneratedGuide('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedGuide('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-peer-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, writingType, focusAreas, reviewStyle,
          includeExamples, includeSentenceStarters, numberOfRounds,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedGuide(data.guide); await handleSave(data.guide) }
    } catch (error) { alert('Error generating guide. Please try again.') }
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
          title: `Peer Review Guide: ${writingType} (${gradeLevel})`,
          toolType: 'peer-review',
          toolName: 'Peer Review Guide',
          content,
          metadata: { gradeLevel, writingType, reviewStyle },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedGuide) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Peer Review Guide - ${writingType}`, content: generatedGuide, toolName: 'Peer Review Guide' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Peer_Review_Guide_${writingType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedGuide); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">👥 Peer Review Guide Generator</h1>
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
                <p className="text-purple-600 text-sm">We've filled in example inputs. Click Generate to see a sample output.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Review Guide Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  {['5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                    '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Writing Type</label>
                <select value={writingType} onChange={(e) => setWritingType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <option value="argumentative">Argumentative</option>
                  <option value="expository">Expository</option>
                  <option value="narrative">Narrative</option>
                  <option value="literary-analysis">Literary Analysis</option>
                  <option value="research">Research Paper</option>
                  <option value="descriptive">Descriptive</option>
                  <option value="poetry">Poetry</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* Review Style */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Review Style / Protocol</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'tag', label: '🏷️ TAG', desc: 'Tell, Ask, Give - Simple and effective' },
                  { id: 'praise-question-polish', label: '✨ PQP', desc: 'Praise, Question, Polish' },
                  { id: 'glow-grow', label: '🌟 Glow & Grow', desc: 'What shines, what needs growth' },
                  { id: 'stars-wishes', label: '⭐ Stars & Wishes', desc: 'Great moments, wishes for more' },
                  { id: 'detailed', label: '📋 Detailed Checklist', desc: 'Criteria-based systematic review' },
                ].map(s => (
                  <button key={s.id} type="button" onClick={() => setReviewStyle(s.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${reviewStyle === s.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    <div className="font-medium text-gray-800">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Focus Areas (optional)</label>
              <input type="text" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                placeholder="e.g., Thesis statements, evidence, transitions..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeSentenceStarters}
                    onChange={(e) => setIncludeSentenceStarters(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">💬 Sentence Starters</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeExamples}
                    onChange={(e) => setIncludeExamples(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">🌟 Example Feedback (Good vs. Bad)</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? '👥 Creating Guide...' : '👥 Generate Peer Review Guide'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Guide</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedGuide && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-purple-600 hover:text-purple-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedGuide ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedGuide}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">👥</p>
                  <p className="mb-2">Your peer review guide will appear here</p>
                  <p className="text-xs">Ready-to-print student handout</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}