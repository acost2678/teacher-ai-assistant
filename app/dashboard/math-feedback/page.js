'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function MathFeedbackPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [assignmentType, setAssignmentType] = useState('quiz')
  const [studentName, setStudentName] = useState('')
  const [overallPerformance, setOverallPerformance] = useState('')
  const [strengths, setStrengths] = useState('')
  const [areasForGrowth, setAreasForGrowth] = useState('')
  const [specificErrors, setSpecificErrors] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('growth-mindset')
  const [includeNextSteps, setIncludeNextSteps] = useState(true)
  const [includeEncouragement, setIncludeEncouragement] = useState(true)
  
  const [generatedFeedback, setGeneratedFeedback] = useState('')
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
    setGradeLevel('4th Grade')
    setAssignmentType('quiz')
    setStudentName('Maria')
    setOverallPerformance('Got 7/10 on fraction addition quiz. Showed good work on problems with like denominators but struggled with unlike denominators. Made careless errors on 2 problems.')
    setStrengths('Shows all work clearly, uses visual models to help solve, double-checks answers on most problems')
    setAreasForGrowth('Finding common denominators, simplifying final answers to lowest terms')
    setSpecificErrors('')
    setFeedbackTone('growth-mindset')
    setIncludeNextSteps(true)
    setIncludeEncouragement(true)
    setShowDemo(true)
    setGeneratedFeedback('')
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setAssignmentType('quiz')
    setStudentName('')
    setOverallPerformance('')
    setStrengths('')
    setAreasForGrowth('')
    setSpecificErrors('')
    setFeedbackTone('growth-mindset')
    setIncludeNextSteps(true)
    setIncludeEncouragement(true)
    setShowDemo(false)
    setGeneratedFeedback('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!overallPerformance.trim()) {
      alert('Please describe the overall performance')
      return
    }
    
    setGenerating(true)
    setGeneratedFeedback('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-math-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, assignmentType, studentName, overallPerformance,
          strengths, areasForGrowth, specificErrors, feedbackTone,
          includeNextSteps, includeEncouragement,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedFeedback(data.feedback); await handleSave(data.feedback) }
    } catch (error) { alert('Error generating feedback. Please try again.') }
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
          title: `Math Feedback: ${studentName || 'Student'} (${gradeLevel})`,
          toolType: 'math-feedback',
          toolName: 'Math Feedback',
          content,
          metadata: { gradeLevel, assignmentType, studentName },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedFeedback) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Math Feedback - ${studentName || 'Student'}`, 
          content: generatedFeedback, 
          toolName: 'Math Feedback' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Math_Feedback_${studentName || 'Student'}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedFeedback); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">✨ Math Feedback Writer</h1>
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
                <p className="text-purple-600 text-sm">We've filled in feedback for Maria's fraction quiz. Click Generate to see growth-mindset feedback.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Feedback Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', 'Algebra 1', 'Geometry', 'Algebra 2'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Assignment Type</label>
                <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800">
                  <option value="quiz">📝 Quiz/Test</option>
                  <option value="homework">📚 Homework</option>
                  <option value="classwork">✏️ Classwork</option>
                  <option value="project">🎨 Math Project</option>
                  <option value="problem-set">🔢 Problem Set</option>
                  <option value="assessment">📊 Unit Assessment</option>
                  <option value="exit-ticket">🎫 Exit Ticket</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Student Name (optional)</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                placeholder="e.g., Maria" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Overall Performance <span className="text-rose-500">*</span>
              </label>
              <textarea value={overallPerformance} onChange={(e) => setOverallPerformance(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-24 text-sm"
                placeholder="e.g., Got 7/10 on fraction addition quiz. Showed good work on problems with like denominators but struggled with unlike denominators." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Strengths Observed (optional)</label>
              <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Shows all work, uses visual models, checks answers" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Areas for Growth (optional)</label>
              <textarea value={areasForGrowth} onChange={(e) => setAreasForGrowth(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Finding common denominators, simplifying final answers" />
            </div>

            {/* Feedback Tone */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="block text-gray-800 font-medium mb-2">Feedback Tone</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'growth-mindset', label: '🌱 Growth Mindset', desc: '"Yet" language, learning from mistakes' },
                  { id: 'encouraging', label: '💚 Encouraging', desc: 'Warm, celebrates effort' },
                  { id: 'coaching', label: '🏃 Coaching', desc: 'Challenging but supportive' },
                  { id: 'celebratory', label: '🎉 Celebratory', desc: 'Highly positive' },
                  { id: 'direct', label: '🎯 Direct', desc: 'Clear and specific' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setFeedbackTone(t.id)}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${feedbackTone === t.id ? 'border-green-500 bg-green-100' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className="font-medium text-gray-800 text-sm">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeNextSteps}
                    onChange={(e) => setIncludeNextSteps(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                  <span className="text-gray-700">📝 Next Steps (actionable to-dos)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeEncouragement}
                    onChange={(e) => setIncludeEncouragement(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                  <span className="text-gray-700">💪 Encouragement Message</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !overallPerformance.trim()}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {generating ? '✨ Writing Feedback...' : '✨ Generate Feedback'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Feedback</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedFeedback && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-green-600 hover:text-green-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedFeedback ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedFeedback}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">✨</p>
                  <p className="mb-2">Feedback will appear here</p>
                  <p className="text-xs">Encouraging, specific, growth-mindset</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}