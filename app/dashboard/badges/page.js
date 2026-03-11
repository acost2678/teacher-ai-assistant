'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BadgesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('All Subjects')
  const [badgeCategory, setBadgeCategory] = useState('Academic Achievement')
  const [classTheme, setClassTheme] = useState('General')
  const [numBadges, setNumBadges] = useState('10')
  const [includeCriteria, setIncludeCriteria] = useState(true)
  const [includeDescriptions, setIncludeDescriptions] = useState(true)
  const [includeVisualIdeas, setIncludeVisualIdeas] = useState(true)

  const [generatedBadges, setGeneratedBadges] = useState('')
  const [editedBadges, setEditedBadges] = useState('')
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
    setSubject('All Subjects')
    setBadgeCategory('Mixed (Academic + Behavior + SEL)')
    setClassTheme('Space Explorer')
    setNumBadges('12')
    setIncludeCriteria(true)
    setIncludeDescriptions(true)
    setIncludeVisualIdeas(true)
    setShowDemo(true)
    setGeneratedBadges('')
    setEditedBadges('')
    setActiveTab('input')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('All Subjects')
    setBadgeCategory('Academic Achievement')
    setClassTheme('General')
    setNumBadges('10')
    setIncludeCriteria(true)
    setIncludeDescriptions(true)
    setIncludeVisualIdeas(true)
    setShowDemo(false)
    setGeneratedBadges('')
    setEditedBadges('')
    setActiveTab('input')
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedBadges('')
    setEditedBadges('')
    setSaved(false)
    try {
      const response = await fetch('/api/generate-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeLevel, subject, badgeCategory, classTheme, numBadges, includeCriteria, includeDescriptions, includeVisualIdeas }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else {
        setGeneratedBadges(data.badges)
        setEditedBadges(data.badges)
        await handleSave(data.badges)
        setActiveTab('output')
      }
    } catch { alert('Error generating badges. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: `Badges: ${classTheme} Theme - ${gradeLevel}`, toolType: 'badges', toolName: 'Badge Creator', content, metadata: { gradeLevel, subject, badgeCategory, classTheme, numBadges } }),
      })
      setSaved(true)
    } catch { console.error('Error saving') }
  }

  const handleExport = async () => {
    if (!editedBadges) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Badges - ${classTheme} Theme`, content: editedBadges, toolName: 'Badge Creator' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Badges_${classTheme.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(editedBadges); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"><p className="text-gray-500">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Badge Creator</span>
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
            <span className="text-3xl">🏅</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Badge Creator</h1>
              <p className="text-gray-500 text-sm mt-1">Design themed achievement badges with earning criteria, student descriptions, and visual design ideas.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('input')} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>1. Badge Details</button>
          <button onClick={() => setActiveTab('output')} disabled={!generatedBadges} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-40'}`}>2. Generated Badges</button>
        </div>

        {activeTab === 'input' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Badge System Setup</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Focus</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['All Subjects', 'English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Computer Science'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge Category</label>
                  <select value={badgeCategory} onChange={(e) => setBadgeCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Academic Achievement', 'Behavior & Character', 'SEL & Growth Mindset', 'Collaboration & Teamwork', 'Effort & Perseverance', 'Mixed (Academic + Behavior + SEL)'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classroom Theme</label>
                  <select value={classTheme} onChange={(e) => setClassTheme(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['General', 'Space Explorer', 'Ocean Adventure', 'Superhero Academy', 'Fantasy Kingdom', 'Jungle Safari', 'Sports Champions', 'Video Game', 'Science Lab', 'Art Studio'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Badges</label>
                <select value={numBadges} onChange={(e) => setNumBadges(e.target.value)} className="w-full md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  {['5', '8', '10', '12', '15', '20'].map(n => <option key={n} value={n}>{n} badges</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Include in Each Badge</h2>
              <div className="space-y-3">
                {[
                  { state: includeCriteria, setter: setIncludeCriteria, label: 'Earning Criteria', desc: 'Specific, measurable requirements to earn each badge' },
                  { state: includeDescriptions, setter: setIncludeDescriptions, label: 'Student Descriptions', desc: 'Kid-friendly explanation of what the badge means — written to the student' },
                  { state: includeVisualIdeas, setter: setIncludeVisualIdeas, label: 'Visual Design Ideas', desc: 'Colors, shape, icon, and border suggestions for creating the badge' },
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

            <button onClick={handleGenerate} disabled={generating} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base">
              {generating ? <><span className="animate-spin">⏳</span> Generating Badges...</> : <><span>🏅</span> Generate Badge Collection</>}
            </button>
          </div>
        )}

        {activeTab === 'output' && generatedBadges && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Badges</h2>
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
              <textarea value={editedBadges} onChange={(e) => setEditedBadges(e.target.value)} rows={50} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm" />
            </div>
            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium text-sm">← Back to Edit Details</button>
          </div>
        )}
      </main>
    </div>
  )
}