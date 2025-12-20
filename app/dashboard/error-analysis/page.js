'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ErrorAnalysisPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [mathTopic, setMathTopic] = useState('fractions')
  const [problem, setProblem] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [showWork, setShowWork] = useState('')
  const [errorPatterns, setErrorPatterns] = useState('')
  const [includeReteaching, setIncludeReteaching] = useState(true)
  const [includeParentExplanation, setIncludeParentExplanation] = useState(false)
  
  const [generatedAnalysis, setGeneratedAnalysis] = useState('')
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
    setMathTopic('fractions')
    setProblem('3/4 + 1/2 = ?')
    setCorrectAnswer('1 1/4 (or 5/4)')
    setStudentAnswer('4/6')
    setShowWork('Student wrote: 3+1=4 on top, 4+2=6 on bottom, so 4/6')
    setErrorPatterns('This is a common error I see with fraction addition')
    setIncludeReteaching(true)
    setIncludeParentExplanation(true)
    setShowDemo(true)
    setGeneratedAnalysis('')
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setMathTopic('fractions')
    setProblem('')
    setCorrectAnswer('')
    setStudentAnswer('')
    setShowWork('')
    setErrorPatterns('')
    setIncludeReteaching(true)
    setIncludeParentExplanation(false)
    setShowDemo(false)
    setGeneratedAnalysis('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!problem.trim() || !correctAnswer.trim() || !studentAnswer.trim()) {
      alert('Please enter the problem, correct answer, and student answer')
      return
    }
    
    setGenerating(true)
    setGeneratedAnalysis('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-error-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, mathTopic, problem, correctAnswer, studentAnswer,
          showWork, errorPatterns, includeReteaching, includeParentExplanation,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedAnalysis(data.analysis); await handleSave(data.analysis) }
    } catch (error) { alert('Error analyzing. Please try again.') }
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
          title: `Error Analysis: ${mathTopic} (${gradeLevel})`,
          toolType: 'error-analysis',
          toolName: 'Error Analysis',
          content,
          metadata: { gradeLevel, mathTopic, problem },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedAnalysis) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Error Analysis - ${mathTopic}`, 
          content: generatedAnalysis, 
          toolName: 'Error Analysis' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Error_Analysis_${mathTopic}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedAnalysis); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🔍 Math Error Analysis</h1>
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
                <p className="text-purple-600 text-sm">We've filled in a common fraction addition error. Click Analyze to see the misconception diagnosis.</p>
              </div>
              <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                Scroll to output ↓
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>How this works:</strong> You tell the AI what the correct answer is and what the student answered. 
            The AI then analyzes <em>why</em> the student might have made this error and suggests re-teaching strategies. 
            <strong> The AI does NOT calculate or verify math</strong> - you're the expert on what's correct!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Error Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', 'Algebra 1', 'Geometry', 'Algebra 2'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Math Topic</label>
                <select value={mathTopic} onChange={(e) => setMathTopic(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  <option value="addition">Addition</option>
                  <option value="subtraction">Subtraction</option>
                  <option value="multiplication">Multiplication</option>
                  <option value="division">Division</option>
                  <option value="fractions">Fractions</option>
                  <option value="decimals">Decimals</option>
                  <option value="percents">Percents</option>
                  <option value="place-value">Place Value</option>
                  <option value="algebra">Algebraic Thinking</option>
                  <option value="geometry">Geometry</option>
                  <option value="measurement">Measurement</option>
                  <option value="word-problems">Word Problems</option>
                  <option value="order-operations">Order of Operations</option>
                  <option value="ratios">Ratios & Proportions</option>
                  <option value="integers">Integers</option>
                  <option value="equations">Equations</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="mb-3">
                <label className="block text-gray-700 mb-2 font-medium">
                  The Problem <span className="text-rose-500">*</span>
                </label>
                <input type="text" value={problem} onChange={(e) => setProblem(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                  placeholder="e.g., 3/4 + 1/2 = ?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 bg-green-50"
                    placeholder="e.g., 1 1/4 or 5/4" />
                  <p className="text-xs text-green-600 mt-1">You verify this is correct</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Student's Answer <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" value={studentAnswer} onChange={(e) => setStudentAnswer(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 bg-red-50"
                    placeholder="e.g., 4/6" />
                  <p className="text-xs text-red-600 mt-1">What the student wrote</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Student's Work/Process (optional)</label>
              <textarea value={showWork} onChange={(e) => setShowWork(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 h-20 text-sm"
                placeholder="Describe or paste what the student showed for their work..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Observation (optional)</label>
              <textarea value={errorPatterns} onChange={(e) => setErrorPatterns(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 h-16 text-sm"
                placeholder="Any patterns you've noticed with this student or this type of error..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeReteaching}
                    onChange={(e) => setIncludeReteaching(e.target.checked)} className="w-5 h-5 text-red-600 rounded" />
                  <span className="text-gray-700">📚 Re-Teaching Strategies (CRA approach)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeParentExplanation}
                    onChange={(e) => setIncludeParentExplanation(e.target.checked)} className="w-5 h-5 text-red-600 rounded" />
                  <span className="text-gray-700">👨‍👩‍👧 Parent-Friendly Explanation</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !problem.trim() || !correctAnswer.trim() || !studentAnswer.trim()}
              className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {generating ? '🔍 Analyzing Error...' : '🔍 Analyze This Error'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Analysis</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedAnalysis && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-red-600 hover:text-red-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedAnalysis ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[65vh]">
                {generatedAnalysis}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="mb-2">Error analysis will appear here</p>
                  <p className="text-xs">Misconception diagnosis + re-teaching strategies</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}