'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function GuidedReadingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('2nd Grade')
  const [readingLevel, setReadingLevel] = useState('J')
  const [bookTitle, setBookTitle] = useState('')
  const [textDescription, setTextDescription] = useState('')
  const [focusSkill, setFocusSkill] = useState('comprehension')
  const [groupSize, setGroupSize] = useState('4-6 students')
  const [sessionLength, setSessionLength] = useState('15-20 minutes')
  const [numberOfSessions, setNumberOfSessions] = useState('1')
  const [includeWordWork, setIncludeWordWork] = useState(true)
  const [includeWriting, setIncludeWriting] = useState(false)
  const [includeAssessment, setIncludeAssessment] = useState(true)
  
  const [generatedLesson, setGeneratedLesson] = useState('')
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
    setGradeLevel('2nd Grade')
    setReadingLevel('J')
    setBookTitle('Frog and Toad Are Friends')
    setTextDescription('A classic early chapter book about the friendship between Frog and Toad through a series of short stories.')
    setFocusSkill('retelling')
    setGroupSize('4-6 students')
    setSessionLength('20-25 minutes')
    setNumberOfSessions('2')
    setIncludeWordWork(true)
    setIncludeWriting(true)
    setIncludeAssessment(true)
    setShowDemo(true)
    setGeneratedLesson('')
  }

  const handleResetDemo = () => {
    setGradeLevel('2nd Grade')
    setReadingLevel('J')
    setBookTitle('')
    setTextDescription('')
    setFocusSkill('comprehension')
    setGroupSize('4-6 students')
    setSessionLength('15-20 minutes')
    setNumberOfSessions('1')
    setIncludeWordWork(true)
    setIncludeWriting(false)
    setIncludeAssessment(true)
    setShowDemo(false)
    setGeneratedLesson('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedLesson('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-guided-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, readingLevel, bookTitle, textDescription, focusSkill,
          groupSize, sessionLength, numberOfSessions, includeWordWork,
          includeWriting, includeAssessment,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedLesson(data.lesson); await handleSave(data.lesson) }
    } catch (error) { alert('Error generating lesson. Please try again.') }
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
          title: `Guided Reading: ${bookTitle || 'Level ' + readingLevel}`,
          toolType: 'guided-reading',
          toolName: 'Guided Reading',
          content,
          metadata: { gradeLevel, readingLevel, bookTitle, focusSkill },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedLesson) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Guided Reading - ${bookTitle || 'Level ' + readingLevel}`, 
          content: generatedLesson, 
          toolName: 'Guided Reading' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Guided_Reading_${readingLevel}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedLesson); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📖 Guided Reading</h1>
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
                <p className="text-purple-600 text-sm">We've filled in example inputs for "Frog and Toad Are Friends". Click Generate to see a sample lesson.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Lesson Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  {['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Reading Level (F&P)</label>
                <select value={readingLevel} onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(l => 
                    <option key={l} value={l}>Level {l}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Book Title</label>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                placeholder="e.g., Frog and Toad Are Friends" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Text Description (optional)</label>
              <textarea value={textDescription} onChange={(e) => setTextDescription(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 h-16 text-sm"
                placeholder="Brief description of the book/text..." />
            </div>

            {/* Focus Skill */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Focus Skill</label>
              <select value={focusSkill} onChange={(e) => setFocusSkill(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                <option value="comprehension">📖 Comprehension</option>
                <option value="decoding">🔤 Decoding</option>
                <option value="fluency">🎯 Fluency</option>
                <option value="vocabulary">📚 Vocabulary</option>
                <option value="retelling">📝 Retelling/Summarizing</option>
                <option value="inferring">🔍 Inferring</option>
                <option value="predicting">🔮 Predicting</option>
                <option value="questioning">❓ Questioning</option>
                <option value="visualizing">🎨 Visualizing</option>
                <option value="connections">🔗 Making Connections</option>
                <option value="main-idea">💡 Main Idea</option>
                <option value="mixed">🔄 Mixed Skills</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Session Length</label>
                <select value={sessionLength} onChange={(e) => setSessionLength(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  <option value="10-15 minutes">10-15 minutes</option>
                  <option value="15-20 minutes">15-20 minutes</option>
                  <option value="20-25 minutes">20-25 minutes</option>
                  <option value="25-30 minutes">25-30 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Sessions</label>
                <select value={numberOfSessions} onChange={(e) => setNumberOfSessions(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800">
                  <option value="1">1 session</option>
                  <option value="2">2 sessions</option>
                  <option value="3">3 sessions</option>
                  <option value="4">4 sessions</option>
                  <option value="5">5 sessions</option>
                </select>
              </div>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeWordWork}
                    onChange={(e) => setIncludeWordWork(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                  <span className="text-gray-700">🔤 Word Work</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeWriting}
                    onChange={(e) => setIncludeWriting(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                  <span className="text-gray-700">✏️ Writing Connection</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeAssessment}
                    onChange={(e) => setIncludeAssessment(e.target.checked)} className="w-5 h-5 text-amber-600 rounded" />
                  <span className="text-gray-700">📊 Assessment & Next Steps</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700 disabled:opacity-50">
              {generating ? '📖 Creating Lesson...' : '📖 Generate Guided Reading Lesson'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Lesson</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedLesson && (
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

            {generatedLesson ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedLesson}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📖</p>
                  <p className="mb-2">Your guided reading lesson will appear here</p>
                  <p className="text-xs">Before, during, after reading format</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}