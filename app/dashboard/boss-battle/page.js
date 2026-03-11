'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BossBattlePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [bossTheme, setBossTheme] = useState('Dragon')
  const [difficulty, setDifficulty] = useState('medium')
  const [numRounds, setNumRounds] = useState('5')
  const [teamBased, setTeamBased] = useState(true)
  const [includeHealthBar, setIncludeHealthBar] = useState(true)
  const [includePowerUps, setIncludePowerUps] = useState(true)

  const [generatedBattle, setGeneratedBattle] = useState('')
  const [editedBattle, setEditedBattle] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState('input')
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
    setSubject('Mathematics')
    setTopic('Order of Operations (PEMDAS)')
    setBossTheme('Math Wizard')
    setDifficulty('medium')
    setNumRounds('6')
    setTeamBased(true)
    setIncludeHealthBar(true)
    setIncludePowerUps(true)
    setShowDemo(true)
    setGeneratedBattle('')
    setEditedBattle('')
    setActiveTab('input')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setTopic('')
    setBossTheme('Dragon')
    setDifficulty('medium')
    setNumRounds('5')
    setTeamBased(true)
    setIncludeHealthBar(true)
    setIncludePowerUps(true)
    setShowDemo(false)
    setGeneratedBattle('')
    setEditedBattle('')
    setActiveTab('input')
  }

  const handleGenerate = async () => {
    if (!topic.trim()) { alert('Please enter a topic'); return }
    setGenerating(true)
    setGeneratedBattle('')
    setEditedBattle('')
    setSaved(false)
    try {
      const response = await fetch('/api/generate-boss-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeLevel, subject, topic, bossTheme, difficulty, numRounds, teamBased, includeHealthBar, includePowerUps }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else {
        setGeneratedBattle(data.bossBattle)
        setEditedBattle(data.bossBattle)
        await handleSave(data.bossBattle)
        setActiveTab('output')
      }
    } catch { alert('Error generating boss battle. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: `Boss Battle: ${topic}`, toolType: 'boss-battle', toolName: 'Boss Battle', content, metadata: { gradeLevel, subject, topic, bossTheme, difficulty } }),
      })
      setSaved(true)
    } catch { console.error('Error saving') }
  }

  const handleExport = async () => {
    if (!editedBattle) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Boss Battle - ${topic}`, content: editedBattle, toolName: 'Boss Battle' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Boss_Battle_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(editedBattle); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"><p className="text-gray-500">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Boss Battle</span>
          </div>
          <div className="flex gap-2">
            {!showDemo ? (
              <button onClick={handleShowDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">✨ See Demo</button>
            ) : (
              <button onClick={handleResetDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">↺ Reset</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🐉</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Boss Battle</h1>
              <p className="text-gray-500 text-sm mt-1">Turn any review session into an epic battle. Students defeat the boss by answering real curriculum questions correctly.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('input')} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>1. Battle Setup</button>
          <button onClick={() => setActiveTab('output')} disabled={!generatedBattle} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-40'}`}>2. Generated Battle</button>
        </div>

        {activeTab === 'input' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Battle Configuration</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic to Review <span className="text-red-500">*</span></label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Multiplication Facts, Vocabulary Unit 3, States of Matter, Civil War"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boss Theme</label>
                  <select value={bossTheme} onChange={(e) => setBossTheme(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Dragon', 'Math Wizard', 'Grammar Goblin', 'Science Monster', 'History Hunter', 'Vocabulary Vampire', 'Robot Overlord', 'Pirate Captain', 'Alien Invader', 'Evil Professor'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="easy">⭐ Easy — relaxed pace, hints available</option>
                    <option value="medium">⭐⭐ Medium — balanced challenge</option>
                    <option value="hard">⭐⭐⭐ Hard — fast pace, no hints</option>
                    <option value="epic">💀 Epic — ultimate challenge!</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rounds</label>
                <select value={numRounds} onChange={(e) => setNumRounds(e.target.value)} className="w-full md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  {['3', '5', '6', '8', '10'].map(n => <option key={n} value={n}>{n} rounds</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Battle Features</h2>
              <div className="space-y-3">
                {[
                  { state: teamBased, setter: setTeamBased, label: 'Team-Based Battle', desc: 'Students work in teams to defeat the boss together' },
                  { state: includeHealthBar, setter: setIncludeHealthBar, label: 'Health Bar System', desc: 'Visual HP tracker showing boss weakening with each correct answer' },
                  { state: includePowerUps, setter: setIncludePowerUps, label: 'Power-Ups', desc: 'Shields, critical strikes, and super attacks earned through streaks' },
                ].map(({ state, setter, label, desc }) => (
                  <label key={label} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <div>
                      <span className="text-gray-700 font-medium">{label}</span>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !topic.trim()} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base">
              {generating ? <><span className="animate-spin">⏳</span> Generating Battle...</> : <><span>⚔️</span> Generate Boss Battle</>}
            </button>
          </div>
        )}

        {activeTab === 'output' && generatedBattle && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Boss Battle</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-sm">Review and edit below. All questions are real — ready to use.</p>
                    {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Saved</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                  <button onClick={handleExport} disabled={exporting} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm">{exporting ? 'Exporting...' : '📄 Export .docx'}</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <textarea value={editedBattle} onChange={(e) => setEditedBattle(e.target.value)} rows={55} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm" />
            </div>
            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium text-sm">← Back to Edit Details</button>
          </div>
        )}
      </main>
    </div>
  )
}