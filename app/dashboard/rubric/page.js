'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function RubricPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [assignmentType, setAssignmentType] = useState('essay')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [rubricStyle, setRubricStyle] = useState('analytic')
  const [pointScale, setPointScale] = useState('4')
  const [criteria, setCriteria] = useState('')
  const [includeExemplars, setIncludeExemplars] = useState(false)
  const [studentFriendly, setStudentFriendly] = useState(true)
  
  const [generatedRubric, setGeneratedRubric] = useState('')
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
    if (!assignmentDescription) {
      alert('Please describe the assignment')
      return
    }
    setGenerating(true)
    setGeneratedRubric('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, assignmentType, assignmentDescription,
          rubricStyle, pointScale, criteria, includeExemplars, studentFriendly,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedRubric(data.rubric); await handleSave(data.rubric) }
    } catch (error) { alert('Error generating rubric. Please try again.') }
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
          title: `Rubric: ${assignmentType} - ${assignmentDescription.substring(0, 30)}...`,
          toolType: 'rubric',
          toolName: 'Rubric',
          content,
          metadata: { gradeLevel, subject, assignmentType, rubricStyle, pointScale },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedRubric) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Rubric - ${assignmentType}`, content: generatedRubric, toolName: 'Rubric' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Rubric_${assignmentType.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedRubric); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Rubric Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Rubric Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Assignment Type</label>
              <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                <option value="essay">Essay / Written Response</option>
                <option value="presentation">Presentation / Speech</option>
                <option value="project">Project / Product</option>
                <option value="lab-report">Lab Report</option>
                <option value="research">Research Paper</option>
                <option value="creative">Creative Writing</option>
                <option value="discussion">Discussion / Participation</option>
                <option value="portfolio">Portfolio</option>
                <option value="performance">Performance Task</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Assignment Description *</label>
              <textarea value={assignmentDescription} onChange={(e) => setAssignmentDescription(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 h-20"
                placeholder="Describe what students will do. e.g., 'Write a 5-paragraph persuasive essay arguing for or against school uniforms'" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Rubric Style</label>
                <select value={rubricStyle} onChange={(e) => setRubricStyle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                  <option value="analytic">Analytic (separate scores)</option>
                  <option value="holistic">Holistic (one overall score)</option>
                  <option value="single-point">Single-Point (proficiency only)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Point Scale</label>
                <select value={pointScale} onChange={(e) => setPointScale(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                  <option value="4">4-point (Exceeds → Beginning)</option>
                  <option value="5">5-point (Exemplary → Not Yet)</option>
                  <option value="3">3-point (Proficient → Beginning)</option>
                  <option value="100">Percentage (A, B, C, F)</option>
                </select>
              </div>
            </div>

            {/* Custom Criteria */}
            <div className="mb-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
              <label className="block text-gray-800 font-medium mb-2">📋 Custom Criteria (Optional)</label>
              <p className="text-sm text-gray-600 mb-2">
                List specific criteria you want assessed. Leave blank for auto-generated criteria.
              </p>
              <textarea value={criteria} onChange={(e) => setCriteria(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 h-20"
                placeholder="e.g., 
- Thesis statement clarity
- Use of evidence
- Organization
- Grammar and mechanics" />
            </div>

            {/* Options */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={studentFriendly}
                  onChange={(e) => setStudentFriendly(e.target.checked)} className="w-5 h-5 text-rose-600 rounded" />
                <div>
                  <span className="text-gray-700 font-medium">Student-Friendly Language</span>
                  <p className="text-xs text-gray-500">Use simple language students can understand</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeExemplars}
                  onChange={(e) => setIncludeExemplars(e.target.checked)} className="w-5 h-5 text-rose-600 rounded" />
                <div>
                  <span className="text-gray-700 font-medium">Include Exemplar Descriptions</span>
                  <p className="text-xs text-gray-500">Examples of what excellent work looks like</p>
                </div>
              </label>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-rose-600 text-white p-3 rounded-lg hover:bg-rose-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Rubric'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Rubric</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedRubric && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-rose-600 hover:text-rose-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedRubric ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedRubric}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your rubric will appear here</p>
                  <p className="text-xs">Professional assessment rubrics</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}