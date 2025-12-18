'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProcedurePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd-5th Grade')
  const [procedureType, setProcedureType] = useState('entering-class')
  const [customProcedure, setCustomProcedure] = useState('')
  const [classContext, setClassContext] = useState('')
  const [includeVisuals, setIncludeVisuals] = useState(true)
  const [includeTeachingScript, setIncludeTeachingScript] = useState(true)
  const [includePracticeSchedule, setIncludePracticeSchedule] = useState(true)
  const [includeReinforcement, setIncludeReinforcement] = useState(true)
  
  const [generatedProcedure, setGeneratedProcedure] = useState('')
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
    if (procedureType === 'custom' && !customProcedure.trim()) {
      alert('Please enter a custom procedure name')
      return
    }
    
    setGenerating(true)
    setGeneratedProcedure('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-procedure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, procedureType, customProcedure, classContext,
          includeVisuals, includeTeachingScript, includePracticeSchedule, includeReinforcement,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedProcedure(data.procedure); await handleSave(data.procedure) }
    } catch (error) { alert('Error generating procedure. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    const procName = procedureType === 'custom' ? customProcedure : procedureType
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Procedure: ${procName} (${gradeLevel})`,
          toolType: 'procedure',
          toolName: 'Procedure Builder',
          content,
          metadata: { gradeLevel, procedureType, customProcedure },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedProcedure) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Classroom Procedure - ${procedureType}`, 
          content: generatedProcedure, 
          toolName: 'Procedure Builder' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Procedure_${procedureType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedProcedure); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📋 Procedure Builder</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Procedure Details</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Grade Level</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                <option value="Pre-K/K">Pre-K / Kindergarten</option>
                <option value="1st-2nd Grade">1st-2nd Grade</option>
                <option value="3rd-5th Grade">3rd-5th Grade</option>
                <option value="6th-8th Grade">6th-8th Grade (Middle)</option>
                <option value="9th-12th Grade">9th-12th Grade (High)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Procedure Type</label>
              <select value={procedureType} onChange={(e) => setProcedureType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                <optgroup label="Arrival & Dismissal">
                  <option value="entering-class">🚪 Entering the Classroom</option>
                  <option value="dismissal">👋 Dismissal</option>
                </optgroup>
                <optgroup label="Movement & Transitions">
                  <option value="transitions">🔄 Transitions</option>
                  <option value="bathroom">🚻 Bathroom/Water</option>
                </optgroup>
                <optgroup label="Attention & Communication">
                  <option value="attention-signal">🔔 Attention Signal</option>
                  <option value="asking-help">✋ Asking for Help</option>
                </optgroup>
                <optgroup label="Work & Materials">
                  <option value="materials">📦 Getting Materials</option>
                  <option value="independent-work">📝 Independent Work</option>
                  <option value="group-work">👥 Group Work</option>
                  <option value="turning-in-work">📥 Turning In Work</option>
                </optgroup>
                <optgroup label="Homework & Makeup">
                  <option value="homework">📚 Homework</option>
                  <option value="makeup-work">🔄 Makeup Work</option>
                </optgroup>
                <optgroup label="Technology & Supplies">
                  <option value="technology">💻 Technology Use</option>
                  <option value="supplies">✏️ Classroom Supplies</option>
                </optgroup>
                <optgroup label="Safety">
                  <option value="emergency">🚨 Emergency Procedures</option>
                </optgroup>
                <optgroup label="Custom">
                  <option value="custom">✨ Custom Procedure</option>
                </optgroup>
              </select>
            </div>

            {procedureType === 'custom' && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Custom Procedure Name</label>
                <input type="text" value={customProcedure} onChange={(e) => setCustomProcedure(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800"
                  placeholder="e.g., Lining up for specials, Getting Chromebooks..." />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Class Context (optional)</label>
              <textarea value={classContext} onChange={(e) => setClassContext(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 h-20 text-sm"
                placeholder="e.g., 28 students, small classroom, students with varying needs, self-contained vs departmentalized..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVisuals}
                    onChange={(e) => setIncludeVisuals(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">🖼️ Visual/Anchor Chart Content</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeTeachingScript}
                    onChange={(e) => setIncludeTeachingScript(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">🗣️ Teaching Script (I Do, We Do, You Do)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includePracticeSchedule}
                    onChange={(e) => setIncludePracticeSchedule(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">📅 Practice Schedule</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeReinforcement}
                    onChange={(e) => setIncludeReinforcement(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">🌟 Reinforcement Strategies</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || (procedureType === 'custom' && !customProcedure.trim())}
              className="w-full bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50">
              {generating ? '📋 Building Procedure...' : '📋 Build Procedure'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Procedure</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedProcedure && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-cyan-600 hover:text-cyan-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedProcedure ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedProcedure}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📋</p>
                  <p className="mb-2">Your procedure will appear here</p>
                  <p className="text-xs">With teaching script, visuals & practice schedule</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}