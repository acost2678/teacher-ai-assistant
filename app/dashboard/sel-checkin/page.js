'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SELCheckInPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [checkInType, setCheckInType] = useState('morning-meeting')
  const [caselCompetency, setCaselCompetency] = useState('mixed')
  const [duration, setDuration] = useState('5-10 minutes')
  const [format, setFormat] = useState('verbal')
  const [numberOfPrompts, setNumberOfPrompts] = useState('5')
  const [theme, setTheme] = useState('')
  const [includeFollowUp, setIncludeFollowUp] = useState(true)
  const [classContext, setClassContext] = useState('')
  
  const [generatedCheckIn, setGeneratedCheckIn] = useState('')
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
    setGeneratedCheckIn('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-sel-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, checkInType, caselCompetency, duration,
          format, numberOfPrompts, theme, includeFollowUp, classContext,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedCheckIn(data.checkIn); await handleSave(data.checkIn) }
    } catch (error) { alert('Error generating check-in. Please try again.') }
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
          title: `SEL Check-In: ${checkInType} (${caselCompetency})`,
          toolType: 'sel-checkin',
          toolName: 'SEL Check-In',
          content,
          metadata: { gradeLevel, checkInType, caselCompetency, format },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedCheckIn) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `SEL Check-In - ${checkInType}`, content: generatedCheckIn, toolName: 'SEL Check-In' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `SEL_CheckIn_${checkInType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedCheckIn); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">💚 SEL Check-In Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Check-In Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  <option value="2-3 minutes">2-3 minutes (quick)</option>
                  <option value="5-10 minutes">5-10 minutes (standard)</option>
                  <option value="15-20 minutes">15-20 minutes (extended)</option>
                </select>
              </div>
            </div>

            {/* Check-In Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Check-In Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'morning-meeting', label: '🌅 Morning Meeting', desc: 'Start the day' },
                  { id: 'emotion-check', label: '💭 Emotion Check', desc: 'Identify feelings' },
                  { id: 'closing-circle', label: '🌙 Closing Circle', desc: 'End of day' },
                  { id: 'weekly-reflection', label: '📝 Weekly Reflection', desc: 'Deeper thinking' },
                  { id: 'transition', label: '🔄 Transition', desc: 'Quick reset' },
                  { id: 'one-on-one', label: '👤 One-on-One', desc: 'Individual' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setCheckInType(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${checkInType === t.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* CASEL Competency */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="block text-gray-800 font-medium mb-2">🎯 CASEL Competency Focus</label>
              <select value={caselCompetency} onChange={(e) => setCaselCompetency(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                <option value="mixed">🔄 Mixed (All Competencies)</option>
                <option value="self-awareness">💡 Self-Awareness</option>
                <option value="self-management">🎯 Self-Management</option>
                <option value="social-awareness">👥 Social Awareness</option>
                <option value="relationship-skills">🤝 Relationship Skills</option>
                <option value="responsible-decision-making">⚖️ Responsible Decision-Making</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Response Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  <option value="verbal">🗣️ Verbal Sharing</option>
                  <option value="written">✍️ Written Response</option>
                  <option value="movement">🏃 Movement-Based</option>
                  <option value="creative">🎨 Creative Expression</option>
                  <option value="digital">📱 Digital Response</option>
                  <option value="choice">✨ Student Choice</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Prompts</label>
                <select value={numberOfPrompts} onChange={(e) => setNumberOfPrompts(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  <option value="3">3 prompts</option>
                  <option value="5">5 prompts</option>
                  <option value="7">7 prompts (week)</option>
                  <option value="10">10 prompts</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Theme (optional)</label>
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                placeholder="e.g., Gratitude, Friendship, Growth Mindset, Back to School" />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input type="checkbox" id="includeFollowUp" checked={includeFollowUp}
                onChange={(e) => setIncludeFollowUp(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
              <label htmlFor="includeFollowUp" className="text-gray-700">Include follow-up questions for deeper discussion</label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Class Context (optional)</label>
              <textarea value={classContext} onChange={(e) => setClassContext(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-16"
                placeholder="e.g., Coming back from break, dealing with conflict, preparing for testing..." />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {generating ? '💚 Creating Check-Ins...' : '💚 Generate Check-Ins'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Check-In</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedCheckIn && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-green-600 hover:text-green-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedCheckIn ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedCheckIn}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">💚</p>
                  <p className="mb-2">Your SEL check-ins will appear here</p>
                  <p className="text-xs">CASEL-aligned prompts for connection</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}