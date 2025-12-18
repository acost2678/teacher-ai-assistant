'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function TextLevelPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [originalText, setOriginalText] = useState('')
  const [originalLevel, setOriginalLevel] = useState('')
  const [targetLevel, setTargetLevel] = useState('3')
  const [targetLexile, setTargetLexile] = useState('')
  const [preserveElements, setPreserveElements] = useState(['key-facts', 'names-dates'])
  const [adjustments, setAdjustments] = useState(['sentence-length', 'vocabulary', 'syntax'])
  const [includeVocabularySupport, setIncludeVocabularySupport] = useState(true)
  const [includeComprehensionSupport, setIncludeComprehensionSupport] = useState(false)
  const [numberOfVersions, setNumberOfVersions] = useState('1')
  
  const [generatedText, setGeneratedText] = useState('')
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

  const togglePreserve = (element) => {
    if (preserveElements.includes(element)) {
      setPreserveElements(preserveElements.filter(e => e !== element))
    } else {
      setPreserveElements([...preserveElements, element])
    }
  }

  const toggleAdjustment = (adj) => {
    if (adjustments.includes(adj)) {
      setAdjustments(adjustments.filter(a => a !== adj))
    } else {
      setAdjustments([...adjustments, adj])
    }
  }

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      alert('Please enter or paste the original text')
      return
    }
    
    setGenerating(true)
    setGeneratedText('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-text-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText, originalLevel, targetLevel, targetLexile,
          preserveElements, adjustments, includeVocabularySupport,
          includeComprehensionSupport, numberOfVersions,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedText(data.leveledText); await handleSave(data.leveledText) }
    } catch (error) { alert('Error leveling text. Please try again.') }
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
          title: `Text Leveled: ${originalLevel || '?'} → ${targetLevel}`,
          toolType: 'text-level',
          toolName: 'Text Leveler',
          content,
          metadata: { originalLevel, targetLevel, targetLexile },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedText) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Text Leveled to Grade ${targetLevel}`, 
          content: generatedText, 
          toolName: 'Text Leveler' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Leveled_Text_Grade_${targetLevel}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedText); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📊 Text Leveler</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Level Adjustment</h2>

            {/* Original Text */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Original Text <span className="text-rose-500">*</span>
              </label>
              <textarea 
                value={originalText} 
                onChange={(e) => setOriginalText(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 h-40 text-sm"
                placeholder="Paste the text you want to level..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {originalText.split(/\s+/).filter(w => w).length} words
              </p>
            </div>

            <FileUpload
              onContentExtracted={setOriginalText}
              label="Or Upload Text"
              helpText="Upload a document to level"
              placeholder="Paste text content here..."
            />

            {/* Level Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Original Level (if known)</label>
                <select value={originalLevel} onChange={(e) => setOriginalLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  <option value="">Unknown</option>
                  <option value="K">Kindergarten</option>
                  <option value="1">1st Grade</option>
                  <option value="2">2nd Grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                  <option value="9-10">9th-10th Grade</option>
                  <option value="11-12">11th-12th Grade</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Target Level</label>
                <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  <option value="K">Kindergarten (BR-200L)</option>
                  <option value="1">1st Grade (200-400L)</option>
                  <option value="2">2nd Grade (400-500L)</option>
                  <option value="3">3rd Grade (500-600L)</option>
                  <option value="4">4th Grade (600-700L)</option>
                  <option value="5">5th Grade (700-800L)</option>
                  <option value="6">6th Grade (800-900L)</option>
                  <option value="7">7th Grade (900-1000L)</option>
                  <option value="8">8th Grade (1000-1050L)</option>
                  <option value="9-10">9th-10th (1050-1150L)</option>
                  <option value="11-12">11th-12th (1150-1300L)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Specific Lexile Target (optional)</label>
              <input type="text" value={targetLexile} onChange={(e) => setTargetLexile(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                placeholder="e.g., 650L or 600-700L" />
            </div>

            {/* Preserve Elements */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="block text-gray-800 font-medium mb-2">Must Preserve</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'key-facts', label: '📌 Key Facts' },
                  { id: 'names-dates', label: '📅 Names & Dates' },
                  { id: 'sequence', label: '🔢 Sequence' },
                  { id: 'tone', label: '🎭 Tone' },
                  { id: 'structure', label: '📐 Structure' },
                  { id: 'quotes', label: '💬 Quotes' },
                ].map(p => (
                  <button key={p.id} type="button" onClick={() => togglePreserve(p.id)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${preserveElements.includes(p.id) ? 'border-green-500 bg-green-100' : 'border-gray-200 hover:border-green-300'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <label className="block text-gray-800 font-medium mb-2">Adjustments to Make</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sentence-length', label: '📏 Sentence Length' },
                  { id: 'vocabulary', label: '📚 Vocabulary' },
                  { id: 'syntax', label: '🔀 Syntax' },
                  { id: 'concept-density', label: '💭 Concept Density' },
                  { id: 'add-context', label: '➕ Add Context' },
                  { id: 'add-transitions', label: '🔗 Add Transitions' },
                  { id: 'chunk-text', label: '📦 Chunk Text' },
                  { id: 'add-headers', label: '📑 Add Headers' },
                ].map(a => (
                  <button key={a.id} type="button" onClick={() => toggleAdjustment(a.id)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${adjustments.includes(a.id) ? 'border-indigo-500 bg-indigo-100' : 'border-gray-200 hover:border-indigo-300'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVocabularySupport}
                    onChange={(e) => setIncludeVocabularySupport(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="text-gray-700">📚 Vocabulary Support (word bank, pre-teaching)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeComprehensionSupport}
                    onChange={(e) => setIncludeComprehensionSupport(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="text-gray-700">🎯 Comprehension Support (questions, organizers)</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2"># of Versions</label>
              <select value={numberOfVersions} onChange={(e) => setNumberOfVersions(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                <option value="1">1 version</option>
                <option value="2">2 versions (alternate vocabulary)</option>
              </select>
            </div>

            <button onClick={handleGenerate} disabled={generating || !originalText.trim()}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {generating ? '📊 Leveling Text...' : '📊 Level This Text'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Leveled Text</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedText && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedText ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedText}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📊</p>
                  <p className="mb-2">Your leveled text will appear here</p>
                  <p className="text-xs">Precise leveling with vocabulary support</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}