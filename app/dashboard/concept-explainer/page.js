'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ConceptExplainerPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [concept, setConcept] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [representations, setRepresentations] = useState(['concrete', 'visual', 'abstract'])
  const [audienceType, setAudienceType] = useState('student')
  const [includeCommonMistakes, setIncludeCommonMistakes] = useState(true)
  const [includeRealWorld, setIncludeRealWorld] = useState(true)
  const [includeVocabulary, setIncludeVocabulary] = useState(true)
  
  const [generatedExplanation, setGeneratedExplanation] = useState('')
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

  const toggleRepresentation = (rep) => {
    if (representations.includes(rep)) {
      setRepresentations(representations.filter(r => r !== rep))
    } else {
      setRepresentations([...representations, rep])
    }
  }

  const handleGenerate = async () => {
    if (!concept.trim()) {
      alert('Please enter a math concept')
      return
    }
    
    setGenerating(true)
    setGeneratedExplanation('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-concept-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, concept, priorKnowledge, representations,
          includeCommonMistakes, includeRealWorld, includeVocabulary, audienceType,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedExplanation(data.explanation); await handleSave(data.explanation) }
    } catch (error) { alert('Error generating. Please try again.') }
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
          title: `Concept: ${concept} (${gradeLevel})`,
          toolType: 'concept-explainer',
          toolName: 'Concept Explainer',
          content,
          metadata: { gradeLevel, concept, audienceType },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedExplanation) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Math Concept - ${concept}`, 
          content: generatedExplanation, 
          toolName: 'Concept Explainer' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Concept_${concept.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedExplanation); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📐 Concept Explainer</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Concept Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', 'Algebra 1', 'Geometry', 'Algebra 2', 'Pre-Calculus'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Audience</label>
                <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <option value="student">👨‍🎓 For Students</option>
                  <option value="teacher">👩‍🏫 For Teachers</option>
                  <option value="parent">👨‍👩‍👧 For Parents</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Math Concept <span className="text-rose-500">*</span>
              </label>
              <input type="text" value={concept} onChange={(e) => setConcept(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="e.g., Adding fractions with unlike denominators" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Prior Knowledge Needed (optional)</label>
              <input type="text" value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="e.g., Equivalent fractions, common denominators" />
            </div>

            {/* Representations */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-gray-800 font-medium mb-2">Representations (CRA)</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'concrete', label: '🧱 Concrete', desc: 'Hands-on manipulatives' },
                  { id: 'visual', label: '🎨 Visual', desc: 'Diagrams, models, number lines' },
                  { id: 'abstract', label: '🔢 Abstract', desc: 'Symbols and numbers' },
                  { id: 'verbal', label: '💬 Verbal', desc: 'Word explanations' },
                  { id: 'real-world', label: '🌍 Real-World', desc: 'Everyday applications' },
                ].map(r => (
                  <button key={r.id} type="button" onClick={() => toggleRepresentation(r.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${representations.includes(r.id) ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="font-medium text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Also Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeCommonMistakes}
                    onChange={(e) => setIncludeCommonMistakes(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">⚠️ Common Mistakes to Avoid</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeRealWorld}
                    onChange={(e) => setIncludeRealWorld(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">🌍 Real-World Connections</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVocabulary}
                    onChange={(e) => setIncludeVocabulary(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">📚 Math Vocabulary</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !concept.trim()}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {generating ? '📐 Generating Explanation...' : '📐 Explain This Concept'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Explanation</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedExplanation && (
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

            {generatedExplanation ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedExplanation}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📐</p>
                  <p className="mb-2">Concept explanation will appear here</p>
                  <p className="text-xs">Multiple representations: Concrete → Visual → Abstract</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}