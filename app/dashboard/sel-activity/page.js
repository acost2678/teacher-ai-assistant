'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SELActivityPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [caselCompetency, setCaselCompetency] = useState('self-awareness')
  const [activityType, setActivityType] = useState('game')
  const [duration, setDuration] = useState('20-30 minutes')
  const [groupSize, setGroupSize] = useState('whole-class')
  const [materials, setMaterials] = useState('')
  const [theme, setTheme] = useState('')
  const [numberOfActivities, setNumberOfActivities] = useState('1')
  const [includeAssessment, setIncludeAssessment] = useState(true)
  const [classContext, setClassContext] = useState('')
  
  const [generatedActivity, setGeneratedActivity] = useState('')
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
    setGeneratedActivity('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-sel-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, caselCompetency, activityType, duration,
          groupSize, materials, theme, numberOfActivities, includeAssessment, classContext,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedActivity(data.activity); await handleSave(data.activity) }
    } catch (error) { alert('Error generating activity. Please try again.') }
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
          title: `SEL Activity: ${caselCompetency} (${activityType})`,
          toolType: 'sel-activity',
          toolName: 'SEL Activity',
          content,
          metadata: { gradeLevel, caselCompetency, activityType, duration },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedActivity) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `SEL Activity - ${caselCompetency}`, content: generatedActivity, toolName: 'SEL Activity' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `SEL_Activity_${caselCompetency}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedActivity); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🎯 SEL Activity Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Activity Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="10-15 minutes">10-15 minutes</option>
                  <option value="20-30 minutes">20-30 minutes</option>
                  <option value="30-45 minutes">30-45 minutes</option>
                  <option value="45-60 minutes">45-60 minutes</option>
                </select>
              </div>
            </div>

            {/* CASEL Competency */}
            <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <label className="block text-gray-800 font-medium mb-2">🎯 CASEL Competency</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'self-awareness', label: '💡 Self-Awareness', desc: 'Emotions, strengths, confidence' },
                  { id: 'self-management', label: '🎯 Self-Management', desc: 'Goals, stress, impulse control' },
                  { id: 'social-awareness', label: '👥 Social Awareness', desc: 'Empathy, diversity, respect' },
                  { id: 'relationship-skills', label: '🤝 Relationship Skills', desc: 'Communication, teamwork' },
                  { id: 'responsible-decision-making', label: '⚖️ Decision-Making', desc: 'Ethics, problem-solving' },
                ].map(c => (
                  <button key={c.id} type="button" onClick={() => setCaselCompetency(c.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${caselCompetency === c.id ? 'border-teal-500 bg-teal-100' : 'border-gray-200 hover:border-teal-300'}`}>
                    <div className="font-medium text-gray-800">{c.label}</div>
                    <div className="text-xs text-gray-500">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Activity Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'game', label: '🎮 Game' },
                  { id: 'discussion', label: '💬 Discussion' },
                  { id: 'creative', label: '🎨 Creative' },
                  { id: 'mindfulness', label: '🧘 Mindfulness' },
                  { id: 'role-play', label: '🎭 Role-Play' },
                  { id: 'collaborative', label: '👥 Collaborative' },
                  { id: 'movement', label: '🏃 Movement' },
                  { id: 'journaling', label: '📝 Journaling' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setActivityType(t.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${activityType === t.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                    <span className="text-gray-800">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Group Size</label>
                <select value={groupSize} onChange={(e) => setGroupSize(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="whole-class">Whole Class</option>
                  <option value="small-groups">Small Groups (3-5)</option>
                  <option value="pairs">Partners</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Activities</label>
                <select value={numberOfActivities} onChange={(e) => setNumberOfActivities(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="1">1 activity</option>
                  <option value="3">3 activities</option>
                  <option value="5">5 activities (week)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Theme (optional)</label>
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                placeholder="e.g., Kindness, Perseverance, Belonging, Anti-Bullying" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Available Materials (optional)</label>
              <input type="text" value={materials} onChange={(e) => setMaterials(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                placeholder="e.g., Paper, markers, balls, music player" />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input type="checkbox" id="includeAssessment" checked={includeAssessment}
                onChange={(e) => setIncludeAssessment(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
              <label htmlFor="includeAssessment" className="text-gray-700">Include assessment/observation guide</label>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {generating ? '🎯 Creating Activity...' : '🎯 Generate Activity'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Activity</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedActivity && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-teal-600 hover:text-teal-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedActivity ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedActivity}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🎯</p>
                  <p className="mb-2">Your SEL activity will appear here</p>
                  <p className="text-xs">Evidence-based, CASEL-aligned</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}