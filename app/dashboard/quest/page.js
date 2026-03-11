'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function QuestPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [questTheme, setQuestTheme] = useState('Fantasy Adventure')
  const [duration, setDuration] = useState('1 week')
  const [numChallenges, setNumChallenges] = useState('5')
  const [learningObjectives, setLearningObjectives] = useState('')
  const [includeRewards, setIncludeRewards] = useState(true)
  const [includeBossChallenge, setIncludeBossChallenge] = useState(true)

  const [generatedQuest, setGeneratedQuest] = useState('')
  const [editedQuest, setEditedQuest] = useState('')
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
    setGradeLevel('4th Grade')
    setSubject('Science')
    setTopic('The Solar System')
    setQuestTheme('Space Exploration')
    setDuration('2 weeks')
    setNumChallenges('8')
    setLearningObjectives('Students will identify the 8 planets in order, explain the difference between inner and outer planets, and describe at least 2 key features of each planet.')
    setIncludeRewards(true)
    setIncludeBossChallenge(true)
    setShowDemo(true)
    setGeneratedQuest('')
    setEditedQuest('')
    setActiveTab('input')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setTopic('')
    setQuestTheme('Fantasy Adventure')
    setDuration('1 week')
    setNumChallenges('5')
    setLearningObjectives('')
    setIncludeRewards(true)
    setIncludeBossChallenge(true)
    setShowDemo(false)
    setGeneratedQuest('')
    setEditedQuest('')
    setActiveTab('input')
  }

  const handleGenerate = async () => {
    if (!topic.trim()) { alert('Please enter a topic'); return }
    setGenerating(true)
    setGeneratedQuest('')
    setEditedQuest('')
    setSaved(false)
    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeLevel, subject, topic, questTheme, duration, numChallenges, learningObjectives, includeRewards, includeBossChallenge }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else {
        setGeneratedQuest(data.quest)
        setEditedQuest(data.quest)
        await handleSave(data.quest)
        setActiveTab('output')
      }
    } catch { alert('Error generating quest. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: `Quest: ${topic} (${questTheme})`, toolType: 'quest', toolName: 'Quest Designer', content, metadata: { gradeLevel, subject, topic, questTheme, duration } }),
      })
      setSaved(true)
    } catch { console.error('Error saving') }
  }

  const handleExport = async () => {
    if (!editedQuest) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Quest - ${topic}`, content: editedQuest, toolName: 'Quest Designer' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Quest_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(editedQuest); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"><p className="text-gray-500">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Quest Designer</span>
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
            <span className="text-3xl">🗡️</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Quest Designer</h1>
              <p className="text-gray-500 text-sm mt-1">Create immersive learning adventures with themed storylines, challenges, rewards, and a final boss showdown.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('input')} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>1. Quest Details</button>
          <button onClick={() => setActiveTab('output')} disabled={!generatedQuest} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-40'}`}>2. Generated Quest</button>
        </div>

        {activeTab === 'input' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quest Setup</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic / Unit <span className="text-red-500">*</span></label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Solar System, Fractions, American Revolution, Parts of Speech"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quest Theme</label>
                  <select value={questTheme} onChange={(e) => setQuestTheme(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Fantasy Adventure', 'Space Exploration', 'Mystery Detective', 'Time Travel', 'Ocean Discovery', 'Jungle Safari', 'Superhero Mission', 'Medieval Kingdom', 'Pirate Treasure', 'Robot Factory'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['1 day', '3 days', '1 week', '2 weeks', '1 month'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Challenges</label>
                <select value={numChallenges} onChange={(e) => setNumChallenges(e.target.value)} className="w-full md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  {['3', '5', '8', '10', '12'].map(n => <option key={n} value={n}>{n} challenges</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives <span className="text-gray-400 font-normal">(optional but improves output)</span></label>
                <textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)}
                  placeholder="What should students know or be able to do by the end of this quest?"
                  rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quest Features</h2>
              <div className="space-y-3">
                {[
                  { state: includeRewards, setter: setIncludeRewards, label: 'Rewards System', desc: 'XP points, ranks, and bonus challenges tied to completion' },
                  { state: includeBossChallenge, setter: setIncludeBossChallenge, label: 'Final Boss Challenge', desc: 'Epic culminating activity that synthesizes all skills learned in the quest' },
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
              {generating ? <><span className="animate-spin">⏳</span> Generating Quest...</> : <><span>🗡️</span> Generate Learning Quest</>}
            </button>
          </div>
        )}

        {activeTab === 'output' && generatedQuest && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Quest</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-sm">Review and edit below.</p>
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
              <textarea value={editedQuest} onChange={(e) => setEditedQuest(e.target.value)} rows={55} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm" />
            </div>
            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium text-sm">← Back to Edit Details</button>
          </div>
        )}
      </main>
    </div>
  )
}