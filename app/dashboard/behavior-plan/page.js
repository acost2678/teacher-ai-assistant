'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function BehaviorPlanPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd-5th Grade')
  const [behaviorConcern, setBehaviorConcern] = useState('')
  const [behaviorContext, setBehaviorContext] = useState('')
  const [previousStrategies, setPreviousStrategies] = useState('')
  const [studentStrengths, setStudentStrengths] = useState('')
  const [includeDataCollection, setIncludeDataCollection] = useState(true)
  const [includeParentCommunication, setIncludeParentCommunication] = useState(true)
  const [includeReinforcementMenu, setIncludeReinforcementMenu] = useState(true)
  
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
    if (!behaviorConcern.trim()) {
      alert('Please describe the behavior concern')
      return
    }
    
    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-behavior-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, behaviorConcern, behaviorContext, previousStrategies,
          studentStrengths, includeDataCollection, includeParentCommunication, includeReinforcementMenu,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedPlan(data.behaviorPlan); await handleSave(data.behaviorPlan) }
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
          title: `Behavior Plan: ${behaviorConcern.substring(0, 30)}...`,
          toolType: 'behavior-plan',
          toolName: 'Behavior Plan',
          content,
          metadata: { gradeLevel, behaviorConcern },
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
          title: `Behavior Support Plan`, 
          content: generatedPlan, 
          toolName: 'Behavior Plan' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Behavior_Plan.docx`
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
            <h1 className="text-xl font-bold text-gray-800">💚 Behavior Plan</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Behavior Information</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Grade Level</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                <option value="Pre-K/K">Pre-K / Kindergarten</option>
                <option value="1st-2nd Grade">1st-2nd Grade</option>
                <option value="3rd-5th Grade">3rd-5th Grade</option>
                <option value="6th-8th Grade">6th-8th Grade</option>
                <option value="9th-12th Grade">9th-12th Grade</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Behavior Concern <span className="text-rose-500">*</span>
              </label>
              <textarea value={behaviorConcern} onChange={(e) => setBehaviorConcern(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 h-24 text-sm"
                placeholder="Describe the specific behavior you're seeing. Be observable and measurable. E.g., 'Student leaves seat without permission during independent work time, approximately 5-8 times per class period.'" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">When/Where Does It Occur? (optional)</label>
              <textarea value={behaviorContext} onChange={(e) => setBehaviorContext(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 h-20 text-sm"
                placeholder="e.g., During independent work, transitions, after lunch, when asked to write..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">What Have You Already Tried? (optional)</label>
              <textarea value={previousStrategies} onChange={(e) => setPreviousStrategies(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Verbal reminders, proximity, seat change, parent contact..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Student Strengths (optional)</label>
              <textarea value={studentStrengths} onChange={(e) => setStudentStrengths(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Good at math, loves to help, responds well to humor, likes technology..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeDataCollection}
                    onChange={(e) => setIncludeDataCollection(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                  <span className="text-gray-700">📊 Data Collection Forms</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeReinforcementMenu}
                    onChange={(e) => setIncludeReinforcementMenu(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                  <span className="text-gray-700">🎁 Reinforcement Menu</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeParentCommunication}
                    onChange={(e) => setIncludeParentCommunication(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                  <span className="text-gray-700">👨‍👩‍👧 Parent Communication Template</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !behaviorConcern.trim()}
              className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {generating ? '💚 Creating Behavior Plan...' : '💚 Generate Behavior Plan'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Behavior Plan</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedPlan && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-emerald-600 hover:text-emerald-800 text-sm">
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
                  <p className="text-4xl mb-4">💚</p>
                  <p className="mb-2">Your behavior plan will appear here</p>
                  <p className="text-xs">Positive, function-based interventions</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}