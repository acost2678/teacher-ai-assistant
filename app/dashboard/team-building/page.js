'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function TeamBuildingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd-5th Grade')
  const [activityGoal, setActivityGoal] = useState('class-community')
  const [groupSize, setGroupSize] = useState('whole-class')
  const [timeAvailable, setTimeAvailable] = useState('15-20')
  const [spaceType, setSpaceType] = useState('classroom')
  const [materialsAvailable, setMaterialsAvailable] = useState('')
  const [classContext, setClassContext] = useState('')
  const [includeVariations, setIncludeVariations] = useState(true)
  const [includeDebrief, setIncludeDebrief] = useState(true)
  
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
      const response = await fetch('/api/generate-team-building', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, activityGoal, groupSize, timeAvailable,
          spaceType, materialsAvailable, classContext, includeVariations, includeDebrief,
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
          title: `Team Building: ${activityGoal} (${gradeLevel})`,
          toolType: 'team-building',
          toolName: 'Team Building',
          content,
          metadata: { gradeLevel, activityGoal, timeAvailable },
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
        body: JSON.stringify({ 
          title: `Team Building Activity - ${activityGoal}`, 
          content: generatedActivity, 
          toolName: 'Team Building' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Team_Building_${activityGoal}.docx`
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
            <h1 className="text-xl font-bold text-gray-800">🤝 Team Building Activities</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Activity Settings</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="Pre-K/K">Pre-K / Kindergarten</option>
                  <option value="1st-2nd Grade">1st-2nd Grade</option>
                  <option value="3rd-5th Grade">3rd-5th Grade</option>
                  <option value="6th-8th Grade">Middle School</option>
                  <option value="9th-12th Grade">High School</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Time Available</label>
                <select value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="5-10">5-10 minutes (Quick)</option>
                  <option value="15-20">15-20 minutes (Standard)</option>
                  <option value="25-30">25-30 minutes (Extended)</option>
                  <option value="45+">45+ minutes (Full period)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Activity Goal</label>
              <select value={activityGoal} onChange={(e) => setActivityGoal(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                <option value="ice-breaker">🧊 Ice Breaker - Getting to know each other</option>
                <option value="trust-building">🤲 Trust Building - Developing trust</option>
                <option value="communication">💬 Communication - Listening and speaking</option>
                <option value="collaboration">👥 Collaboration - Working together</option>
                <option value="problem-solving">🧩 Problem Solving - Group challenges</option>
                <option value="inclusion">🤗 Inclusion - Everyone feels valued</option>
                <option value="energizer">⚡ Energizer - Boost energy and engagement</option>
                <option value="creativity">🎨 Creativity - Creative thinking together</option>
                <option value="conflict-resolution">🕊️ Conflict Resolution - Handling disagreements</option>
                <option value="class-community">💚 Class Community - Overall culture building</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Group Size</label>
                <select value={groupSize} onChange={(e) => setGroupSize(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="pairs">Pairs (2)</option>
                  <option value="small-groups">Small Groups (3-5)</option>
                  <option value="medium-groups">Medium Groups (6-8)</option>
                  <option value="whole-class">Whole Class (20-30)</option>
                  <option value="large-group">Large Group (30+)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Space Available</label>
                <select value={spaceType} onChange={(e) => setSpaceType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="classroom">🏫 Regular Classroom</option>
                  <option value="flexible">🔄 Flexible (can move furniture)</option>
                  <option value="open-space">🏃 Open Space (gym/outdoor)</option>
                  <option value="virtual">💻 Virtual/Remote</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Materials Available (optional)</label>
              <input type="text" value={materialsAvailable} onChange={(e) => setMaterialsAvailable(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                placeholder="e.g., paper, markers, balls, rope, blindfolds..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Class Context (optional)</label>
              <textarea value={classContext} onChange={(e) => setClassContext(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., First week of school, class has some conflicts, shy students, just combined two classes..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeDebrief}
                    onChange={(e) => setIncludeDebrief(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
                  <span className="text-gray-700">💭 Debrief Questions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVariations}
                    onChange={(e) => setIncludeVariations(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
                  <span className="text-gray-700">🔄 Variations (easier, harder, virtual)</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {generating ? '🤝 Creating Activity...' : '🤝 Generate Team Building Activity'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Activity Plan</h2>
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
                  <p className="text-4xl mb-4">🤝</p>
                  <p className="mb-2">Your team building activity will appear here</p>
                  <p className="text-xs">With facilitation tips & debrief questions</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}