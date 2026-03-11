'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function BehaviorPlanPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Core fields
  const [gradeLevel, setGradeLevel] = useState('3rd-5th Grade')
  const [tierLevel, setTierLevel] = useState('1')
  const [behaviorConcern, setBehaviorConcern] = useState('')
  const [behaviorContext, setBehaviorContext] = useState('')
  const [previousStrategies, setPreviousStrategies] = useState('')
  const [studentStrengths, setStudentStrengths] = useState('')

  // NEW: ABC Analysis fields
  const [antecedents, setAntecedents] = useState('')
  const [consequences, setConsequences] = useState('')
  const [settingEvents, setSettingEvents] = useState('')

  // NEW: Function of behavior
  const [functionOfBehavior, setFunctionOfBehavior] = useState('')

  // NEW: Replacement behavior
  const [replacementBehaviorIdea, setReplacementBehaviorIdea] = useState('')

  // Include options
  const [includeDataCollection, setIncludeDataCollection] = useState(true)
  const [includeParentCommunication, setIncludeParentCommunication] = useState(true)
  const [includeReinforcementMenu, setIncludeReinforcementMenu] = useState(true)

  const [generatedPlan, setGeneratedPlan] = useState('')
  const [editedPlan, setEditedPlan] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState('input')
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

  const functionOptions = [
    { id: 'escape-task', label: 'Escape / Avoid — Task or academic demand' },
    { id: 'escape-social', label: 'Escape / Avoid — Social situation or person' },
    { id: 'escape-sensory', label: 'Escape / Avoid — Sensory input' },
    { id: 'attention-adult', label: 'Obtain Attention — From adult' },
    { id: 'attention-peer', label: 'Obtain Attention — From peers' },
    { id: 'tangible', label: 'Obtain Tangible — Item or preferred activity' },
    { id: 'sensory', label: 'Sensory / Automatic — Self-regulation or stimulation' },
    { id: 'control', label: 'Control / Power — Over environment or situation' },
  ]

  const handleShowDemo = () => {
    setGradeLevel('3rd-5th Grade')
    setTierLevel('2')
    setBehaviorConcern('Student leaves seat without permission during independent work time, approximately 5-8 times per class period. Often walks around the room, sharpens pencil repeatedly, or visits other students\' desks.')
    setBehaviorContext('Occurs most frequently during independent math work and writing tasks. Less frequent during hands-on activities or group work. Usually starts about 10 minutes into work time.')
    setAntecedents('Independent work tasks (especially writing and multi-step math), transitions to independent work, longer assignments without embedded breaks')
    setConsequences('Teacher redirects verbally — student gets adult attention. Sometimes sent back to seat with reduced work. Peers laugh or engage.')
    setFunctionOfBehavior('escape-task')
    setSettingEvents('More frequent on days with poor sleep, Mondays after weekends, after missed lunch')
    setReplacementBehaviorIdea('Request a movement break using a break card, or use a "I need help" signal')
    setPreviousStrategies('Verbal reminders, moved seat closer to teacher, offered fidget tool, called parent once')
    setStudentStrengths('Good at math facts, loves to help others, responds well to one-on-one attention, enjoys being a classroom helper, likes earning privileges')
    setIncludeDataCollection(true)
    setIncludeParentCommunication(true)
    setIncludeReinforcementMenu(true)
    setShowDemo(true)
    setGeneratedPlan('')
    setEditedPlan('')
    setActiveTab('input')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd-5th Grade')
    setTierLevel('1')
    setBehaviorConcern('')
    setBehaviorContext('')
    setAntecedents('')
    setConsequences('')
    setFunctionOfBehavior('')
    setSettingEvents('')
    setReplacementBehaviorIdea('')
    setPreviousStrategies('')
    setStudentStrengths('')
    setIncludeDataCollection(true)
    setIncludeParentCommunication(true)
    setIncludeReinforcementMenu(true)
    setShowDemo(false)
    setGeneratedPlan('')
    setEditedPlan('')
    setActiveTab('input')
  }

  const handleGenerate = async () => {
    if (!behaviorConcern.trim()) {
      alert('Please describe the behavior concern')
      return
    }

    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-behavior-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          tierLevel,
          behaviorConcern,
          behaviorContext,
          antecedents,
          consequences,
          functionOfBehavior: functionOptions.find(f => f.id === functionOfBehavior)?.label || functionOfBehavior,
          replacementBehaviorIdea,
          settingEvents,
          previousStrategies,
          studentStrengths,
          includeDataCollection,
          includeParentCommunication,
          includeReinforcementMenu,
        }),
      })
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedPlan(data.behaviorPlan)
        setEditedPlan(data.behaviorPlan)
        await handleSave(data.behaviorPlan)
        setActiveTab('output')
      }
    } catch (error) {
      alert('Error generating plan. Please try again.')
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
          title: `Behavior Plan: ${behaviorConcern.substring(0, 40)}...`,
          toolType: 'behavior-plan',
          toolName: 'Behavior Plan',
          content,
          metadata: { gradeLevel, tierLevel, functionOfBehavior },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!editedPlan) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Positive Behavior Support Plan',
          content: editedPlan,
          toolName: 'Behavior Plan'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Behavior_Support_Plan.docx'
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
    navigator.clipboard.writeText(editedPlan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tierColors = {
    '1': 'bg-green-100 text-green-800 border-green-300',
    '2': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    '3': 'bg-red-100 text-red-800 border-red-300',
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
              <span className="text-gray-300">›</span>
              <span className="text-gray-800 font-medium">Behavior Plan</span>
            </div>
            <div className="flex gap-2">
              {!showDemo ? (
                <button onClick={handleShowDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  <span>✨</span> See Demo
                </button>
              ) : (
                <button onClick={handleResetDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <span>↺</span> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">💚</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Positive Behavior Support Plan</h1>
              <p className="text-gray-500 text-sm mt-1">PBIS-aligned, function-based behavior plans with ABC analysis, replacement behavior teaching, and data collection tools.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-green-600">🔒</span>
              <div>
                <p className="text-green-800 font-medium text-sm">Privacy-First</p>
                <p className="text-green-700 text-xs">Uses [Student Name] placeholders — FERPA compliant</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-blue-600">🔬</span>
              <div>
                <p className="text-blue-800 font-medium text-sm">Function-Based</p>
                <p className="text-blue-700 text-xs">ABC analysis drives every recommendation</p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-purple-600">📊</span>
              <div>
                <p className="text-purple-800 font-medium text-sm">PBIS Framework</p>
                <p className="text-purple-700 text-xs">Tiered supports with built-in progress monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}
          >
            1. Plan Details
          </button>
          <button
            onClick={() => setActiveTab('output')}
            disabled={!generatedPlan}
            className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-40'}`}
          >
            2. Generated Plan
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">

            {/* Tier + Grade */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student & Support Level</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="Pre-K/K">Pre-K / Kindergarten</option>
                    <option value="1st-2nd Grade">1st–2nd Grade</option>
                    <option value="3rd-5th Grade">3rd–5th Grade</option>
                    <option value="6th-8th Grade">6th–8th Grade</option>
                    <option value="9th-12th Grade">9th–12th Grade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MTSS Tier Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1', label: 'Tier 1', desc: 'Universal' },
                      { id: '2', label: 'Tier 2', desc: 'Targeted' },
                      { id: '3', label: 'Tier 3', desc: 'Intensive' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTierLevel(t.id)}
                        className={`py-3 px-3 rounded-xl border-2 transition-all text-center ${tierLevel === t.id ? tierColors[t.id] + ' border-current font-semibold' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className="text-xs opacity-70">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Behavior Concern <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-2">— observable & measurable</span>
                </label>
                <textarea value={behaviorConcern} onChange={(e) => setBehaviorConcern(e.target.value)}
                  rows={3}
                  placeholder="Describe the specific behavior you're seeing. Be observable and measurable. e.g., 'Student leaves seat without permission during independent work time, approximately 5–8 times per period.'"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
              </div>
            </div>

            {/* ABC Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-gray-800">🔬 ABC Analysis</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Drives function hypothesis</span>
              </div>
              <p className="text-gray-500 text-sm mb-4">The more detail here, the more accurate and targeted the plan.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    A — Antecedents / Triggers
                    <span className="text-gray-400 font-normal ml-2">What happens immediately before?</span>
                  </label>
                  <textarea value={antecedents} onChange={(e) => setAntecedents(e.target.value)}
                    rows={2}
                    placeholder="e.g., Independent writing tasks, transitions to seat work, multi-step instructions, peer proximity during group work..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    B — When/Where It Occurs
                    <span className="text-gray-400 font-normal ml-2">Settings, times, patterns</span>
                  </label>
                  <textarea value={behaviorContext} onChange={(e) => setBehaviorContext(e.target.value)}
                    rows={2}
                    placeholder="e.g., Occurs most during independent math and writing. Less frequent during hands-on or group activities. Peaks around 10–15 min into work time..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    C — Consequences / What Happens After
                    <span className="text-gray-400 font-normal ml-2">What does the student gain or avoid?</span>
                  </label>
                  <textarea value={consequences} onChange={(e) => setConsequences(e.target.value)}
                    rows={2}
                    placeholder="e.g., Teacher redirects verbally (attention), student is sent back with reduced work (escape), peers laugh and engage (peer attention)..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setting Events / Slow Triggers
                    <span className="text-gray-400 font-normal ml-2">Conditions that increase likelihood</span>
                  </label>
                  <textarea value={settingEvents} onChange={(e) => setSettingEvents(e.target.value)}
                    rows={2}
                    placeholder="e.g., Poor sleep, missed breakfast, conflict at home, illness, medication changes, high-stimulation morning..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>
              </div>
            </div>

            {/* Function of Behavior */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">🎯 Function of Behavior</h2>
              <p className="text-gray-500 text-sm mb-4">What need is this behavior meeting? Select the best fit based on your ABC data.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {functionOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFunctionOfBehavior(opt.id)}
                    className={`text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                      functionOfBehavior === opt.id
                        ? 'bg-purple-50 border-purple-400 text-purple-800 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Replacement Behavior + Strengths */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">✅ Replacement & Strengths</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Replacement Behavior Idea
                    <span className="text-gray-400 font-normal ml-2">— must serve same function</span>
                  </label>
                  <input type="text" value={replacementBehaviorIdea} onChange={(e) => setReplacementBehaviorIdea(e.target.value)}
                    placeholder="e.g., Request a break using break card, use 'I need help' signal, ask for a movement pass..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Strengths & Motivators</label>
                  <textarea value={studentStrengths} onChange={(e) => setStudentStrengths(e.target.value)}
                    rows={2}
                    placeholder="e.g., Loves helping, responds to humor, good at math, enjoys technology, motivated by being a helper..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previously Tried</label>
                  <textarea value={previousStrategies} onChange={(e) => setPreviousStrategies(e.target.value)}
                    rows={2}
                    placeholder="e.g., Verbal reminders (no effect), proximity (minimal), fidget tool (somewhat helpful), seat change (no change)..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                </div>
              </div>
            </div>

            {/* Include options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Include in Plan</h2>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeDataCollection} onChange={(e) => setIncludeDataCollection(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-700">📊 Data Collection Sheet (ABC + Frequency)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeReinforcementMenu} onChange={(e) => setIncludeReinforcementMenu(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-700">🎁 Reinforcement Menu</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeParentCommunication} onChange={(e) => setIncludeParentCommunication(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-700">👨‍👩‍👧 Parent Communication Template</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !behaviorConcern.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base"
            >
              {generating ? (
                <><span className="animate-spin">⏳</span> Generating Plan...</>
              ) : (
                <><span>💚</span> Generate Behavior Support Plan</>
              )}
            </button>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedPlan && (
          <div className="space-y-6" ref={outputRef}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Plan</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-sm">Review and edit below. Replace [Student Name] in your secure system.</p>
                    {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Saved</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm">
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm">
                    {exporting ? 'Exporting...' : '📄 Export .docx'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <textarea
                value={editedPlan}
                onChange={(e) => setEditedPlan(e.target.value)}
                rows={50}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">⚠️</span>
                <div>
                  <h3 className="text-amber-800 font-medium">Before Implementing</h3>
                  <p className="text-amber-700 text-sm mt-1">Train all staff on procedures. Set up data collection system. Share with family. Schedule 4–6 week review. For Tier 3 students, route through your student support team before implementation.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              ← Back to Edit Details
            </button>
          </div>
        )}
      </main>
    </div>
  )
}