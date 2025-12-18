'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function TieredActivityPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [subject, setSubject] = useState('Math')
  const [topic, setTopic] = useState('')
  const [learningObjective, setLearningObjective] = useState('')
  const [activityType, setActivityType] = useState('practice')
  const [tieringStrategy, setTieringStrategy] = useState('readiness')
  const [includeRubric, setIncludeRubric] = useState(true)
  const [includeMaterials, setIncludeMaterials] = useState(true)
  const [includeGroupingTips, setIncludeGroupingTips] = useState(true)
  
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
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }
    
    setGenerating(true)
    setGeneratedActivity('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-tiered-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, learningObjective, activityType,
          tieringStrategy, includeRubric, includeMaterials, includeGroupingTips,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedActivity(data.tieredActivity); await handleSave(data.tieredActivity) }
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
          title: `Tiered Activity: ${topic} (${gradeLevel})`,
          toolType: 'tiered-activity',
          toolName: 'Tiered Activity',
          content,
          metadata: { gradeLevel, subject, topic, tieringStrategy },
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
          title: `Tiered Activity - ${topic}`, 
          content: generatedActivity, 
          toolName: 'Tiered Activity' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Tiered_Activity_${topic.replace(/\s+/g, '_')}.docx`
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
            <h1 className="text-xl font-bold text-gray-800">🎯 Tiered Activity Generator</h1>
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
                  {['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  <option value="Math">Math</option>
                  <option value="ELA">ELA/Reading</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Writing">Writing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic <span className="text-rose-500">*</span></label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                placeholder="e.g., Fractions, Main Idea, Photosynthesis, Civil War..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Learning Objective (optional)</label>
              <textarea value={learningObjective} onChange={(e) => setLearningObjective(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 h-16 text-sm"
                placeholder="Students will be able to..." />
            </div>

            {/* Tiering Strategy */}
            <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <label className="block text-gray-800 font-medium mb-2">Tiering Strategy</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'readiness', label: '📊 Readiness', desc: 'By skill level (approaching, on-level, advanced)' },
                  { id: 'learning-profile', label: '🧠 Learning Profile', desc: 'By how students learn (visual, auditory, kinesthetic)' },
                  { id: 'interest', label: '💡 Interest', desc: 'Same skill, different topics/contexts' },
                  { id: 'process', label: '🔄 Process', desc: 'Same content, different ways to engage' },
                  { id: 'product', label: '🎨 Product', desc: 'Same content, different ways to show learning' },
                ].map(s => (
                  <button key={s.id} type="button" onClick={() => setTieringStrategy(s.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${tieringStrategy === s.id ? 'border-teal-500 bg-teal-100' : 'border-gray-200 hover:border-teal-300'}`}>
                    <div className="font-medium text-gray-800">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Activity Type</label>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                <option value="practice">📝 Practice Activity</option>
                <option value="exploration">🔍 Exploration</option>
                <option value="application">🎯 Application</option>
                <option value="assessment">📊 Assessment Activity</option>
                <option value="collaborative">👥 Collaborative</option>
                <option value="independent">🧑 Independent</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeRubric}
                    onChange={(e) => setIncludeRubric(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
                  <span className="text-gray-700">📋 Universal Rubric (same criteria, all tiers)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeMaterials}
                    onChange={(e) => setIncludeMaterials(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
                  <span className="text-gray-700">📦 Materials Checklist</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeGroupingTips}
                    onChange={(e) => setIncludeGroupingTips(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
                  <span className="text-gray-700">👥 Grouping Tips (flexible grouping guidance)</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !topic.trim()}
              className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {generating ? '🎯 Creating Tiered Activity...' : '🎯 Generate Tiered Activity'}
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
                  <p className="mb-2">Your 3-tier activity will appear here</p>
                  <p className="text-xs">🟢 Approaching | 🟡 On-Level | 🔵 Advanced</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}