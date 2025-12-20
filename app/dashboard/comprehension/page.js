'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function ComprehensionPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('6th Grade')
  const [textType, setTextType] = useState('fiction')
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [questionTypes, setQuestionTypes] = useState('mixed')
  const [dokLevels, setDokLevels] = useState(['1', '2', '3'])
  const [numberOfQuestions, setNumberOfQuestions] = useState('10')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [includeTextEvidence, setIncludeTextEvidence] = useState(true)
  const [includeDiscussion, setIncludeDiscussion] = useState(false)
  const [standards, setStandards] = useState('')
  
  const [generatedQuestions, setGeneratedQuestions] = useState('')
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
    setGradeLevel('5th Grade')
    setTextType('fiction')
    setTextTitle('The Giving Tree (excerpt)')
    setTextContent(`Once there was a tree, and she loved a little boy. And every day the boy would come and he would gather her leaves and make them into crowns and play king of the forest. He would climb up her trunk and swing from her branches and eat apples. And they would play hide-and-go-seek. And when he was tired, he would sleep in her shade. And the boy loved the tree very much. And the tree was happy.

But time went by. And the boy grew older. And the tree was often alone. Then one day the boy came to the tree and the tree said, "Come, Boy, come and climb up my trunk and swing from my branches and eat apples and play in my shade and be happy."

"I am too big to climb and play," said the boy. "I want to buy things and have fun. I want some money. Can you give me some money?"

"I'm sorry," said the tree, "but I have no money. I have only leaves and apples. Take my apples, Boy, and sell them in the city. Then you will have money and you will be happy."`)
    setQuestionTypes('mixed')
    setDokLevels(['1', '2', '3'])
    setNumberOfQuestions('10')
    setIncludeAnswerKey(true)
    setIncludeTextEvidence(true)
    setIncludeDiscussion(true)
    setShowDemo(true)
    setGeneratedQuestions('')
  }

  const handleResetDemo = () => {
    setGradeLevel('6th Grade')
    setTextType('fiction')
    setTextTitle('')
    setTextContent('')
    setQuestionTypes('mixed')
    setDokLevels(['1', '2', '3'])
    setNumberOfQuestions('10')
    setIncludeAnswerKey(true)
    setIncludeTextEvidence(true)
    setIncludeDiscussion(false)
    setStandards('')
    setShowDemo(false)
    setGeneratedQuestions('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleDokLevel = (level) => {
    if (dokLevels.includes(level)) {
      setDokLevels(dokLevels.filter(l => l !== level))
    } else {
      setDokLevels([...dokLevels, level])
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedQuestions('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-comprehension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, textType, textTitle, textContent, questionTypes,
          dokLevels, numberOfQuestions, includeAnswerKey, includeTextEvidence,
          includeDiscussion, standards,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedQuestions(data.questions); await handleSave(data.questions) }
    } catch (error) { alert('Error generating questions. Please try again.') }
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
          title: `Comprehension: ${textTitle || textType} (${gradeLevel})`,
          toolType: 'comprehension',
          toolName: 'Comprehension Questions',
          content,
          metadata: { gradeLevel, textType, textTitle, numberOfQuestions },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedQuestions) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Comprehension Questions - ${textTitle || textType}`, 
          content: generatedQuestions, 
          toolName: 'Comprehension Questions' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Comprehension_${textTitle || textType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedQuestions); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📖 Comprehension Questions</h1>
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
                <p className="text-purple-600 text-sm">We've filled in example inputs with "The Giving Tree" excerpt. Click Generate to see sample questions.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Question Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                    '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Questions</label>
                <select value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <option value="5">5 questions</option>
                  <option value="10">10 questions</option>
                  <option value="15">15 questions</option>
                  <option value="20">20 questions</option>
                </select>
              </div>
            </div>

            {/* Text Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Text Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fiction', label: '📚 Fiction' },
                  { id: 'nonfiction', label: '📰 Nonfiction' },
                  { id: 'poetry', label: '📝 Poetry' },
                  { id: 'drama', label: '🎭 Drama' },
                  { id: 'primary-source', label: '📜 Primary Source' },
                  { id: 'article', label: '📄 Article' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setTextType(t.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${textType === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <span className="text-gray-800 text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Text Title</label>
              <input type="text" value={textTitle} onChange={(e) => setTextTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="e.g., 'The Giver', 'I Have a Dream', Chapter 5..." />
            </div>

            {/* Text Content */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Paste Text (optional but recommended)</label>
              <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 h-32 text-sm"
                placeholder="Paste the passage or excerpt here for text-specific questions..." />
              <p className="text-xs text-gray-500 mt-1">
                {textContent.split(/\s+/).filter(w => w).length} words
              </p>
            </div>

            <FileUpload
              onContentExtracted={setTextContent}
              label="Or Upload Text File"
              helpText="Upload the reading passage"
              placeholder="Paste text content here..."
            />

            {/* DOK Levels */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-gray-800 font-medium mb-2">DOK Levels (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '1', label: 'DOK 1', desc: 'Recall & Reproduce' },
                  { id: '2', label: 'DOK 2', desc: 'Skills & Concepts' },
                  { id: '3', label: 'DOK 3', desc: 'Strategic Thinking' },
                  { id: '4', label: 'DOK 4', desc: 'Extended Thinking' },
                ].map(d => (
                  <button key={d.id} type="button" onClick={() => toggleDokLevel(d.id)}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${dokLevels.includes(d.id) ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="font-medium text-gray-800 text-sm">{d.label}</div>
                    <div className="text-xs text-gray-500">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Question Focus</label>
              <select value={questionTypes} onChange={(e) => setQuestionTypes(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                <option value="mixed">🔄 Mixed (All Types)</option>
                <option value="literal">📍 Literal/Explicit</option>
                <option value="inferential">🔍 Inferential</option>
                <option value="evaluative">⚖️ Evaluative</option>
                <option value="analytical">🔬 Analytical (Author's Craft)</option>
                <option value="vocabulary">📖 Vocabulary in Context</option>
                <option value="character">👤 Character Analysis</option>
                <option value="purpose-theme">💡 Theme/Purpose</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">📋 Answer Key</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeTextEvidence}
                    onChange={(e) => setIncludeTextEvidence(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">📝 Text Evidence Requirements</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeDiscussion}
                    onChange={(e) => setIncludeDiscussion(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">💬 Discussion Questions</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {generating ? '📖 Generating Questions...' : '📖 Generate Questions'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Questions</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedQuestions && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-blue-600 hover:text-blue-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedQuestions ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedQuestions}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📖</p>
                  <p className="mb-2">Your questions will appear here</p>
                  <p className="text-xs">Text-dependent, DOK-aligned</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}