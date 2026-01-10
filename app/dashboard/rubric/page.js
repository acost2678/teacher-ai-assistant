'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RubricPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportingTable, setExportingTable] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [assignmentType, setAssignmentType] = useState('Essay')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [rubricStyle, setRubricStyle] = useState('analytic')
  const [pointScale, setPointScale] = useState('4')
  const [criteria, setCriteria] = useState('')
  const [includeStudentVersion, setIncludeStudentVersion] = useState(true)
  const [includeExemplars, setIncludeExemplars] = useState(false)
  
  const [generatedRubric, setGeneratedRubric] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const outputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {
        router.push('/auth/login')
      }
    }
    checkSession()
  }, [router])

  const handleShowDemo = () => {
    setGradeLevel('6th Grade')
    setSubject('English Language Arts')
    setAssignmentType('Essay')
    setAssignmentDescription('Persuasive essay arguing for or against school uniforms. 5 paragraphs, must include introduction with thesis, 3 body paragraphs with evidence, and conclusion.')
    setRubricStyle('analytic')
    setPointScale('4')
    setCriteria('Thesis clarity, use of evidence, organization, counterargument, grammar and mechanics')
    setIncludeStudentVersion(true)
    setIncludeExemplars(true)
    setShowDemo(true)
    setGeneratedRubric('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setAssignmentType('Essay')
    setAssignmentDescription('')
    setRubricStyle('analytic')
    setPointScale('4')
    setCriteria('')
    setIncludeStudentVersion(true)
    setIncludeExemplars(false)
    setShowDemo(false)
    setGeneratedRubric('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
          rubricStyle, pointScale, criteria, includeStudentVersion, includeExemplars,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedRubric(data.rubric)
        await handleSave(data.rubric)
      }
    } catch (error) {
      alert('Error generating rubric. Please try again.')
    }
    
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
          title: `Rubric: ${assignmentType}`,
          toolType: 'rubric',
          toolName: 'Rubric',
          content,
          metadata: { gradeLevel, subject, assignmentType, rubricStyle, pointScale },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedRubric) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Rubric - ${assignmentType}`,
          content: generatedRubric,
          toolName: 'Rubric'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Rubric_${assignmentType.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Failed to export')
    }
    setExporting(false)
  }

  const handleExportTable = async () => {
    if (!generatedRubric) return
    setExportingTable(true)
    try {
      const response = await fetch('/api/export-rubric-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rubricContent: generatedRubric,
          assignmentType,
          gradeLevel,
          subject,
          pointScale
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Rubric_Table_${assignmentType.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Failed to export table')
    }
    setExportingTable(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRubric)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Rubric Builder</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Rubric Builder</h1>
              <p className="text-gray-500">Create clear scoring criteria for any assignment.</p>
            </div>
            <div className="flex items-center gap-3">
              {showDemo && (
                <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowDemo} className={`text-sm font-medium transition-colors ${showDemo ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                See Demo
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in example inputs. Click Generate to see a sample output.</p>
                </div>
                <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  Scroll to view output
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level: *</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject: *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type:</label>
              <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Essay', 'Presentation', 'Project', 'Lab Report', 'Discussion', 'Creative Writing', 'Research Paper', 'Performance', 'Portfolio', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rubric Style:</label>
              <select value={rubricStyle} onChange={(e) => setRubricStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                <option value="analytic">Analytic (separate score per criterion)</option>
                <option value="holistic">Holistic (single overall score)</option>
                <option value="single-point">Single-Point (proficiency + feedback space)</option>
                <option value="checklist">Checklist (yes/no for each criterion)</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Point Scale:</label>
            <select value={pointScale} onChange={(e) => setPointScale(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer"
              disabled={rubricStyle === 'single-point' || rubricStyle === 'checklist'}>
              <option value="4">4-Point (Exceeds, Meets, Approaching, Beginning)</option>
              <option value="3">3-Point (Proficient, Developing, Beginning)</option>
              <option value="5">5-Point (Exemplary, Proficient, Developing, Beginning, Not Yet)</option>
              <option value="100">Percentage (A, B, C, D, F)</option>
            </select>
            {(rubricStyle === 'single-point' || rubricStyle === 'checklist') && (
              <p className="text-xs text-gray-500 mt-1">Point scale not applicable for {rubricStyle === 'single-point' ? 'single-point' : 'checklist'} rubrics</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Description: *</label>
            <textarea value={assignmentDescription} onChange={(e) => setAssignmentDescription(e.target.value)} placeholder="Describe the assignment, expectations, and requirements..."
              rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Specific Criteria to Include (optional):</label>
            <textarea value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="e.g., Thesis clarity, use of evidence, organization, creativity..."
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeStudentVersion} onChange={(e) => setIncludeStudentVersion(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
              <div>
                <span className="text-gray-700">Include student-friendly version</span>
                <p className="text-sm text-gray-500">Add a simplified rubric in kid-friendly language</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeExemplars} onChange={(e) => setIncludeExemplars(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
              <div>
                <span className="text-gray-700">Include exemplar descriptions</span>
                <p className="text-sm text-gray-500">Add examples of what excellent work looks like</p>
              </div>
            </label>
          </div>

          <button onClick={handleGenerate} disabled={generating || !assignmentDescription}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Rubric</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedRubric && (
              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export Text'}
                </button>
                <button onClick={handleExportTable} disabled={exportingTable} className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium disabled:bg-purple-300">
                  {exportingTable ? 'Exporting...' : '📊 Download Table'}
                </button>
              </div>
            )}
          </div>

          {generatedRubric ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedRubric}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-400">Your generated rubric will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}