'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function QuestionBankPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [unit, setUnit] = useState('')
  const [topics, setTopics] = useState('')
  const [questionsPerTopic, setQuestionsPerTopic] = useState('5')
  const [questionTypes, setQuestionTypes] = useState(['multiple-choice', 'short-answer', 'true-false'])
  const [difficulty, setDifficulty] = useState('mixed')
  const [includeAnswers, setIncludeAnswers] = useState(true)
  const [includeStandards, setIncludeStandards] = useState(false)
  const [standardsFramework, setStandardsFramework] = useState('common-core')
  
  const [generatedBank, setGeneratedBank] = useState('')
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

  const handleGenerate = async () => {
    if (!unit) {
      alert('Please enter a unit name')
      return
    }
    setGenerating(true)
    setGeneratedBank('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-question-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, unit, topics, questionsPerTopic,
          questionTypes, difficulty, includeAnswers, includeStandards, standardsFramework,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedBank(data.questionBank); await handleSave(data.questionBank) }
    } catch (error) { alert('Error generating question bank. Please try again.') }
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
          title: `Question Bank: ${unit}`,
          toolType: 'question-bank',
          toolName: 'Question Bank',
          content,
          metadata: { gradeLevel, subject, unit, questionsPerTopic, questionTypes },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedBank) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Question Bank - ${unit}`, content: generatedBank, toolName: 'Question Bank' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `QuestionBank_${unit.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedBank); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Question Bank Builder</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Question Bank Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Unit Name *</label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                placeholder="e.g., Fractions, Colonial America, Ecosystems" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topics/Concepts to Cover (optional)</label>
              <textarea value={topics} onChange={(e) => setTopics(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 h-20"
                placeholder="List specific topics, separated by commas. e.g., Adding fractions, Subtracting fractions, Mixed numbers, Word problems" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Questions per Topic</label>
                <select value={questionsPerTopic} onChange={(e) => setQuestionsPerTopic(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  <option value="3">3 questions</option>
                  <option value="5">5 questions</option>
                  <option value="8">8 questions</option>
                  <option value="10">10 questions</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  <option value="easy">Easy (mostly recall)</option>
                  <option value="medium">Medium (application)</option>
                  <option value="hard">Hard (analysis/synthesis)</option>
                  <option value="mixed">Mixed (variety)</option>
                </select>
              </div>
            </div>

            {/* Question Types */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Question Types</label>
              <div className="grid grid-cols-2 gap-2">
                {questionTypeOptions.map(qt => (
                  <label key={qt.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={questionTypes.includes(qt.id)}
                      onChange={() => handleQuestionTypeToggle(qt.id)} className="w-4 h-4 text-amber-600 rounded" />
                    <span className="text-sm text-gray-700">{qt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Standards */}
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input type="checkbox" checked={includeStandards}
                  onChange={(e) => setIncludeStandards(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                <span className="text-gray-800 font-medium">Include Standards Alignment</span>
              </label>
              {includeStandards && (
                <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 mt-2">
                  <option value="common-core">Common Core</option>
                  <option value="ngss">NGSS</option>
                  <option value="texas-teks">Texas TEKS</option>
                  <option value="state">State Standards</option>
                </select>
              )}
            </div>

            {/* Answer Key */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                <span className="text-gray-700">Include Answer Key</span>
              </label>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Question Bank'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">This may take a moment for larger banks</p>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Question Bank</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedBank && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-amber-600 hover:text-amber-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedBank ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedBank}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your question bank will appear here</p>
                  <p className="text-xs">Organized questions for building assessments</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}