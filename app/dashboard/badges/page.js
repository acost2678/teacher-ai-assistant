'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function BadgePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('General')
  const [badgeCategory, setBadgeCategory] = useState('academic')
  const [numberOfBadges, setNumberOfBadges] = useState('5')
  const [badgeStyle, setBadgeStyle] = useState('classic')
  const [includeRequirements, setIncludeRequirements] = useState(true)
  const [includeLevels, setIncludeLevels] = useState(false)
  const [customAchievements, setCustomAchievements] = useState('')
  
  const [generatedBadges, setGeneratedBadges] = useState('')
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
    setGeneratedBadges('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, badgeCategory, numberOfBadges,
          badgeStyle, includeRequirements, includeLevels, customAchievements,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedBadges(data.badges); await handleSave(data.badges) }
    } catch (error) { alert('Error generating badges. Please try again.') }
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
          title: `Badges: ${badgeCategory} (${numberOfBadges})`,
          toolType: 'badges',
          toolName: 'Badges',
          content,
          metadata: { gradeLevel, subject, badgeCategory, badgeStyle, numberOfBadges },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedBadges) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Badges - ${badgeCategory}`, content: generatedBadges, toolName: 'Badges' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Badges_${badgeCategory}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedBadges); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">🏆 Badge Designer</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Badge Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject (optional)</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                  <option value="General">General / All Subjects</option>
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Badge Category */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">🏆 Badge Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'academic', label: '📚 Academic', desc: 'Learning mastery' },
                  { id: 'behavior', label: '⭐ Behavior', desc: 'Character & SEL' },
                  { id: 'participation', label: '🙋 Participation', desc: 'Engagement' },
                  { id: 'growth', label: '📈 Growth', desc: 'Improvement' },
                  { id: 'collaboration', label: '🤝 Collaboration', desc: 'Teamwork' },
                  { id: 'creativity', label: '🎨 Creativity', desc: 'Innovation' },
                ].map(c => (
                  <button key={c.id} type="button" onClick={() => setBadgeCategory(c.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${badgeCategory === c.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}>
                    <div className="font-medium text-gray-800">{c.label}</div>
                    <div className="text-xs text-gray-500">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Badge Style */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">🎨 Visual Style</label>
              <select value={badgeStyle} onChange={(e) => setBadgeStyle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                <option value="classic">⭐ Classic School (stars, ribbons)</option>
                <option value="fantasy">🏰 Fantasy (knights, wizards)</option>
                <option value="space">🚀 Space (astronauts, planets)</option>
                <option value="nature">🌿 Nature (animals, elements)</option>
                <option value="sports">🏅 Sports (medals, trophies)</option>
                <option value="tech">🤖 Tech (robots, coding)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2"># of Badges</label>
                <select value={numberOfBadges} onChange={(e) => setNumberOfBadges(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800">
                  <option value="3">3 badges</option>
                  <option value="5">5 badges</option>
                  <option value="8">8 badges</option>
                  <option value="10">10 badges</option>
                </select>
              </div>
            </div>

            {/* Options */}
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <label className="block text-gray-800 font-medium mb-3">Badge Features</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeRequirements}
                    onChange={(e) => setIncludeRequirements(e.target.checked)} className="w-5 h-5 text-yellow-600 rounded" />
                  <span className="text-gray-700">✅ Include earning requirements</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeLevels}
                    onChange={(e) => setIncludeLevels(e.target.checked)} className="w-5 h-5 text-yellow-600 rounded" />
                  <span className="text-gray-700">🥉🥈🥇 Include tiered levels (Bronze → Platinum)</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Custom Achievements (optional)</label>
              <textarea value={customAchievements} onChange={(e) => setCustomAchievements(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800 h-20"
                placeholder="List specific achievements you want badges for, e.g., Perfect attendance, Book club completion, Math fact mastery" />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50">
              {generating ? '🏆 Designing Badges...' : '🏆 Generate Badges'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Badges</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedBadges && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-yellow-600 hover:text-yellow-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedBadges ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedBadges}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">🏆</p>
                  <p className="mb-2">Your badges will appear here</p>
                  <p className="text-xs">Achievement systems that motivate!</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}