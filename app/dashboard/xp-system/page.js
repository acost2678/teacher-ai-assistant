'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function XPSystemPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [classSize, setClassSize] = useState('25')
  const [systemTheme, setSystemTheme] = useState('simple')
  const [trackingMethod, setTrackingMethod] = useState('hybrid')
  const [includeLeaderboard, setIncludeLeaderboard] = useState(true)
  const [includeLevels, setIncludeLevels] = useState(true)
  const [includeShop, setIncludeShop] = useState(true)
  const [focusAreas, setFocusAreas] = useState('')
  const [customBehaviors, setCustomBehaviors] = useState('')
  
  const [generatedSystem, setGeneratedSystem] = useState('')
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
    setGradeLevel('4th Grade')
    setClassSize('25')
    setSystemTheme('adventure')
    setTrackingMethod('hybrid')
    setIncludeLeaderboard(true)
    setIncludeLevels(true)
    setIncludeShop(true)
    setFocusAreas('Reading stamina, Math problem-solving, Collaboration')
    setCustomBehaviors('Using growth mindset language, Helping a classmate, Turning in homework on time, Participating in class discussion')
    setShowDemo(true)
    setGeneratedSystem('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setClassSize('25')
    setSystemTheme('simple')
    setTrackingMethod('hybrid')
    setIncludeLeaderboard(true)
    setIncludeLevels(true)
    setIncludeShop(true)
    setFocusAreas('')
    setCustomBehaviors('')
    setShowDemo(false)
    setGeneratedSystem('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedSystem('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-xp-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, classSize, systemTheme, trackingMethod,
          includeLeaderboard, includeLevels, includeShop,
          focusAreas, customBehaviors,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedSystem(data.xpSystem); await handleSave(data.xpSystem) }
    } catch (error) { alert('Error generating XP system. Please try again.') }
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
          title: `XP System: ${systemTheme} theme`,
          toolType: 'xp-system',
          toolName: 'XP System',
          content,
          metadata: { gradeLevel, classSize, systemTheme, includeLevels, includeShop },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedSystem) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `XP System - ${systemTheme}`, content: generatedSystem, toolName: 'XP System' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `XP_System_${systemTheme}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedSystem); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">⚡ XP System Generator</h1>
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
                <p className="text-purple-600 text-sm">We've filled in an adventure-themed XP system with leveling, shop, and leaderboard. Click Generate to see the full system.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">System Setup</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Class Size</label>
                <select value={classSize} onChange={(e) => setClassSize(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                  <option value="15">~15 students</option>
                  <option value="20">~20 students</option>
                  <option value="25">~25 students</option>
                  <option value="30">~30 students</option>
                  <option value="35">~35 students</option>
                </select>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">⚡ System Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'simple', label: '⭐ Simple', desc: 'Clean points' },
                  { id: 'adventure', label: '⚔️ Adventure', desc: 'RPG heroes' },
                  { id: 'space', label: '🚀 Space', desc: 'Astronauts' },
                  { id: 'sports', label: '🏆 Sports', desc: 'Team points' },
                  { id: 'minecraft', label: '⛏️ Building', desc: 'Craft & build' },
                  { id: 'pokemon', label: '🎮 Training', desc: 'Level up' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setSystemTheme(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${systemTheme === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Method */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">📊 Tracking Method</label>
              <select value={trackingMethod} onChange={(e) => setTrackingMethod(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800">
                <option value="physical">📝 Physical Only (cards, charts)</option>
                <option value="digital">💻 Digital Only (spreadsheet, app)</option>
                <option value="hybrid">🔄 Hybrid (daily paper, weekly digital)</option>
              </select>
            </div>

            {/* System Components */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <label className="block text-gray-800 font-medium mb-3">🎮 System Components</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeLevels}
                    onChange={(e) => setIncludeLevels(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                  <div>
                    <span className="text-gray-700 font-medium">📊 Leveling System</span>
                    <p className="text-xs text-gray-500">Students level up with titles & privileges</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeShop}
                    onChange={(e) => setIncludeShop(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                  <div>
                    <span className="text-gray-700 font-medium">🛒 Reward Shop</span>
                    <p className="text-xs text-gray-500">Students spend XP on rewards</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeLeaderboard}
                    onChange={(e) => setIncludeLeaderboard(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                  <div>
                    <span className="text-gray-700 font-medium">🏆 Leaderboard</span>
                    <p className="text-xs text-gray-500">Weekly rankings & bonuses</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Focus Areas (optional)</label>
              <input type="text" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
                placeholder="e.g., Reading stamina, Math fact fluency, Kindness" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Custom Behaviors to Reward (optional)</label>
              <textarea value={customBehaviors} onChange={(e) => setCustomBehaviors(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 h-16"
                placeholder="e.g., Using growth mindset language, Showing PBIS values, Book report completion" />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {generating ? '⚡ Building System...' : '⚡ Generate XP System'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">This creates a complete classroom point system</p>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated XP System</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedSystem && (
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

            {generatedSystem ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedSystem}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">⚡</p>
                  <p className="mb-2">Your XP system will appear here</p>
                  <p className="text-xs">Complete classroom gamification setup!</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}