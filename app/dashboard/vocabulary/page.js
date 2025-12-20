'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function VocabularyPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('6th Grade')
  const [tierLevel, setTierLevel] = useState('tier2')
  const [words, setWords] = useState('')
  const [textContext, setTextContext] = useState('')
  const [activityTypes, setActivityTypes] = useState('mixed')
  const [numberOfWords, setNumberOfWords] = useState('10')
  const [includeDefinitions, setIncludeDefinitions] = useState(true)
  const [includeContext, setIncludeContext] = useState(true)
  const [includeActivities, setIncludeActivities] = useState(true)
  const [includeAssessment, setIncludeAssessment] = useState(true)
  
  const [generatedVocabulary, setGeneratedVocabulary] = useState('')
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
    setTierLevel('tier2')
    setWords('analyze\ncompare\ncontrast\nevidence\ninfer\nsummarize\nsynthesize\nevaluate')
    setTextContext('')
    setActivityTypes('mixed')
    setNumberOfWords('10')
    setIncludeDefinitions(true)
    setIncludeContext(true)
    setIncludeActivities(true)
    setIncludeAssessment(true)
    setShowDemo(true)
    setGeneratedVocabulary('')
  }

  const handleResetDemo = () => {
    setGradeLevel('6th Grade')
    setTierLevel('tier2')
    setWords('')
    setTextContext('')
    setActivityTypes('mixed')
    setNumberOfWords('10')
    setIncludeDefinitions(true)
    setIncludeContext(true)
    setIncludeActivities(true)
    setIncludeAssessment(true)
    setShowDemo(false)
    setGeneratedVocabulary('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedVocabulary('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, tierLevel, words, textContext, activityTypes,
          numberOfWords, includeDefinitions, includeContext,
          includeActivities, includeAssessment,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedVocabulary(data.vocabulary); await handleSave(data.vocabulary) }
    } catch (error) { alert('Error generating vocabulary. Please try again.') }
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
          title: `Vocabulary: ${tierLevel} (${gradeLevel})`,
          toolType: 'vocabulary',
          toolName: 'Vocabulary Builder',
          content,
          metadata: { gradeLevel, tierLevel, activityTypes, numberOfWords },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedVocabulary) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Vocabulary Builder - ${gradeLevel}`, 
          content: generatedVocabulary, 
          toolName: 'Vocabulary Builder' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Vocabulary_${gradeLevel}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedVocabulary); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📚 Vocabulary Builder</h1>
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
                <p className="text-purple-600 text-sm">We've filled in example Tier 2 academic vocabulary words. Click Generate to see sample materials.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Vocabulary Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                  {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                    '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Words</label>
                <select value={numberOfWords} onChange={(e) => setNumberOfWords(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                  <option value="5">5 words</option>
                  <option value="10">10 words</option>
                  <option value="15">15 words</option>
                  <option value="20">20 words</option>
                </select>
              </div>
            </div>

            {/* Word Tier */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <label className="block text-gray-800 font-medium mb-2">Word Tier</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'tier1', label: 'Tier 1', desc: 'Basic everyday words (sight words, common nouns)' },
                  { id: 'tier2', label: 'Tier 2', desc: 'High-utility academic words (analyze, compare, evidence)' },
                  { id: 'tier3', label: 'Tier 3', desc: 'Domain-specific words (photosynthesis, metaphor)' },
                  { id: 'mixed', label: 'Mixed', desc: 'Combination based on needs' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setTierLevel(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${tierLevel === t.id ? 'border-emerald-500 bg-emerald-100' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Words Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Vocabulary Words (optional)</label>
              <textarea value={words} onChange={(e) => setWords(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 h-24 text-sm"
                placeholder="Enter specific words (one per line or comma-separated):&#10;analyze&#10;evidence&#10;contrast&#10;synthesize" />
              <p className="text-xs text-gray-500 mt-1">Leave blank to generate grade-appropriate words</p>
            </div>

            {/* Text Context */}
            <FileUpload
              onContentExtracted={setTextContext}
              label="Source Text (optional)"
              helpText="Paste or upload the text these words come from"
              placeholder="Paste the reading passage for context..."
            />

            {/* Activity Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Activity Focus</label>
              <select value={activityTypes} onChange={(e) => setActivityTypes(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                <option value="mixed">🔄 Mixed Activities</option>
                <option value="context-clues">🔍 Context Clues</option>
                <option value="word-parts">🧩 Word Parts (Roots, Prefixes)</option>
                <option value="semantic-mapping">🗺️ Semantic Mapping</option>
                <option value="frayer-model">📊 Frayer Model</option>
                <option value="sentences">✏️ Sentence Writing</option>
                <option value="games">🎮 Games & Interactive</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeDefinitions}
                    onChange={(e) => setIncludeDefinitions(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-gray-700 text-sm">📖 Word Cards</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeContext}
                    onChange={(e) => setIncludeContext(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-gray-700 text-sm">📝 Context Sentences</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeActivities}
                    onChange={(e) => setIncludeActivities(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-gray-700 text-sm">🎯 Practice Activities</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeAssessment}
                    onChange={(e) => setIncludeAssessment(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-gray-700 text-sm">📊 Assessment</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {generating ? '📚 Building Vocabulary...' : '📚 Generate Vocabulary Materials'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Materials</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedVocabulary && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-emerald-600 hover:text-emerald-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedVocabulary ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedVocabulary}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📚</p>
                  <p className="mb-2">Your vocabulary materials will appear here</p>
                  <p className="text-xs">Cards, activities, games & assessments</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}