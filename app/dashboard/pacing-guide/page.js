'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PacingGuidePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [unitTopic, setUnitTopic] = useState('')
  const [timeframe, setTimeframe] = useState('3 weeks')
  const [totalDays, setTotalDays] = useState('15')
  const [standardsFramework, setStandardsFramework] = useState('Common Core')
  const [customStandards, setCustomStandards] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [endGoals, setEndGoals] = useState('')
  const [assessmentDates, setAssessmentDates] = useState('')
  
  const [generatedGuide, setGeneratedGuide] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const outputRef = useRef(null)
  const router = useRouter()

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
    setGradeLevel('5th Grade')
    setSubject('Science')
    setUnitTopic('Ecosystems and Food Webs')
    setTimeframe('4 weeks')
    setTotalDays('20')
    setStandardsFramework('NGSS')
    setCustomStandards('5-LS2-1: Develop a model to describe the movement of matter among plants, animals, decomposers, and the environment.')
    setPriorKnowledge('Students understand basic needs of living things, can classify organisms as plants or animals.')
    setEndGoals('Students will create a detailed food web model and explain energy transfer between trophic levels.')
    setAssessmentDates('Quiz on Day 10, Final Project due Day 20')
    setShowDemo(true)
    setGeneratedGuide('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setUnitTopic('')
    setTimeframe('3 weeks')
    setTotalDays('15')
    setStandardsFramework('Common Core')
    setCustomStandards('')
    setPriorKnowledge('')
    setEndGoals('')
    setAssessmentDates('')
    setShowDemo(false)
    setGeneratedGuide('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!unitTopic) {
      alert('Please enter a unit topic')
      return
    }
    
    setGenerating(true)
    setGeneratedGuide('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-pacing-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, unitTopic, timeframe, totalDays,
          standardsFramework, customStandards, priorKnowledge, endGoals, assessmentDates,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedGuide(data.pacingGuide)
        await handleSave(data.pacingGuide)
      }
    } catch (error) {
      alert('Error generating pacing guide. Please try again.')
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
          title: `Pacing Guide: ${unitTopic}`,
          toolType: 'pacing-guide',
          toolName: 'Pacing Guide',
          content,
          metadata: { gradeLevel, subject, unitTopic, timeframe, totalDays },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedGuide) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Pacing Guide - ${unitTopic}`,
          content: generatedGuide,
          toolName: 'Pacing Guide'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Pacing_Guide_${unitTopic.replace(/\s+/g, '_')}.docx`
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
    navigator.clipboard.writeText(generatedGuide)
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
            <span className="text-gray-800 font-medium">Pacing Guide</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Pacing Guide</h1>
              <p className="text-gray-500">Map curriculum across weeks or quarters with day-by-day planning.</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level: *</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject: *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit/Topic: *</label>
            <input type="text" value={unitTopic} onChange={(e) => setUnitTopic(e.target.value)} placeholder="e.g., Fraction Operations, American Revolution, Persuasive Writing"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe:</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['1 week', '2 weeks', '3 weeks', '4 weeks', '6 weeks', '9 weeks (Quarter)', '18 weeks (Semester)'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Instructional Days:</label>
              <input type="number" value={totalDays} onChange={(e) => setTotalDays(e.target.value)} placeholder="e.g., 15" min="1" max="90"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Standards Framework:</label>
            <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
              {['Common Core', 'NGSS', 'State Standards', 'Texas TEKS', 'Virginia SOLs', 'Florida B.E.S.T.', 'Custom'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Paste Your Standards (Recommended):</label>
            <textarea value={customStandards} onChange={(e) => setCustomStandards(e.target.value)} placeholder="Paste the specific standards for this unit..."
              rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prior Knowledge Required:</label>
            <textarea value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)} placeholder="What should students already know?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Goals:</label>
            <textarea value={endGoals} onChange={(e) => setEndGoals(e.target.value)} placeholder="What should students be able to do by the end?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Dates:</label>
            <input type="text" value={assessmentDates} onChange={(e) => setAssessmentDates(e.target.value)} placeholder="e.g., Quiz on Day 5, Unit Test on Day 15"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
          </div>

          <button onClick={handleGenerate} disabled={generating || !unitTopic}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Pacing Guide</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedGuide && (
              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export .docx'}
                </button>
              </div>
            )}
          </div>

          {generatedGuide ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedGuide}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-400">Your generated pacing guide will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}