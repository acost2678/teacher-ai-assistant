'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ProgressReportPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [studentName, setStudentName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [reportingPeriod, setReportingPeriod] = useState('Quarter 1')
  const [academicPerformance, setAcademicPerformance] = useState('')
  const [strengths, setStrengths] = useState('')
  const [areasForGrowth, setAreasForGrowth] = useState('')
  const [behaviorNotes, setBehaviorNotes] = useState('')
  const [recommendations, setRecommendations] = useState('')
  
  const [generatedReport, setGeneratedReport] = useState('')
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
    setStudentName('Emily Rodriguez')
    setGradeLevel('4th Grade')
    setSubject('Mathematics')
    setReportingPeriod('Quarter 2')
    setAcademicPerformance('Emily has maintained a B+ average this quarter. She excels in multiplication and division but struggles with word problems.')
    setStrengths('Strong number sense, excellent mental math skills, always shows her work, participates actively in class discussions.')
    setAreasForGrowth('Reading comprehension in word problems, explaining mathematical reasoning in writing.')
    setBehaviorNotes('Emily is respectful and kind to classmates. She sometimes rushes through assignments.')
    setRecommendations('Practice word problems at home, read problems twice before solving, continue using math games.')
    setShowDemo(true)
    setGeneratedReport('')
  }

  const handleResetDemo = () => {
    setStudentName('')
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setReportingPeriod('Quarter 1')
    setAcademicPerformance('')
    setStrengths('')
    setAreasForGrowth('')
    setBehaviorNotes('')
    setRecommendations('')
    setShowDemo(false)
    setGeneratedReport('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!studentName || !academicPerformance) {
      alert('Please enter student name and academic performance notes')
      return
    }
    
    setGenerating(true)
    setGeneratedReport('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          gradeLevel,
          subject,
          reportingPeriod,
          academicPerformance,
          strengths,
          areasForGrowth,
          behaviorNotes,
          recommendations,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedReport(data.report)
        await handleSave(data.report)
      }
    } catch (error) {
      alert('Error generating report. Please try again.')
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
          title: `Progress Report: ${studentName}`,
          toolType: 'progress-report',
          toolName: 'Progress Report',
          content,
          metadata: { studentName, gradeLevel, subject, reportingPeriod },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedReport) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Progress Report - ${studentName}`,
          content: generatedReport,
          toolName: 'Progress Report'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Progress_Report_${studentName.replace(/\s+/g, '_')}.docx`
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReport)
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
            <span className="text-gray-800 font-medium">Progress Report</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Progress Report</h1>
              <p className="text-gray-500">Generate narrative student progress reports aligned to standards.</p>
            </div>
            <div className="flex items-center gap-3">
              {showDemo && (
                <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowDemo} className={`text-sm font-medium transition-colors ${showDemo ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                Show Demo
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in example inputs and generated an example output.</p>
                </div>
                <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  Scroll to view output
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name: *</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student's name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level: *</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science', 'All Subjects'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Period:</label>
              <select value={reportingPeriod} onChange={(e) => setReportingPeriod(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Semester 1', 'Semester 2', 'Trimester 1', 'Trimester 2', 'Trimester 3', 'End of Year'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Performance Notes: *</label>
            <textarea value={academicPerformance} onChange={(e) => setAcademicPerformance(e.target.value)} placeholder="Describe grades, test scores, assignment completion, understanding of concepts..."
              rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Strengths:</label>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="What does the student do well?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Growth:</label>
            <textarea value={areasForGrowth} onChange={(e) => setAreasForGrowth(e.target.value)} placeholder="What skills or concepts need improvement?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Behavior & Social Notes:</label>
            <textarea value={behaviorNotes} onChange={(e) => setBehaviorNotes(e.target.value)} placeholder="How does the student interact with peers and participate in class?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations for Home:</label>
            <textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} placeholder="What can parents do to support learning at home?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <button onClick={handleGenerate} disabled={generating || !studentName || !academicPerformance}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Report</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedReport && (
              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export .docx'}
                </button>
              </div>
            )}
          </div>

          {generatedReport ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedReport}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-400">Your generated report will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}