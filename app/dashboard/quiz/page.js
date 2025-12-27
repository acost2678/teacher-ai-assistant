'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function QuizPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [assessmentType, setAssessmentType] = useState('quiz')
  const [questionCount, setQuestionCount] = useState('10')
  const [questionTypes, setQuestionTypes] = useState(['multiple-choice', 'short-answer'])
  const [difficulty, setDifficulty] = useState('on-level')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [includePointValues, setIncludePointValues] = useState(true)
  const [bloomsLevels, setBloomsLevels] = useState(['remember', 'understand', 'apply'])
  const [customInstructions, setCustomInstructions] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  
  // Regenerate with feedback
  const [previousQuiz, setPreviousQuiz] = useState('')
  const [feedbackToFix, setFeedbackToFix] = useState('')
  const [showRegenerateSection, setShowRegenerateSection] = useState(false)
  
  const [generatedQuiz, setGeneratedQuiz] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  const outputRef = useRef(null)
  const router = useRouter()

  const questionTypeOptions = [
    { id: 'multiple-choice', label: 'Multiple Choice' },
    { id: 'true-false', label: 'True/False' },
    { id: 'short-answer', label: 'Short Answer' },
    { id: 'fill-blank', label: 'Fill in the Blank' },
    { id: 'matching', label: 'Matching' },
    { id: 'extended-response', label: 'Extended Response' },
  ]

  const bloomsOptions = [
    { id: 'remember', label: 'Remember', color: 'bg-red-100 border-red-300' },
    { id: 'understand', label: 'Understand', color: 'bg-orange-100 border-orange-300' },
    { id: 'apply', label: 'Apply', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'analyze', label: 'Analyze', color: 'bg-green-100 border-green-300' },
    { id: 'evaluate', label: 'Evaluate', color: 'bg-blue-100 border-blue-300' },
    { id: 'create', label: 'Create', color: 'bg-purple-100 border-purple-300' },
  ]

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleQuestionTypeToggle = (typeId) => {
    if (questionTypes.includes(typeId)) {
      setQuestionTypes(questionTypes.filter(t => t !== typeId))
    } else {
      setQuestionTypes([...questionTypes, typeId])
    }
  }

  const handleBloomsToggle = (levelId) => {
    if (bloomsLevels.includes(levelId)) {
      setBloomsLevels(bloomsLevels.filter(l => l !== levelId))
    } else {
      setBloomsLevels([...bloomsLevels, levelId])
    }
  }

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('Science')
    setTopic('The Water Cycle')
    setAssessmentType('quiz')
    setQuestionCount('10')
    setQuestionTypes(['multiple-choice', 'short-answer', 'true-false'])
    setDifficulty('on-level')
    setIncludeAnswerKey(true)
    setIncludePointValues(true)
    setBloomsLevels(['remember', 'understand', 'apply'])
    setTimeLimit('20 minutes')
    setCustomInstructions('')
    setShowDemo(true)
    setGeneratedQuiz('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setTopic('')
    setAssessmentType('quiz')
    setQuestionCount('10')
    setQuestionTypes(['multiple-choice', 'short-answer'])
    setDifficulty('on-level')
    setIncludeAnswerKey(true)
    setIncludePointValues(true)
    setBloomsLevels(['remember', 'understand', 'apply'])
    setTimeLimit('')
    setCustomInstructions('')
    setShowDemo(false)
    setGeneratedQuiz('')
    setShowRegenerateSection(false)
    setFeedbackToFix('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!topic) {
      alert('Please enter a topic')
      return
    }
    if (questionTypes.length === 0) {
      alert('Please select at least one question type')
      return
    }
    setGenerating(true)
    setGeneratedQuiz('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, assessmentType, questionCount,
          questionTypes, difficulty, includeAnswerKey, includePointValues,
          bloomsLevels, customInstructions, timeLimit,
          previousQuiz: showRegenerateSection ? previousQuiz : null,
          feedbackToFix: showRegenerateSection ? feedbackToFix : null,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { 
        setGeneratedQuiz(data.quiz)
        setPreviousQuiz(data.quiz)
        await handleSave(data.quiz)
        scrollToOutput()
      }
    } catch (error) { alert('Error generating quiz. Please try again.') }
    setGenerating(false)
  }

  const handleRegenerate = () => {
    setShowRegenerateSection(true)
    setPreviousQuiz(generatedQuiz)
    setFeedbackToFix('')
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}: ${topic}`,
          toolType: 'quiz',
          toolName: 'Quiz/Test',
          content,
          metadata: { gradeLevel, subject, topic, assessmentType, questionCount, questionTypes },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedQuiz) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${assessmentType} - ${topic}`, content: generatedQuiz, toolName: 'Quiz/Test' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${assessmentType}_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedQuiz); setCopied(true); setTimeout(() => setCopied(false), 2000) }

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
            <span className="text-gray-800 font-medium">Quiz/Test Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📝</span>
                <h1 className="text-2xl font-semibold text-gray-800">Quiz & Test Generator</h1>
              </div>
              <p className="text-gray-500">Create standards-aligned assessments with answer keys.</p>
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
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo loaded!</h3>
                  <p className="text-purple-600 text-sm">Example: 5th Grade Science - Water Cycle Quiz</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Assessment Details</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level *</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                      '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                      <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                      'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                      <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  placeholder="e.g., Fractions, American Revolution, Photosynthesis" />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"># Questions</label>
                  <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="below-level">Below Level</option>
                    <option value="on-level">On Level</option>
                    <option value="above-level">Above Level</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (optional)</label>
                <input type="text" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  placeholder="e.g., 30 minutes, 1 hour" />
              </div>

              {/* Question Types */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Types *</label>
                <div className="grid grid-cols-2 gap-2">
                  {questionTypeOptions.map(qt => (
                    <label key={qt.id} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors border ${questionTypes.includes(qt.id) ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                      <input type="checkbox" checked={questionTypes.includes(qt.id)}
                        onChange={() => handleQuestionTypeToggle(qt.id)} className="w-4 h-4 text-purple-600 rounded" />
                      <span className="text-sm text-gray-700">{qt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bloom's Taxonomy */}
              <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block text-gray-800 font-medium mb-2">🧠 Bloom's Taxonomy Levels</label>
                <p className="text-xs text-gray-600 mb-3">Select cognitive levels to target</p>
                <div className="flex flex-wrap gap-2">
                  {bloomsOptions.map(bl => (
                    <button key={bl.id} type="button"
                      onClick={() => handleBloomsToggle(bl.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${bloomsLevels.includes(bl.id) ? bl.color + ' border-2 font-medium' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {bl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="mb-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">Include Answer Key</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includePointValues}
                    onChange={(e) => setIncludePointValues(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">Include Point Values</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (optional)</label>
                <textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  rows={2}
                  placeholder="Any specific requirements for the assessment..." />
              </div>

              {/* Regenerate Section */}
              {showRegenerateSection && (
                <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="text-amber-800 font-medium mb-2">🔄 What would you like to change?</h3>
                  <p className="text-sm text-amber-700 mb-3">Tell me what to fix or improve:</p>
                  <textarea value={feedbackToFix} onChange={(e) => setFeedbackToFix(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 resize-none"
                    rows={3}
                    placeholder="e.g., Make question 3 easier, add more multiple choice, remove the matching section, make it more challenging..." />
                  <button onClick={() => { setShowRegenerateSection(false); setFeedbackToFix('') }} 
                    className="text-amber-600 hover:text-amber-700 text-sm mt-2">
                    Cancel
                  </button>
                </div>
              )}

              <button onClick={handleGenerate} disabled={generating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                {generating ? (
                  <><span className="animate-spin">⏳</span>Generating...</>
                ) : showRegenerateSection ? (
                  <><span>🔄</span>Regenerate with Changes</>
                ) : (
                  <><span>✨</span>Generate {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}</>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Generated Assessment</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
              </div>
              {generatedQuiz && (
                <div className="flex items-center gap-3">
                  <button onClick={handleRegenerate} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    🔄 Change
                  </button>
                  <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                    {exporting ? 'Exporting...' : '📄 Export'}
                  </button>
                </div>
              )}
            </div>

            {generatedQuiz ? (
              <div className="bg-gray-50 rounded-xl p-5 max-h-[70vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedQuiz}</pre>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to create!</h3>
                  <p className="text-gray-400">Your assessment will appear here</p>
                  <p className="text-gray-300 text-sm mt-1">with answer key and point values</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}