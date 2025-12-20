'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BatchProgressReportsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(0)
  const [exporting, setExporting] = useState(false)
  
  // Settings
  const [reportType, setReportType] = useState('progress-report')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [gradingPeriod, setGradingPeriod] = useState('Quarter 2')
  const [tone, setTone] = useState('warm')
  const [reportLength, setReportLength] = useState('medium')
  const [commentStyle, setCommentStyle] = useState('balanced')
  const [includeGoals, setIncludeGoals] = useState(true)
  
  // Students data - privacy-first: no names stored, just numbered entries
  const [numberOfStudents, setNumberOfStudents] = useState(5)
  const [studentNotes, setStudentNotes] = useState([])
  const [generatedReports, setGeneratedReports] = useState([])
  
  const [activeTab, setActiveTab] = useState('input') // 'input' | 'review'
  const [selectedReport, setSelectedReport] = useState(0)
  const [editedReports, setEditedReports] = useState([])
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

  // Initialize student notes array when number changes
  useEffect(() => {
    if (!showDemo) {
      setStudentNotes(prev => {
        const newNotes = [...prev]
        while (newNotes.length < numberOfStudents) {
          newNotes.push({ identifier: `Student ${newNotes.length + 1}`, grade: '', strengths: '', improvements: '', behavior: '', notes: '' })
        }
        return newNotes.slice(0, numberOfStudents)
      })
    }
  }, [numberOfStudents, showDemo])

  const handleShowDemo = () => {
    setReportType('progress-report')
    setGradeLevel('4th Grade')
    setSubject('Mathematics')
    setGradingPeriod('Quarter 2')
    setTone('warm')
    setReportLength('medium')
    setCommentStyle('balanced')
    setIncludeGoals(true)
    setNumberOfStudents(3)
    setStudentNotes([
      { 
        identifier: 'Student A', 
        grade: 'A-',
        strengths: 'Excellent problem-solving, strong multiplication facts, helps classmates', 
        improvements: 'Needs to show work on multi-step problems', 
        behavior: 'Model student, always prepared',
        notes: 'Very engaged during math centers' 
      },
      { 
        identifier: 'Student B', 
        grade: 'B',
        strengths: 'Great effort and persistence, improved on fractions', 
        improvements: 'Struggles with word problems, needs extra time', 
        behavior: 'Good participation, sometimes off-task',
        notes: 'Benefits from visual models' 
      },
      { 
        identifier: 'Student C', 
        grade: 'C+',
        strengths: 'Quick with mental math, participates actively', 
        improvements: 'Rushes through work, makes careless errors', 
        behavior: 'Enthusiastic but needs reminders to slow down',
        notes: 'Encourage to double-check answers' 
      },
    ])
    setGeneratedReports([])
    setActiveTab('input')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setReportType('progress-report')
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setGradingPeriod('Quarter 2')
    setTone('warm')
    setReportLength('medium')
    setCommentStyle('balanced')
    setIncludeGoals(true)
    setNumberOfStudents(5)
    setStudentNotes([])
    setGeneratedReports([])
    setActiveTab('input')
    setShowDemo(false)
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateStudentNote = (index, field, value) => {
    setStudentNotes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleGenerate = async () => {
    // Validate that at least some notes are filled
    const hasNotes = studentNotes.some(s => s.strengths || s.improvements || s.notes)
    if (!hasNotes) {
      alert('Please add notes for at least one student')
      return
    }

    setGenerating(true)
    setGeneratedReports([])
    setCurrentStudent(0)

    try {
      const reports = []
      
      for (let i = 0; i < studentNotes.length; i++) {
        setCurrentStudent(i + 1)
        
        const student = studentNotes[i]
        // Skip students with no notes
        if (!student.strengths && !student.improvements && !student.notes) {
          reports.push({
            identifier: student.identifier,
            report: '[No notes provided - skipped]',
            skipped: true
          })
          continue
        }

        const response = await fetch('/api/batch-progress-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType,
            gradeLevel,
            subject,
            gradingPeriod,
            tone,
            reportLength,
            commentStyle,
            includeGoals,
            studentIdentifier: student.identifier,
            grade: student.grade,
            strengths: student.strengths,
            improvements: student.improvements,
            behavior: student.behavior,
            notes: student.notes,
          }),
        })

        const data = await response.json()
        
        if (data.error) {
          reports.push({
            identifier: student.identifier,
            report: `[Error generating report: ${data.error}]`,
            error: true
          })
        } else {
          reports.push({
            identifier: student.identifier,
            report: data.report,
            skipped: false,
            error: false
          })
        }
      }

      setGeneratedReports(reports)
      setEditedReports(reports.map(r => r.report))
      setActiveTab('review')
      setSelectedReport(0)
      
    } catch (error) {
      alert('Error generating reports. Please try again.')
    }

    setGenerating(false)
    setCurrentStudent(0)
  }

  const handleExportAll = async () => {
    if (generatedReports.length === 0) return
    setExporting(true)

    try {
      // Create combined content for export
      let combinedContent = `PROGRESS REPORTS - ${subject}\n`
      combinedContent += `Grade Level: ${gradeLevel} | ${gradingPeriod}\n`
      combinedContent += `Generated: ${new Date().toLocaleDateString()}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      generatedReports.forEach((report, index) => {
        if (!report.skipped && !report.error) {
          combinedContent += `--- ${report.identifier} ---\n\n`
          combinedContent += editedReports[index] || report.report
          combinedContent += `\n\n${'='.repeat(60)}\n\n`
        }
      })

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Progress Reports - ${subject} - ${gradingPeriod}`,
          content: combinedContent,
          toolName: 'Batch Progress Reports'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Progress_Reports_${subject.replace(/\s+/g, '_')}_${gradingPeriod.replace(/\s+/g, '_')}.docx`
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

  const handleCopyAll = () => {
    let combinedContent = ''
    generatedReports.forEach((report, index) => {
      if (!report.skipped && !report.error) {
        combinedContent += `--- ${report.identifier} ---\n\n`
        combinedContent += editedReports[index] || report.report
        combinedContent += `\n\n---\n\n`
      }
    })
    navigator.clipboard.writeText(combinedContent)
    alert('All reports copied to clipboard!')
  }

  const completedReports = generatedReports.filter(r => !r.skipped && !r.error).length

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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Batch Student Reports</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📊</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch Student Reports</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Generate progress reports OR report card comments for your entire class. One tool, two formats.</p>
            </div>
          </div>

          {/* Report Type Toggle */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <h3 className="text-purple-800 font-medium mb-3">What do you need?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportType('progress-report')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  reportType === 'progress-report'
                    ? 'border-purple-500 bg-white'
                    : 'border-gray-200 bg-white/50 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>📄</span>
                  <span className="font-medium text-gray-800">Progress Report</span>
                </div>
                <p className="text-xs text-gray-500">Standalone documents to send home (conferences, mid-quarter updates)</p>
              </button>
              <button
                onClick={() => setReportType('report-card-comment')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  reportType === 'report-card-comment'
                    ? 'border-purple-500 bg-white'
                    : 'border-gray-200 bg-white/50 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>📝</span>
                  <span className="font-medium text-gray-800">Report Card Comment</span>
                </div>
                <p className="text-xs text-gray-500">Short narrative comments to paste into your report card system</p>
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Student names are never stored. Use identifiers like "Student 1" or initials. Reports generate with "[Student Name]" placeholders - fill in real names after downloading.</p>
              </div>
            </div>
          </div>

          {/* See Demo Button */}
          <div className="flex gap-3">
            {!showDemo ? (
              <button
                onClick={handleShowDemo}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                <span>✨</span> See Demo
              </button>
            ) : (
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <span>↺</span> Reset Demo
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'input'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. Enter Notes
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedReports.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            2. Review & Export {completedReports > 0 && `(${completedReports})`}
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {reportType === 'progress-report' ? 'Report Settings' : 'Comment Settings'} (applies to all)
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'General/All Subjects'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grading Period</label>
                  <select value={gradingPeriod} onChange={(e) => setGradingPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Semester 1', 'Semester 2', 'Trimester 1', 'Trimester 2', 'Trimester 3', 'Mid-Year', 'End of Year'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {reportType === 'progress-report' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      <option value="warm">Warm & Encouraging</option>
                      <option value="professional">Professional & Direct</option>
                      <option value="detailed">Detailed & Thorough</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment Style</label>
                    <select value={commentStyle} onChange={(e) => setCommentStyle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      <option value="balanced">Balanced (Strengths + Growth)</option>
                      <option value="strength-focused">Strength-Focused</option>
                      <option value="growth-focused">Growth-Focused</option>
                      <option value="celebratory">Celebratory</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {reportType === 'progress-report' ? 'Report Length' : 'Comment Length'}
                  </label>
                  <select value={reportLength} onChange={(e) => setReportLength(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="short">Short (2-3 sentences)</option>
                    <option value="medium">Medium (4-5 sentences)</option>
                    <option value="long">Long (6-8 sentences)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                  <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {[5, 10, 15, 20, 25, 30, 35].map(n => (
                      <option key={n} value={n}>{n} students</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {reportType === 'report-card-comment' && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGoals}
                      onChange={(e) => setIncludeGoals(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 text-sm">Include goals/next steps in comments</span>
                  </label>
                </div>
              )}
            </div>

            {/* Student Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Student Notes</h2>
                <span className="text-sm text-gray-500">Quick notes → AI writes the full report</span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {studentNotes.map((student, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={student.identifier}
                        onChange={(e) => updateStudentNote(index, 'identifier', e.target.value)}
                        placeholder="Student identifier (e.g., 'Student 1' or initials)"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {reportType === 'report-card-comment' && (
                        <input
                          type="text"
                          value={student.grade || ''}
                          onChange={(e) => updateStudentNote(index, 'grade', e.target.value)}
                          placeholder="Grade (A, B+, etc.)"
                          className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                    </div>
                    <div className={`grid grid-cols-1 gap-3 ${reportType === 'report-card-comment' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Strengths</label>
                        <textarea
                          value={student.strengths}
                          onChange={(e) => updateStudentNote(index, 'strengths', e.target.value)}
                          placeholder="What's going well?"
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Areas for Growth</label>
                        <textarea
                          value={student.improvements}
                          onChange={(e) => updateStudentNote(index, 'improvements', e.target.value)}
                          placeholder="What needs work?"
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      {reportType === 'report-card-comment' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Behavior/Work Habits</label>
                          <textarea
                            value={student.behavior || ''}
                            onChange={(e) => updateStudentNote(index, 'behavior', e.target.value)}
                            placeholder="Participation, effort..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Additional Notes</label>
                        <textarea
                          value={student.notes}
                          onChange={(e) => updateStudentNote(index, 'notes', e.target.value)}
                          placeholder={reportType === 'progress-report' ? 'Behavior, participation, etc.' : 'IEP, special programs, context...'}
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating {reportType === 'progress-report' ? 'report' : 'comment'} {currentStudent} of {numberOfStudents}...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate All {reportType === 'progress-report' ? 'Reports' : 'Comments'} ({numberOfStudents} students)
                </>
              )}
            </button>

            {generating && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-purple-600">{currentStudent} / {numberOfStudents}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStudent / numberOfStudents) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && generatedReports.length > 0 && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Reports</h2>
                  <p className="text-gray-500 text-sm">{completedReports} reports ready • Review and edit before exporting</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                  >
                    📋 Copy All
                  </button>
                  <button
                    onClick={handleExportAll}
                    disabled={exporting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {exporting ? 'Exporting...' : '📄 Export All (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Report Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Report List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Reports</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {generatedReports.map((report, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedReport(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedReport === index
                          ? 'bg-purple-100 text-purple-700'
                          : report.skipped || report.error
                          ? 'bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{report.identifier}</span>
                      {report.skipped && <span className="text-xs ml-2">(skipped)</span>}
                      {report.error && <span className="text-xs ml-2 text-red-500">(error)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report Preview/Edit */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">
                    {generatedReports[selectedReport]?.identifier}
                  </h3>
                  <span className="text-xs text-gray-500">Edit below if needed</span>
                </div>
                <textarea
                  value={editedReports[selectedReport] || ''}
                  onChange={(e) => {
                    const updated = [...editedReports]
                    updated[selectedReport] = e.target.value
                    setEditedReports(updated)
                  }}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Replace "[Student Name]" with the actual name after downloading
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('input')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Edit Notes
            </button>
          </div>
        )}
      </main>
    </div>
  )
}