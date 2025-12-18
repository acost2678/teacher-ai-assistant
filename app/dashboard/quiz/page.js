'use client'

import { useState, useEffect } from 'react'
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
  
  const [generatedQuiz, setGeneratedQuiz] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
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
    { id: 'remember', label: 'Remember', color: 'bg-red-100' },
    { id: 'understand', label: 'Understand', color: 'bg-orange-100' },
    { id: 'apply', label: 'Apply', color: 'bg-yellow-100' },
    { id: 'analyze', label: 'Analyze', color: 'bg-green-100' },
    { id: 'evaluate', label: 'Evaluate', color: 'bg-blue-100' },
    { id: 'create', label: 'Create', color: 'bg-purple-100' },
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
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedQuiz(data.quiz); await handleSave(data.quiz) }
    } catch (error) { alert('Error generating quiz. Please try again.') }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Quiz & Test Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Assessment Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800"
                placeholder="e.g., Fractions, American Revolution, Photosynthesis" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Type</label>
                <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  <option value="quiz">Quiz</option>
                  <option value="test">Test</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># Questions</label>
                <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800">
                  <option value="below-level">Below Level</option>
                  <option value="on-level">On Level</option>
                  <option value="above-level">Above Level</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Time Limit (optional)</label>
              <input type="text" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800"
                placeholder="e.g., 30 minutes, 1 hour" />
            </div>

            {/* Question Types */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Question Types *</label>
              <div className="grid grid-cols-2 gap-2">
                {questionTypeOptions.map(qt => (
                  <label key={qt.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={questionTypes.includes(qt.id)}
                      onChange={() => handleQuestionTypeToggle(qt.id)} className="w-4 h-4 text-cyan-600 rounded" />
                    <span className="text-sm text-gray-700">{qt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bloom's Taxonomy */}
            <div className="mb-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <label className="block text-gray-800 font-medium mb-2">🧠 Bloom's Taxonomy Levels</label>
              <p className="text-xs text-gray-600 mb-2">Select cognitive levels to target</p>
              <div className="flex flex-wrap gap-2">
                {bloomsOptions.map(bl => (
                  <button key={bl.id} type="button"
                    onClick={() => handleBloomsToggle(bl.id)}
                    className={`px-3 py-1 rounded-full text-sm ${bloomsLevels.includes(bl.id) ? bl.color + ' border-2 border-gray-400 font-medium' : 'bg-gray-100 text-gray-500'}`}>
                    {bl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                <span className="text-gray-700">Include Answer Key</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includePointValues}
                  onChange={(e) => setIncludePointValues(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
                <span className="text-gray-700">Include Point Values</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Special Instructions (optional)</label>
              <textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 h-16"
                placeholder="Any specific requirements for the assessment..." />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50">
              {generating ? 'Generating...' : `Generate ${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}`}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Assessment</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedQuiz && (
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

            {generatedQuiz ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedQuiz}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your assessment will appear here</p>
                  <p className="text-xs">Quizzes, tests, and exams with answer keys</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}