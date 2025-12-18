'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function PacingGuidePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [unitTopic, setUnitTopic] = useState('')
  const [timeframe, setTimeframe] = useState('3 weeks')
  const [totalDays, setTotalDays] = useState('15')
  const [standardsFramework, setStandardsFramework] = useState('common-core')
  const [customStandards, setCustomStandards] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [endGoals, setEndGoals] = useState('')
  const [assessmentDates, setAssessmentDates] = useState('')
  const [includeHolidays, setIncludeHolidays] = useState(false)
  const [holidays, setHolidays] = useState('')
  const [uploadedContent, setUploadedContent] = useState('')
  
  const [generatedGuide, setGeneratedGuide] = useState('')
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
    if (!unitTopic) {
      alert('Please enter a unit topic')
      return
    }
    setGenerating(true)
    setGeneratedGuide('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-pacing-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, unitTopic, timeframe, totalDays,
          standardsFramework, customStandards, priorKnowledge, endGoals,
          assessmentDates, includeHolidays, holidays, uploadedContent,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedGuide(data.pacingGuide); await handleSave(data.pacingGuide) }
    } catch (error) { alert('Error generating pacing guide. Please try again.') }
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
          title: `Pacing Guide: ${unitTopic}`,
          toolType: 'pacing-guide',
          toolName: 'Pacing Guide',
          content,
          metadata: { gradeLevel, subject, unitTopic, timeframe, totalDays },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedGuide) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Pacing Guide - ${unitTopic}`, content: generatedGuide, toolName: 'Pacing Guide' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Pacing_Guide_${unitTopic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedGuide); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Pacing Guide Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Unit Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Unit/Topic *</label>
              <input type="text" value={unitTopic} onChange={(e) => setUnitTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                placeholder="e.g., Fraction Operations, American Revolution, Persuasive Writing" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Timeframe</label>
                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                  {['1 week', '2 weeks', '3 weeks', '4 weeks', '6 weeks', '9 weeks (Quarter)', '18 weeks (Semester)'].map(t => 
                    <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Total Instructional Days</label>
                <input type="number" value={totalDays} onChange={(e) => setTotalDays(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                  placeholder="e.g., 15" min="1" max="90" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Standards Framework</label>
              <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                <option value="common-core">Common Core State Standards (CCSS)</option>
                <option value="ngss">Next Generation Science Standards (NGSS)</option>
                <option value="texas-teks">Texas TEKS</option>
                <option value="virginia-sol">Virginia SOLs</option>
                <option value="california">California State Standards</option>
                <option value="florida-best">Florida B.E.S.T. Standards</option>
                <option value="new-york">New York State Standards</option>
              </select>
            </div>

            {/* Paste Your Standards */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-gray-800 font-medium mb-2">📋 Paste Your Standards (Recommended)</label>
              <textarea value={customStandards} onChange={(e) => setCustomStandards(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 h-20"
                placeholder="Paste the specific standards for this unit..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">End Goals / What Students Should Master</label>
              <textarea value={endGoals} onChange={(e) => setEndGoals(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 h-16"
                placeholder="What should students be able to do by the end?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Prior Knowledge Required</label>
              <textarea value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 h-16"
                placeholder="What should students already know?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Assessment Dates (if known)</label>
              <input type="text" value={assessmentDates} onChange={(e) => setAssessmentDates(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                placeholder="e.g., Quiz on Day 5, Unit Test on Day 15" />
            </div>

            {/* Holidays */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <input type="checkbox" id="includeHolidays" checked={includeHolidays}
                  onChange={(e) => setIncludeHolidays(e.target.checked)} className="w-5 h-5 text-teal-600 rounded" />
                <label htmlFor="includeHolidays" className="text-gray-800 font-medium">Account for holidays/non-instructional days</label>
              </div>
              {includeHolidays && (
                <textarea value={holidays} onChange={(e) => setHolidays(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 h-16 mt-2"
                  placeholder="e.g., No school Oct 14 (Columbus Day), Oct 21-22 (Fall Break)" />
              )}
            </div>

            {/* File Upload */}
            <FileUpload
              onContentExtracted={setUploadedContent}
              label="Upload Curriculum Map or Scope & Sequence (Optional)"
              helpText="Upload existing curriculum documents to ensure alignment"
              placeholder="Paste content from your curriculum map, scope & sequence, or previous pacing guides..."
            />

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Pacing Guide'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Pacing Guide</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedGuide && (
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

            {generatedGuide ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedGuide}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your pacing guide will appear here</p>
                  <p className="text-xs">Day-by-day planning for your unit</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}