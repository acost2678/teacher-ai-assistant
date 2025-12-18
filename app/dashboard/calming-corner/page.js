'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function CalmingCornerPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [strategyType, setStrategyType] = useState('mixed')
  const [duration, setDuration] = useState('2-5 minutes')
  const [setting, setSetting] = useState('classroom')
  const [numberOfStrategies, setNumberOfStrategies] = useState('5')
  const [specificNeeds, setSpecificNeeds] = useState('')
  const [includeVisuals, setIncludeVisuals] = useState(true)
  const [includeScripts, setIncludeScripts] = useState(true)
  
  const [generatedStrategies, setGeneratedStrategies] = useState('')
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

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedStrategies('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-calming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, strategyType, duration, setting,
          numberOfStrategies, specificNeeds, includeVisuals, includeScripts,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedStrategies(data.strategies); await handleSave(data.strategies) }
    } catch (error) { alert('Error generating strategies. Please try again.') }
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
          title: `Calming Strategies: ${strategyType} (${setting})`,
          toolType: 'calming',
          toolName: 'Calming Corner',
          content,
          metadata: { gradeLevel, strategyType, setting, numberOfStrategies },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedStrategies) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Calming Strategies - ${strategyType}`, content: generatedStrategies, toolName: 'Calming Corner' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Calming_Strategies_${strategyType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedStrategies); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🧘 Calming Corner Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Strategy Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800">
                  <option value="1-2 minutes">1-2 minutes (quick)</option>
                  <option value="2-5 minutes">2-5 minutes (standard)</option>
                  <option value="5-10 minutes">5-10 minutes (extended)</option>
                </select>
              </div>
            </div>

            {/* Strategy Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Strategy Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'breathing', label: '🌬️ Breathing', desc: 'Calming breaths' },
                  { id: 'grounding', label: '🌍 Grounding', desc: '5-4-3-2-1 senses' },
                  { id: 'movement', label: '🏃 Movement', desc: 'Physical release' },
                  { id: 'mindfulness', label: '🧘 Mindfulness', desc: 'Present moment' },
                  { id: 'visualization', label: '🌈 Visualization', desc: 'Safe place imagery' },
                  { id: 'sensory', label: '✋ Sensory', desc: 'Fidgets & textures' },
                  { id: 'cognitive', label: '💭 Cognitive', desc: 'Positive self-talk' },
                  { id: 'mixed', label: '🔄 Mixed', desc: 'Variety of types' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setStrategyType(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${strategyType === t.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-sky-300'}`}>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Setting */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Setting / Use Case</label>
              <select value={setting} onChange={(e) => setSetting(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800">
                <option value="classroom">🏫 Whole Classroom</option>
                <option value="calming-corner">🧸 Calming Corner (Individual)</option>
                <option value="one-on-one">👤 One-on-One Support</option>
                <option value="transition">🔄 Transitions</option>
                <option value="before-test">📝 Before Tests/Assessments</option>
                <option value="crisis">⚡ De-escalation</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2"># of Strategies</label>
              <select value={numberOfStrategies} onChange={(e) => setNumberOfStrategies(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800">
                <option value="3">3 strategies</option>
                <option value="5">5 strategies</option>
                <option value="8">8 strategies</option>
                <option value="10">10 strategies</option>
              </select>
            </div>

            {/* Options */}
            <div className="mb-4 p-4 bg-sky-50 rounded-lg border border-sky-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeScripts}
                    onChange={(e) => setIncludeScripts(e.target.checked)} className="w-5 h-5 text-sky-600 rounded" />
                  <span className="text-gray-700">📜 Word-for-word teacher scripts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVisuals}
                    onChange={(e) => setIncludeVisuals(e.target.checked)} className="w-5 h-5 text-sky-600 rounded" />
                  <span className="text-gray-700">🖼️ Visual/poster descriptions</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Specific Needs (optional)</label>
              <textarea value={specificNeeds} onChange={(e) => setSpecificNeeds(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 h-16"
                placeholder="e.g., Students with anxiety, sensory processing needs, anger management..." />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-sky-600 text-white p-3 rounded-lg hover:bg-sky-700 disabled:opacity-50">
              {generating ? '🧘 Creating Strategies...' : '🧘 Generate Strategies'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Strategies</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedStrategies && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-sky-600 hover:text-sky-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedStrategies ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedStrategies}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🧘</p>
                  <p className="mb-2">Your calming strategies will appear here</p>
                  <p className="text-xs">Trauma-informed self-regulation tools</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}