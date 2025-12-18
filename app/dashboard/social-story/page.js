'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SocialStoryPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('K-2nd Grade')
  const [storyTopic, setStoryTopic] = useState('transitions')
  const [customTopic, setCustomTopic] = useState('')
  const [studentContext, setStudentContext] = useState('')
  const [storyLength, setStoryLength] = useState('medium')
  const [perspectiveType, setPerspectiveType] = useState('first')
  const [includeVisualCues, setIncludeVisualCues] = useState(true)
  const [includeComprehensionQuestions, setIncludeComprehensionQuestions] = useState(true)
  
  const [generatedStory, setGeneratedStory] = useState('')
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
    if (storyTopic === 'custom' && !customTopic.trim()) {
      alert('Please enter a custom topic')
      return
    }
    
    setGenerating(true)
    setGeneratedStory('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-social-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, storyTopic, customTopic, studentContext,
          storyLength, perspectiveType, includeVisualCues, includeComprehensionQuestions,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedStory(data.story); await handleSave(data.story) }
    } catch (error) { alert('Error generating story. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    const topicName = storyTopic === 'custom' ? customTopic : storyTopic
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Social Story: ${topicName} (${gradeLevel})`,
          toolType: 'social-story',
          toolName: 'Social Story',
          content,
          metadata: { gradeLevel, storyTopic, customTopic },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedStory) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Social Story - ${storyTopic}`, 
          content: generatedStory, 
          toolName: 'Social Story' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Social_Story_${storyTopic}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedStory); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📖 Social Story Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-purple-800 text-sm">
            <strong>Carol Gray's Social Stories™:</strong> These stories help students understand social situations 
            using descriptive, perspective, and directive sentences. Great for students with autism, anxiety, 
            or anyone who benefits from explicit social instruction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Story Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <option value="Pre-K">Pre-K</option>
                  <option value="K-2nd Grade">K-2nd Grade</option>
                  <option value="3rd-5th Grade">3rd-5th Grade</option>
                  <option value="6th-8th Grade">Middle School</option>
                  <option value="9th-12th Grade">High School</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Story Length</label>
                <select value={storyLength} onChange={(e) => setStoryLength(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <option value="short">Short (5-7 sentences)</option>
                  <option value="medium">Medium (8-12 sentences)</option>
                  <option value="long">Long (13-18 sentences)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Story Topic</label>
              <select value={storyTopic} onChange={(e) => setStoryTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                <optgroup label="Transitions & Routines">
                  <option value="transitions">🔄 Transitions</option>
                  <option value="following-directions">👂 Following Directions</option>
                  <option value="unexpected-changes">😮 Unexpected Changes</option>
                  <option value="waiting">⏰ Waiting</option>
                </optgroup>
                <optgroup label="Social Skills">
                  <option value="taking-turns">🔁 Taking Turns</option>
                  <option value="making-friends">👋 Making Friends</option>
                  <option value="personal-space">↔️ Personal Space</option>
                  <option value="group-work">👥 Group Work</option>
                </optgroup>
                <optgroup label="Emotions & Coping">
                  <option value="managing-anger">😤 Managing Big Feelings</option>
                  <option value="losing-game">🎮 Losing a Game</option>
                  <option value="asking-help">✋ Asking for Help</option>
                  <option value="loud-noises">🔊 Loud Noises</option>
                </optgroup>
                <optgroup label="School Situations">
                  <option value="cafeteria">🍽️ Cafeteria</option>
                  <option value="recess">⛹️ Recess</option>
                  <option value="bathroom">🚻 Using the Bathroom</option>
                  <option value="fire-drill">🚨 Fire Drill</option>
                  <option value="substitute-teacher">👩‍🏫 Substitute Teacher</option>
                  <option value="assembly">🎭 Assembly</option>
                  <option value="field-trip">🚌 Field Trip</option>
                </optgroup>
                <optgroup label="Custom">
                  <option value="custom">✨ Custom Topic</option>
                </optgroup>
              </select>
            </div>

            {storyTopic === 'custom' && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Custom Topic</label>
                <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                  placeholder="e.g., Riding the school bus, Going to the dentist..." />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Perspective</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'first', label: 'I will...', desc: 'First person' },
                  { id: 'third', label: '[Name] will...', desc: 'Third person' },
                  { id: 'we', label: 'We will...', desc: 'Inclusive' },
                ].map(p => (
                  <button key={p.id} type="button" onClick={() => setPerspectiveType(p.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${perspectiveType === p.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    <div className="font-medium text-gray-800 text-sm">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Student Context (optional)</label>
              <textarea value={studentContext} onChange={(e) => setStudentContext(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-20 text-sm"
                placeholder="e.g., Student has autism and is sensitive to loud sounds, benefits from visual schedules, loves dinosaurs..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeVisualCues}
                    onChange={(e) => setIncludeVisualCues(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">🖼️ Visual Support Suggestions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeComprehensionQuestions}
                    onChange={(e) => setIncludeComprehensionQuestions(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">❓ Comprehension Questions</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || (storyTopic === 'custom' && !customTopic.trim())}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? '📖 Creating Story...' : '📖 Generate Social Story'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Social Story</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedStory && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-purple-600 hover:text-purple-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedStory ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedStory}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📖</p>
                  <p className="mb-2">Your social story will appear here</p>
                  <p className="text-xs">Following Carol Gray's guidelines</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}