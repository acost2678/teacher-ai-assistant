'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExitTicketPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [lessonObjective, setLessonObjective] = useState('')
  const [exitTicketType, setExitTicketType] = useState('understanding-check')
  const [quantity, setQuantity] = useState('3')
  const [questionTypes, setQuestionTypes] = useState(['short-answer'])
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [includeRubric, setIncludeRubric] = useState(false)
  const [includeSEL, setIncludeSEL] = useState(false)
  
  const [generatedTickets, setGeneratedTickets] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const questionTypeOptions = [
    { id: 'multiple-choice', label: 'Multiple Choice' },
    { id: 'short-answer', label: 'Short Answer' },
    { id: 'extended-response', label: 'Extended Response' },
    { id: 'true-false', label: 'True/False' },
    { id: 'fill-blank', label: 'Fill in the Blank' },
    { id: 'matching', label: 'Matching' },
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
    if (!topic) {
      alert('Please enter a topic')
      return
    }
    setGenerating(true)
    setGeneratedTickets('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-exit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, lessonObjective, exitTicketType,
          quantity, questionTypes, includeAnswerKey, includeRubric, includeSEL,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedTickets(data.exitTickets); await handleSave(data.exitTickets) }
    } catch (error) { alert('Error generating exit tickets. Please try again.') }
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
          title: `Exit Tickets: ${topic} (${quantity})`,
          toolType: 'exit-ticket',
          toolName: 'Exit Ticket',
          content,
          metadata: { gradeLevel, subject, topic, exitTicketType, quantity, includeSEL },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedTickets) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Exit Tickets - ${topic}`, content: generatedTickets, toolName: 'Exit Ticket' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `ExitTickets_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedTickets); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Exit Ticket Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Exit Ticket Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                placeholder="e.g., Adding fractions, Figurative language, Plant cells" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Today's Learning Objective (optional)</label>
              <textarea value={lessonObjective} onChange={(e) => setLessonObjective(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-16"
                placeholder="e.g., Students will be able to identify and explain 3 types of figurative language" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Exit Ticket Type</label>
                <select value={exitTicketType} onChange={(e) => setExitTicketType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <option value="understanding-check">Understanding Check</option>
                  <option value="application">Apply to New Situation</option>
                  <option value="reflection">Reflection</option>
                  <option value="summary">Summarize Learning</option>
                  <option value="question-generation">Student Questions</option>
                  <option value="self-assessment">Self-Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">How Many?</label>
                <select value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <option value="1">1 exit ticket</option>
                  <option value="3">3 variations</option>
                  <option value="5">5 variations</option>
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
                      onChange={() => handleQuestionTypeToggle(qt.id)} className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-sm text-gray-700">{qt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                <span className="text-gray-700">Include answer key</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeRubric}
                  onChange={(e) => setIncludeRubric(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                <span className="text-gray-700">Include scoring rubric</span>
              </label>
            </div>

            {/* SEL Option */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={includeSEL}
                  onChange={(e) => setIncludeSEL(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                <div>
                  <span className="text-gray-800 font-medium">Include SEL Reflection</span>
                  <p className="text-sm text-gray-600">Add a quick social-emotional check-in question</p>
                </div>
              </label>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? 'Generating...' : `Generate ${quantity} Exit Ticket${quantity > 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Exit Tickets</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedTickets && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-purple-600 hover:text-purple-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedTickets ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedTickets}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your exit tickets will appear here</p>
                  <p className="text-xs">Quick formative assessments for your lessons</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}