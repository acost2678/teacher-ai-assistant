'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function WritingConferencePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('9th Grade')
  const [studentName, setStudentName] = useState('')
  const [writingType, setWritingType] = useState('')
  const [conferenceType, setConferenceType] = useState('process')
  const [currentStrengths, setCurrentStrengths] = useState('')
  const [currentChallenges, setCurrentChallenges] = useState('')
  const [previousGoals, setPreviousGoals] = useState('')
  const [studentWritingSample, setStudentWritingSample] = useState('')
  const [includeGoals, setIncludeGoals] = useState(true)
  const [includeStrategies, setIncludeStrategies] = useState(true)
  const [includeFollowUp, setIncludeFollowUp] = useState(true)
  
  const [generatedNotes, setGeneratedNotes] = useState('')
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
    setGeneratedNotes('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-writing-conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, studentName, writingType, conferenceType,
          currentStrengths, currentChallenges, previousGoals,
          studentWritingSample, includeGoals, includeStrategies, includeFollowUp,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedNotes(data.notes); await handleSave(data.notes) }
    } catch (error) { alert('Error generating notes. Please try again.') }
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
          title: `Conference: ${studentName || 'Student'} (${conferenceType})`,
          toolType: 'writing-conference',
          toolName: 'Writing Conference',
          content,
          metadata: { gradeLevel, studentName, writingType, conferenceType },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedNotes) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Writing Conference - ${studentName || 'Student'}`, 
          content: generatedNotes, 
          toolName: 'Writing Conference' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Writing_Conference_${studentName || 'Student'}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedNotes); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📋 Writing Conference Notes</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Conference Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Student Name</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800"
                  placeholder="Student's name" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                    '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Writing Assignment</label>
                <input type="text" value={writingType} onChange={(e) => setWritingType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800"
                  placeholder="e.g., Argumentative essay, Personal narrative" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Conference Type</label>
                <select value={conferenceType} onChange={(e) => setConferenceType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  <option value="initial">Initial Conference</option>
                  <option value="process">Process Check-In</option>
                  <option value="revision">Revision Conference</option>
                  <option value="editing">Editing Conference</option>
                  <option value="goal-setting">Goal-Setting</option>
                  <option value="celebration">Celebration</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Observed Strengths</label>
              <textarea value={currentStrengths} onChange={(e) => setCurrentStrengths(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 h-20 text-sm"
                placeholder="What is this student doing well? (voice, organization, detail, etc.)" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Current Challenges</label>
              <textarea value={currentChallenges} onChange={(e) => setCurrentChallenges(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 h-20 text-sm"
                placeholder="What does this student need to work on?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Previous Goals (if any)</label>
              <textarea value={previousGoals} onChange={(e) => setPreviousGoals(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 h-16 text-sm"
                placeholder="Goals from last conference to check on..." />
            </div>

            {/* Student Writing Sample */}
            <FileUpload
              onContentExtracted={setStudentWritingSample}
              label="Student Writing Sample (Optional)"
              helpText="Paste or upload the student's current draft for reference"
              placeholder="Paste student's writing here for analysis..."
            />

            {/* Include Options */}
            <div className="mb-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <label className="block text-gray-800 font-medium mb-3">Include in Notes</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeGoals}
                    onChange={(e) => setIncludeGoals(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">🎯 New Goals Section</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeStrategies}
                    onChange={(e) => setIncludeStrategies(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">🛠️ Strategies to Try</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeFollowUp}
                    onChange={(e) => setIncludeFollowUp(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                  <span className="text-gray-700">📅 Follow-Up Plan</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50">
              {generating ? '📋 Generating Notes...' : '📋 Generate Conference Notes'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Notes</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedNotes && (
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

            {generatedNotes ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedNotes}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📋</p>
                  <p className="mb-2">Your conference notes will appear here</p>
                  <p className="text-xs">Track progress, set goals, plan next steps</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}