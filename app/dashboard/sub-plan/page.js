'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SubPlanPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd-5th Grade')
  const [subject, setSubject] = useState('All Subjects')
  const [dayLength, setDayLength] = useState('full')
  const [classInfo, setClassInfo] = useState('')
  const [existingPlans, setExistingPlans] = useState('')
  const [specialConsiderations, setSpecialConsiderations] = useState('')
  const [includeEmergencyInfo, setIncludeEmergencyInfo] = useState(true)
  const [includeClassMap, setIncludeClassMap] = useState(true)
  const [includeStudentNotes, setIncludeStudentNotes] = useState(true)
  
  const [generatedPlan, setGeneratedPlan] = useState('')
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
    setGradeLevel('3rd-5th Grade')
    setSubject('All Subjects')
    setDayLength('full')
    setClassInfo('24 students, generally well-behaved class, returns from PE at 10:45, lunch at 12:00-12:45, dismissal at 3:15')
    setExistingPlans('Math: workbook pages 45-46 (fractions review), Reading: continue "Charlotte\'s Web" chapter 8, Science: watch BrainPOP video on ecosystems and complete worksheet')
    setSpecialConsiderations('Student helper is Marcus (can answer questions about routines), fire drill may occur in afternoon, one student has nut allergy (no food sharing)')
    setIncludeEmergencyInfo(true)
    setIncludeClassMap(true)
    setIncludeStudentNotes(true)
    setShowDemo(true)
    setGeneratedPlan('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd-5th Grade')
    setSubject('All Subjects')
    setDayLength('full')
    setClassInfo('')
    setExistingPlans('')
    setSpecialConsiderations('')
    setIncludeEmergencyInfo(true)
    setIncludeClassMap(true)
    setIncludeStudentNotes(true)
    setShowDemo(false)
    setGeneratedPlan('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-sub-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, dayLength, classInfo, existingPlans,
          specialConsiderations, includeEmergencyInfo, includeClassMap, includeStudentNotes,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedPlan(data.subPlan); await handleSave(data.subPlan) }
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
          title: `Sub Plan: ${gradeLevel} - ${dayLength}`,
          toolType: 'sub-plan',
          toolName: 'Substitute Plan',
          content,
          metadata: { gradeLevel, subject, dayLength },
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
          title: `Substitute Teacher Plans`, 
          content: generatedPlan, 
          toolName: 'Substitute Plan' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Sub_Plan.docx`
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
            <h1 className="text-xl font-bold text-gray-800">📝 Substitute Plans</h1>
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
                <p className="text-purple-600 text-sm">We've filled in a full-day sub plan for a 4th grade class. Click Generate to see complete substitute plans.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Plan Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                  <option value="Pre-K/K">Pre-K / Kindergarten</option>
                  <option value="1st-2nd Grade">1st-2nd Grade</option>
                  <option value="3rd-5th Grade">3rd-5th Grade</option>
                  <option value="6th-8th Grade">6th-8th Grade</option>
                  <option value="9th-12th Grade">9th-12th Grade</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Day Length</label>
                <select value={dayLength} onChange={(e) => setDayLength(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                  <option value="full">Full Day</option>
                  <option value="half-am">Half Day (Morning)</option>
                  <option value="half-pm">Half Day (Afternoon)</option>
                  <option value="single-period">Single Period/Class</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Subject(s)</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                <option value="All Subjects">All Subjects (Self-Contained)</option>
                <option value="ELA">ELA/Reading</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Multiple">Multiple Periods (Departmentalized)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Class Information (optional)</label>
              <textarea value={classInfo} onChange={(e) => setClassInfo(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 h-20 text-sm"
                placeholder="e.g., 24 students, class is generally well-behaved, comes from specials at 10:30..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">What Lessons Are Planned? (optional)</label>
              <textarea value={existingPlans} onChange={(e) => setExistingPlans(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Math: workbook pages 45-46, Reading: continue chapter book, Science: watch video and discuss..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Special Considerations (optional)</label>
              <textarea value={specialConsiderations} onChange={(e) => setSpecialConsiderations(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Fire drill scheduled, assembly at 2pm, student with medical needs..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeEmergencyInfo}
                    onChange={(e) => setIncludeEmergencyInfo(e.target.checked)} className="w-5 h-5 text-yellow-600 rounded" />
                  <span className="text-gray-700">🚨 Emergency Procedures</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeClassMap}
                    onChange={(e) => setIncludeClassMap(e.target.checked)} className="w-5 h-5 text-yellow-600 rounded" />
                  <span className="text-gray-700">🗺️ Classroom Map</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeStudentNotes}
                    onChange={(e) => setIncludeStudentNotes(e.target.checked)} className="w-5 h-5 text-yellow-600 rounded" />
                  <span className="text-gray-700">👤 Student Notes Section</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-yellow-600 text-white p-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50">
              {generating ? '📝 Creating Sub Plans...' : '📝 Generate Sub Plans'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Substitute Plans</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedPlan && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-yellow-600 hover:text-yellow-800 text-sm">
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
                  <p className="text-4xl mb-4">📝</p>
                  <p className="mb-2">Your sub plans will appear here</p>
                  <p className="text-xs">Complete, sub-ready lesson plans</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}