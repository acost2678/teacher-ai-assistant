'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function ScaffoldPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [contentType, setContentType] = useState('reading')
  const [originalContent, setOriginalContent] = useState('')
  const [scaffoldTypes, setScaffoldTypes] = useState(['sentence-starters', 'word-bank', 'graphic-organizer'])
  const [studentNeeds, setStudentNeeds] = useState(['general'])
  const [outputFormat, setOutputFormat] = useState('full')
  
  const [generatedScaffold, setGeneratedScaffold] = useState('')
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

  const toggleScaffold = (scaffold) => {
    if (scaffoldTypes.includes(scaffold)) {
      setScaffoldTypes(scaffoldTypes.filter(s => s !== scaffold))
    } else {
      setScaffoldTypes([...scaffoldTypes, scaffold])
    }
  }

  const toggleNeed = (need) => {
    if (studentNeeds.includes(need)) {
      setStudentNeeds(studentNeeds.filter(n => n !== need))
    } else {
      setStudentNeeds([...studentNeeds, need])
    }
  }

  const handleGenerate = async () => {
    if (!originalContent.trim()) {
      alert('Please enter or paste the content to scaffold')
      return
    }
    
    setGenerating(true)
    setGeneratedScaffold('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, contentType, originalContent, scaffoldTypes,
          studentNeeds, outputFormat,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedScaffold(data.scaffoldedContent); await handleSave(data.scaffoldedContent) }
    } catch (error) { alert('Error generating scaffolds. Please try again.') }
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
          title: `Scaffolded: ${contentType} (${gradeLevel})`,
          toolType: 'scaffold',
          toolName: 'Scaffold Generator',
          content,
          metadata: { gradeLevel, contentType, scaffoldTypes },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedScaffold) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Scaffolded Content - ${contentType}`, 
          content: generatedScaffold, 
          toolName: 'Scaffold Generator' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Scaffolded_${contentType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedScaffold); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🛠️ Scaffold Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Scaffold Settings</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  {['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Content Type</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  <option value="reading">Reading Passage</option>
                  <option value="writing">Writing Prompt/Task</option>
                  <option value="math">Math Problem/Task</option>
                  <option value="directions">Directions/Instructions</option>
                  <option value="assessment">Assessment/Quiz</option>
                  <option value="worksheet">Worksheet</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Original Content */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Original Content <span className="text-rose-500">*</span>
              </label>
              <textarea 
                value={originalContent} 
                onChange={(e) => setOriginalContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 h-32 text-sm"
                placeholder="Paste the content you want to add scaffolds to..."
              />
            </div>

            <FileUpload
              onContentExtracted={setOriginalContent}
              label="Or Upload Content"
              helpText="Upload a document to scaffold"
              placeholder="Paste content here..."
            />

            {/* Scaffold Types */}
            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label className="block text-gray-800 font-medium mb-2">Scaffolds to Add</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sentence-starters', label: '💬 Sentence Starters' },
                  { id: 'word-bank', label: '📚 Word Bank' },
                  { id: 'graphic-organizer', label: '📊 Graphic Organizer' },
                  { id: 'chunked-text', label: '📦 Chunked Text' },
                  { id: 'examples', label: '✅ Worked Examples' },
                  { id: 'checklists', label: '☑️ Checklists' },
                  { id: 'hints', label: '💡 Hints/Prompts' },
                  { id: 'vocabulary-support', label: '📖 Vocabulary Support' },
                  { id: 'visuals', label: '🖼️ Visual Supports' },
                  { id: 'templates', label: '📝 Templates' },
                ].map(s => (
                  <button key={s.id} type="button" onClick={() => toggleScaffold(s.id)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${scaffoldTypes.includes(s.id) ? 'border-orange-500 bg-orange-100' : 'border-gray-200 hover:border-orange-300'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Needs */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-gray-800 font-medium mb-2">Designed For</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'general', label: '👥 General Support' },
                  { id: 'ell', label: '🌍 ELL Students' },
                  { id: 'reading-below', label: '📖 Below Level Readers' },
                  { id: 'attention', label: '🎯 Attention Needs' },
                  { id: 'processing', label: '🧠 Processing Needs' },
                  { id: 'anxiety', label: '💚 Test Anxiety' },
                ].map(n => (
                  <button key={n.id} type="button" onClick={() => toggleNeed(n.id)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${studentNeeds.includes(n.id) ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-blue-300'}`}>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !originalContent.trim()}
              className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {generating ? '🛠️ Adding Scaffolds...' : '🛠️ Generate Scaffolds'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Scaffolded Content</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedScaffold && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-orange-600 hover:text-orange-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedScaffold ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedScaffold}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🛠️</p>
                  <p className="mb-2">Your scaffolded content will appear here</p>
                  <p className="text-xs">With sentence starters, organizers, word banks & more</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}