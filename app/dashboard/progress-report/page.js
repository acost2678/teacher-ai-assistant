'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function ProgressReportPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('General')
  const [reportingPeriod, setReportingPeriod] = useState('Quarter 1')
  const [standardsFramework, setStandardsFramework] = useState('common-core')
  const [includeStandardCodes, setIncludeStandardCodes] = useState(false)
  const [strengths, setStrengths] = useState('')
  const [areasForGrowth, setAreasForGrowth] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [uploadedContent, setUploadedContent] = useState('')
  const [generatedReport, setGeneratedReport] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
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

  const handleGenerate = async () => {
    if (!studentName) {
      alert('Please enter student name')
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
          studentName, gradeLevel, subject, reportingPeriod,
          standardsFramework, includeStandardCodes, strengths, areasForGrowth, additionalNotes, uploadedContent,
        }),
      })
      const data = await response.json()
      if (data.error) {
        alert('Error generating report: ' + data.error)
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
      const title = `Progress Report: ${studentName} - ${reportingPeriod}`
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, title, toolType: 'progress-report', toolName: 'Progress Report',
          content, metadata: { studentName, gradeLevel, subject, reportingPeriod, standardsFramework },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving document:', error)
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
          title: `Progress Report - ${studentName} - ${reportingPeriod}`,
          content: generatedReport,
          toolName: 'Progress Report',
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
      alert('Failed to export document')
    }
    setExporting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Progress Report Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Report Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Student Name *</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" placeholder="Enter student's name" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Subject Area</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  {['General', 'English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Foreign Language'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Reporting Period</label>
                <select value={reportingPeriod} onChange={(e) => setReportingPeriod(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  {['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Semester 1', 'Semester 2', 'Mid-Year', 'End of Year'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Standards Framework</label>
              <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                <option value="common-core">Common Core State Standards (CCSS)</option>
                <option value="ngss">Next Generation Science Standards (NGSS)</option>
                <option value="texas-teks">Texas TEKS</option>
                <option value="virginia-sol">Virginia SOLs</option>
                <option value="california">California State Standards</option>
                <option value="florida-best">Florida B.E.S.T. Standards</option>
                <option value="new-york">New York State Standards</option>
              </select>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input type="checkbox" id="includeStandardCodes" checked={includeStandardCodes}
                onChange={(e) => setIncludeStandardCodes(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
              <label htmlFor="includeStandardCodes" className="text-gray-700">Include standard codes in report</label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Strengths (optional)</label>
              <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-20"
                placeholder="What is the student excelling at?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Areas for Growth (optional)</label>
              <textarea value={areasForGrowth} onChange={(e) => setAreasForGrowth(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-20"
                placeholder="What areas need improvement?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Additional Notes (optional)</label>
              <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-20"
                placeholder="Any other observations or comments..." />
            </div>

            {/* File Upload */}
            <FileUpload
              onContentExtracted={setUploadedContent}
              label="Upload Grade Data or Assessments (Optional)"
              helpText="Upload gradebook exports, assessment results, or work samples for more detailed reports"
              placeholder="Paste grade data, assessment scores, or other relevant information..."
            />

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Progress Report'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Report</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedReport && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-green-600 hover:text-green-800 text-sm">{copied ? '✓ Copied!' : 'Copy'}</button>
                  <button onClick={handleExportDocx} disabled={exporting} className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedReport ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[600px]">{generatedReport}</div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div><p className="mb-2">Your generated progress report will appear here</p><p className="text-xs">Standards-aligned based on your selection</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}