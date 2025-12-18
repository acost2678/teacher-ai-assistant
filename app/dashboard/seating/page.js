'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SeatingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd-5th Grade')
  const [classSize, setClassSize] = useState('24')
  const [roomSetup, setRoomSetup] = useState('groups-4')
  const [groupingGoal, setGroupingGoal] = useState('academic-mixed')
  const [studentConsiderations, setStudentConsiderations] = useState('')
  const [constraints, setConstraints] = useState('')
  const [includeStrategies, setIncludeStrategies] = useState(true)
  const [includeAlternatives, setIncludeAlternatives] = useState(true)
  
  const [generatedPlan, setGeneratedPlan] = useState('')
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
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-seating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, classSize, roomSetup, groupingGoal,
          studentConsiderations, constraints, includeStrategies, includeAlternatives,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedPlan(data.seatingPlan); await handleSave(data.seatingPlan) }
    } catch (error) { alert('Error generating plan. Please try again.') }
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
          title: `Seating Plan: ${classSize} students (${roomSetup})`,
          toolType: 'seating',
          toolName: 'Seating Chart Helper',
          content,
          metadata: { gradeLevel, classSize, roomSetup, groupingGoal },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedPlan) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Seating Chart Plan`, 
          content: generatedPlan, 
          toolName: 'Seating Chart Helper' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Seating_Plan.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedPlan); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🪑 Seating Chart Helper</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Classroom Setup</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800">
                  <option value="Pre-K/K">Pre-K / Kindergarten</option>
                  <option value="1st-2nd Grade">1st-2nd Grade</option>
                  <option value="3rd-5th Grade">3rd-5th Grade</option>
                  <option value="6th-8th Grade">6th-8th Grade</option>
                  <option value="9th-12th Grade">9th-12th Grade</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Class Size</label>
                <select value={classSize} onChange={(e) => setClassSize(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800">
                  {[16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36].map(n => 
                    <option key={n} value={n}>{n} students</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Room Setup</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'rows', label: '▤ Rows', desc: 'Traditional facing front' },
                  { id: 'pairs', label: '▥ Pairs', desc: 'Partner desks' },
                  { id: 'groups-4', label: '⊞ Groups of 4', desc: 'Cluster tables' },
                  { id: 'groups-6', label: '⬡ Groups of 6', desc: 'Larger clusters' },
                  { id: 'u-shape', label: '⊔ U-Shape', desc: 'Horseshoe' },
                  { id: 'flexible', label: '◎ Flexible', desc: 'Mixed seating' },
                ].map(s => (
                  <button key={s.id} type="button" onClick={() => setRoomSetup(s.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${roomSetup === s.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                    <div className="font-medium text-gray-800">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Grouping Goal</label>
              <select value={groupingGoal} onChange={(e) => setGroupingGoal(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800">
                <option value="academic-mixed">📊 Mixed Abilities (heterogeneous)</option>
                <option value="behavior">🎯 Behavior Management</option>
                <option value="social">👥 Social Development</option>
                <option value="collaborative">🤝 Collaborative Learning</option>
                <option value="focus">🔍 Focus & Attention</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Student Considerations (optional)</label>
              <textarea value={studentConsiderations} onChange={(e) => setStudentConsiderations(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 h-20 text-sm"
                placeholder="e.g., 3 students with IEPs for attention, 2 ELL students, 1 student with vision needs, 2 students who shouldn't sit together..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Room Constraints (optional)</label>
              <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Door on left side, windows cause glare, limited space in back..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeStrategies}
                    onChange={(e) => setIncludeStrategies(e.target.checked)} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">💡 Implementation Strategies</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeAlternatives}
                    onChange={(e) => setIncludeAlternatives(e.target.checked)} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">🔄 Alternative Arrangements</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 disabled:opacity-50">
              {generating ? '🪑 Creating Seating Plan...' : '🪑 Generate Seating Plan'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Seating Plan</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedPlan && (
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

            {generatedPlan ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedPlan}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🪑</p>
                  <p className="mb-2">Your seating plan will appear here</p>
                  <p className="text-xs">Strategic grouping & placement strategies</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}