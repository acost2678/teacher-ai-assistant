'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ConflictResolutionPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [conflictType, setConflictType] = useState('peer-argument')
  const [numberOfStudents, setNumberOfStudents] = useState('2')
  const [setting, setSetting] = useState('classroom')
  const [includeRolePlay, setIncludeRolePlay] = useState(false)
  const [includeFollowUp, setIncludeFollowUp] = useState(true)
  const [specificScenario, setSpecificScenario] = useState('')
  
  const [generatedResolution, setGeneratedResolution] = useState('')
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
    setGeneratedResolution('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-conflict-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, conflictType, numberOfStudents, setting,
          includeRolePlay, includeFollowUp, specificScenario,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedResolution(data.resolution); await handleSave(data.resolution) }
    } catch (error) { alert('Error generating script. Please try again.') }
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
          title: `Conflict Resolution: ${conflictType}`,
          toolType: 'conflict-resolution',
          toolName: 'Conflict Resolution',
          content,
          metadata: { gradeLevel, conflictType, numberOfStudents, setting },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedResolution) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Conflict Resolution - ${conflictType}`, content: generatedResolution, toolName: 'Conflict Resolution' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Conflict_Resolution_${conflictType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedResolution); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🤝 Conflict Resolution Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Conflict Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Students</label>
                <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800">
                  <option value="2">2 students</option>
                  <option value="3">3 students</option>
                  <option value="4+">4+ students (group)</option>
                </select>
              </div>
            </div>

            {/* Conflict Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Conflict Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'peer-argument', label: '💬 Argument', desc: 'Disagreement' },
                  { id: 'exclusion', label: '😢 Exclusion', desc: 'Feeling left out' },
                  { id: 'physical', label: '🤚 Physical', desc: 'Pushing, hitting' },
                  { id: 'verbal', label: '😠 Verbal', desc: 'Mean words' },
                  { id: 'rumor-gossip', label: '🗣️ Gossip', desc: 'Rumors, drama' },
                  { id: 'sharing-turns', label: '🎮 Sharing', desc: 'Turn-taking' },
                  { id: 'group-work', label: '👥 Group Work', desc: 'Collaboration' },
                  { id: 'misunderstanding', label: '❓ Misunderstanding', desc: 'Miscommunication' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setConflictType(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${conflictType === t.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Setting */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Setting</label>
              <select value={setting} onChange={(e) => setSetting(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800">
                <option value="classroom">🏫 Classroom</option>
                <option value="playground">🏃 Playground/Recess</option>
                <option value="cafeteria">🍽️ Cafeteria</option>
                <option value="hallway">🚶 Hallway</option>
                <option value="bus">🚌 Bus</option>
                <option value="online">💻 Online/Digital</option>
              </select>
            </div>

            {/* Options */}
            <div className="mb-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeFollowUp}
                    onChange={(e) => setIncludeFollowUp(e.target.checked)} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">📅 Follow-up check-in plan</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeRolePlay}
                    onChange={(e) => setIncludeRolePlay(e.target.checked)} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">🎭 Role-play scenarios for teaching</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Specific Scenario (optional)</label>
              <textarea value={specificScenario} onChange={(e) => setSpecificScenario(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 h-20"
                placeholder="Describe the specific situation you're dealing with... (no student names)" />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 disabled:opacity-50">
              {generating ? '🤝 Creating Script...' : '🤝 Generate Resolution Script'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">Restorative, trauma-informed approach</p>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Script</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedResolution && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-pink-600 hover:text-pink-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedResolution ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedResolution}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🤝</p>
                  <p className="mb-2">Your resolution script will appear here</p>
                  <p className="text-xs">Restorative practices for peace</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}