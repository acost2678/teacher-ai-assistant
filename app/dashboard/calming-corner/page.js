'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function CalmingCornerPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [spaceType, setSpaceType] = useState('Classroom Corner')
  const [budget, setBudget] = useState('Low ($0-50)')
  const [focusAreas, setFocusAreas] = useState(['anxiety', 'anger'])
  const [includeStrategies, setIncludeStrategies] = useState(true)
  const [includeVisuals, setIncludeVisuals] = useState(true)
  const [includeRules, setIncludeRules] = useState(true)
  
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const outputRef = useRef(null)
  const router = useRouter()

  const focusOptions = [
    { id: 'anxiety', label: 'Anxiety/Worry' },
    { id: 'anger', label: 'Anger/Frustration' },
    { id: 'sadness', label: 'Sadness' },
    { id: 'overwhelm', label: 'Feeling Overwhelmed' },
    { id: 'sensory', label: 'Sensory Needs' },
    { id: 'focus', label: 'Focus/Attention' },
  ]

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {
        router.push('/auth/login')
      }
    }
    checkSession()
  }, [router])

  const handleShowDemo = () => {
    setGradeLevel('2nd Grade')
    setSpaceType('Classroom Corner')
    setBudget('Medium ($50-150)')
    setFocusAreas(['anxiety', 'anger', 'overwhelm', 'sensory'])
    setIncludeStrategies(true)
    setIncludeVisuals(true)
    setIncludeRules(true)
    setShowDemo(true)
    setGeneratedPlan('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSpaceType('Classroom Corner')
    setBudget('Low ($0-50)')
    setFocusAreas(['anxiety', 'anger'])
    setIncludeStrategies(true)
    setIncludeVisuals(true)
    setIncludeRules(true)
    setShowDemo(false)
    setGeneratedPlan('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFocusToggle = (focusId) => {
    if (focusAreas.includes(focusId)) {
      if (focusAreas.length > 1) {
        setFocusAreas(focusAreas.filter(f => f !== focusId))
      }
    } else {
      setFocusAreas([...focusAreas, focusId])
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-calming-corner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, spaceType, budget, focusAreas,
          includeStrategies, includeVisuals, includeRules,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedPlan(data.plan)
        await handleSave(data.plan)
      }
    } catch (error) {
      alert('Error generating calming corner plan. Please try again.')
    }
    
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
          title: `Calming Corner: ${spaceType}`,
          toolType: 'calming-corner',
          toolName: 'Calming Corner',
          content,
          metadata: { gradeLevel, spaceType, budget, focusAreas },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedPlan) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Calming Corner - ${spaceType}`,
          content: generatedPlan,
          toolName: 'Calming Corner'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Calming_Corner_Plan.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Failed to export')
    }
    setExporting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPlan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Calming Corner</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Calming Corner</h1>
              <p className="text-gray-500">Design a self-regulation space with strategies and materials.</p>
            </div>
            <div className="flex items-center gap-3">
              {showDemo && (
                <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowDemo} className={`text-sm font-medium transition-colors ${showDemo ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                See Demo
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in example inputs. Click Generate to see a sample output.</p>
                </div>
                <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  Scroll to view output
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level:</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Space Type:</label>
              <select value={spaceType} onChange={(e) => setSpaceType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Classroom Corner', 'Small Nook/Closet', 'Portable Kit', 'Desk-Based Tools', 'Hallway Space', 'Counselor Office'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget:</label>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
              {['Free (DIY only)', 'Low ($0-50)', 'Medium ($50-150)', 'Higher ($150+)'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas:</label>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map(focus => (
                <button key={focus.id} onClick={() => handleFocusToggle(focus.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${focusAreas.includes(focus.id) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {focus.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeStrategies} onChange={(e) => setIncludeStrategies(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
              <div>
                <span className="text-gray-700">Include calming strategies</span>
                <p className="text-sm text-gray-500">Step-by-step coping techniques for students</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeVisuals} onChange={(e) => setIncludeVisuals(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
              <div>
                <span className="text-gray-700">Include visual supports</span>
                <p className="text-sm text-gray-500">Poster ideas, choice menus, feeling charts</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeRules} onChange={(e) => setIncludeRules(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
              <div>
                <span className="text-gray-700">Include expectations/rules</span>
                <p className="text-sm text-gray-500">Guidelines for when/how to use the space</p>
              </div>
            </label>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Plan</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedPlan && (
              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export .docx'}
                </button>
              </div>
            )}
          </div>

          {generatedPlan ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedPlan}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">🧘</div>
                <p className="text-gray-400">Your generated plan will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}