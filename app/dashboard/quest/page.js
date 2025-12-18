'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function QuestPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [questType, setQuestType] = useState('main-quest')
  const [duration, setDuration] = useState('1 class period')
  const [difficulty, setDifficulty] = useState('medium')
  const [theme, setTheme] = useState('adventure')
  const [numberOfQuests, setNumberOfQuests] = useState('1')
  const [includeCheckpoints, setIncludeCheckpoints] = useState(true)
  const [rewards, setRewards] = useState('')
  const [learningObjectives, setLearningObjectives] = useState('')
  
  const [generatedQuest, setGeneratedQuest] = useState('')
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
      alert('Please enter a topic or skill')
      return
    }
    setGenerating(true)
    setGeneratedQuest('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, questType, duration,
          difficulty, theme, numberOfQuests, includeCheckpoints,
          rewards, learningObjectives,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedQuest(data.quest); await handleSave(data.quest) }
    } catch (error) { alert('Error generating quest. Please try again.') }
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
          title: `Quest: ${topic} (${theme})`,
          toolType: 'quest',
          toolName: 'Quest',
          content,
          metadata: { gradeLevel, subject, topic, questType, theme, difficulty },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedQuest) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Quest - ${topic}`, content: generatedQuest, toolName: 'Quest' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Quest_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedQuest); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🗡️ Quest Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quest Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic/Skill *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800"
                placeholder="e.g., Multiplication facts, Figurative language, States of matter" />
            </div>

            {/* Theme Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">🎨 Quest Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'fantasy', label: '🏰 Fantasy', desc: 'Knights & dragons' },
                  { id: 'space', label: '🚀 Space', desc: 'Astronauts & planets' },
                  { id: 'mystery', label: '🔍 Mystery', desc: 'Detective cases' },
                  { id: 'superhero', label: '🦸 Superhero', desc: 'Powers & heroes' },
                  { id: 'adventure', label: '🗺️ Adventure', desc: 'Treasure & maps' },
                  { id: 'minecraft', label: '⛏️ Building', desc: 'Craft & create' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${theme === t.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}>
                    <div className="font-medium text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Quest Type</label>
                <select value={questType} onChange={(e) => setQuestType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  <option value="main-quest">⚔️ Main Quest</option>
                  <option value="side-quest">📜 Side Quest</option>
                  <option value="daily-quest">☀️ Daily Quest</option>
                  <option value="group-quest">👥 Group Quest</option>
                  <option value="boss-prep">🎯 Boss Prep</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  <option value="easy">⭐ Easy</option>
                  <option value="medium">⭐⭐ Medium</option>
                  <option value="hard">⭐⭐⭐ Hard</option>
                  <option value="legendary">👑 Legendary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 class period">1 class period</option>
                  <option value="2 class periods">2 class periods</option>
                  <option value="1 week">1 week</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Quests</label>
                <select value={numberOfQuests} onChange={(e) => setNumberOfQuests(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800">
                  <option value="1">1 quest</option>
                  <option value="3">3 quests</option>
                  <option value="5">5 quests (quest chain)</option>
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input type="checkbox" id="includeCheckpoints" checked={includeCheckpoints}
                onChange={(e) => setIncludeCheckpoints(e.target.checked)} className="w-5 h-5 text-violet-600 rounded" />
              <label htmlFor="includeCheckpoints" className="text-gray-700">Include checkpoints with XP rewards</label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Learning Objectives (optional)</label>
              <textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 h-16"
                placeholder="What should students learn from this quest?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Reward Ideas (optional)</label>
              <textarea value={rewards} onChange={(e) => setRewards(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 h-16"
                placeholder="e.g., Homework pass, Extra recess, Treasure chest pick, Class points" />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-violet-600 text-white p-3 rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {generating ? '⚔️ Creating Quest...' : '⚔️ Generate Quest'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Quest</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedQuest && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-violet-600 hover:text-violet-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedQuest ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedQuest}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🗡️</p>
                  <p className="mb-2">Your quest will appear here</p>
                  <p className="text-xs">Epic learning adventures await!</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}