'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function WarmUpPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [warmUpType, setWarmUpType] = useState('review')
  const [duration, setDuration] = useState('5 minutes')
  const [quantity, setQuantity] = useState('5')
  const [difficulty, setDifficulty] = useState('on-level')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [connectToLesson, setConnectToLesson] = useState(false)
  const [lessonContext, setLessonContext] = useState('')
  
  const [generatedWarmUps, setGeneratedWarmUps] = useState('')
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
    if (!topic) {
      alert('Please enter a topic or skill')
      return
    }
    setGenerating(true)
    setGeneratedWarmUps('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, warmUpType, duration,
          quantity, difficulty, includeAnswerKey, connectToLesson, lessonContext,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedWarmUps(data.warmUps); await handleSave(data.warmUps) }
    } catch (error) { alert('Error generating warm-ups. Please try again.') }
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
          title: `Warm-Ups: ${topic} (${quantity})`,
          toolType: 'warm-up',
          toolName: 'Warm-Up',
          content,
          metadata: { gradeLevel, subject, topic, warmUpType, quantity },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedWarmUps) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Warm-Ups - ${topic}`, content: generatedWarmUps, toolName: 'Warm-Up' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `WarmUps_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedWarmUps); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Warm-Up / Bell Ringer Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Warm-Up Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic/Skill *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                placeholder="e.g., Multiplication facts, Main idea, Vocabulary review" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Warm-Up Type</label>
                <select value={warmUpType} onChange={(e) => setWarmUpType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  <option value="review">Review (past material)</option>
                  <option value="preview">Preview (upcoming lesson)</option>
                  <option value="spiral">Spiral Review (multiple concepts)</option>
                  <option value="brain-teaser">Brain Teaser / Puzzle</option>
                  <option value="journal">Quick Write / Journal</option>
                  <option value="discussion">Discussion Starter</option>
                  <option value="skill-practice">Skill Practice</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">How Many?</label>
                <select value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  <option value="1">1 (single use)</option>
                  <option value="3">3 (half week)</option>
                  <option value="5">5 (full week)</option>
                  <option value="10">10 (two weeks)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  <option value="3 minutes">3 minutes</option>
                  <option value="5 minutes">5 minutes</option>
                  <option value="7 minutes">7 minutes</option>
                  <option value="10 minutes">10 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  <option value="below-level">Below Grade Level</option>
                  <option value="on-level">On Grade Level</option>
                  <option value="above-level">Above Grade Level</option>
                  <option value="mixed">Mixed Difficulty</option>
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input type="checkbox" id="includeAnswerKey" checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
              <label htmlFor="includeAnswerKey" className="text-gray-700">Include answer key</label>
            </div>

            {/* Connect to Lesson */}
            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <input type="checkbox" id="connectToLesson" checked={connectToLesson}
                  onChange={(e) => setConnectToLesson(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
                <label htmlFor="connectToLesson" className="text-gray-800 font-medium">Connect to today's lesson</label>
              </div>
              {connectToLesson && (
                <textarea value={lessonContext} onChange={(e) => setLessonContext(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 h-16 mt-2"
                  placeholder="What's today's lesson about? The warm-up will preview or connect to it." />
              )}
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {generating ? 'Generating...' : `Generate ${quantity} Warm-Up${quantity > 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Warm-Ups</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedWarmUps && (
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

            {generatedWarmUps ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedWarmUps}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your warm-ups will appear here</p>
                  <p className="text-xs">Ready-to-use bell ringers for your class</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}