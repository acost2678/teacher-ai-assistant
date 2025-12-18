'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function BossBattlePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [bossTheme, setBossTheme] = useState('dragon')
  const [battleType, setBattleType] = useState('whole-class')
  const [teamSize, setTeamSize] = useState('whole-class')
  const [questionCount, setQuestionCount] = useState('10')
  const [difficulty, setDifficulty] = useState('medium')
  const [includeHealthBar, setIncludeHealthBar] = useState(true)
  const [includePowerUps, setIncludePowerUps] = useState(true)
  const [timeLimit, setTimeLimit] = useState('25 minutes')
  
  const [generatedBattle, setGeneratedBattle] = useState('')
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
    if (!topic) {
      alert('Please enter a topic to review')
      return
    }
    setGenerating(true)
    setGeneratedBattle('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-boss-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, bossTheme, battleType,
          teamSize, questionCount, difficulty, includeHealthBar,
          includePowerUps, timeLimit,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedBattle(data.bossBattle); await handleSave(data.bossBattle) }
    } catch (error) { alert('Error generating boss battle. Please try again.') }
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
          title: `Boss Battle: ${topic} (${bossTheme})`,
          toolType: 'boss-battle',
          toolName: 'Boss Battle',
          content,
          metadata: { gradeLevel, subject, topic, bossTheme, battleType, questionCount },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedBattle) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Boss Battle - ${topic}`, content: generatedBattle, toolName: 'Boss Battle' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `BossBattle_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedBattle); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🐉 Boss Battle Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Battle Setup</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic to Review *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                placeholder="e.g., Multiplication facts, Vocabulary Unit 3, Photosynthesis" />
            </div>

            {/* Boss Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">🐉 Choose Your Boss</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dragon', label: '🐉 Dragon' },
                  { id: 'wizard', label: '🧙 Wizard' },
                  { id: 'robot', label: '🤖 Robot' },
                  { id: 'monster', label: '👹 Monster' },
                  { id: 'alien', label: '👽 Alien' },
                  { id: 'villain', label: '🦹 Villain' },
                ].map(b => (
                  <button key={b.id} type="button" onClick={() => setBossTheme(b.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${bossTheme === b.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}>
                    <div className="text-2xl">{b.label.split(' ')[0]}</div>
                    <div className="text-xs text-gray-600">{b.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Battle Type</label>
                <select value={battleType} onChange={(e) => setBattleType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  <option value="whole-class">👥 Whole Class vs Boss</option>
                  <option value="teams">⚔️ Teams Competition</option>
                  <option value="individual">🦸 Individual Heroes</option>
                  <option value="relay">🔄 Relay Battle</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Questions</label>
                <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  <option value="5">5 questions</option>
                  <option value="10">10 questions</option>
                  <option value="15">15 questions</option>
                  <option value="20">20 questions</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  <option value="easy">Easy Boss</option>
                  <option value="medium">Medium Boss</option>
                  <option value="hard">Hard Boss</option>
                  <option value="epic">Epic Boss 👑</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Time Limit</label>
                <select value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800">
                  <option value="15 minutes">15 minutes</option>
                  <option value="25 minutes">25 minutes</option>
                  <option value="35 minutes">35 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                </select>
              </div>
            </div>

            {/* Game Features */}
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <label className="block text-gray-800 font-medium mb-3">🎮 Game Features</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeHealthBar}
                    onChange={(e) => setIncludeHealthBar(e.target.checked)} className="w-5 h-5 text-red-600 rounded" />
                  <span className="text-gray-700">❤️ Boss Health Bar System</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includePowerUps}
                    onChange={(e) => setIncludePowerUps(e.target.checked)} className="w-5 h-5 text-red-600 rounded" />
                  <span className="text-gray-700">⚡ Power-Ups & Special Abilities</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {generating ? '⚔️ Summoning Boss...' : '⚔️ Generate Boss Battle'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Battle</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedBattle && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-red-600 hover:text-red-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedBattle ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedBattle}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🐉</p>
                  <p className="mb-2">Your boss battle will appear here</p>
                  <p className="text-xs">Epic review games for your class!</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}