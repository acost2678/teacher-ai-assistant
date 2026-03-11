'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_LEVELS = ['Pre-K','Kindergarten','1st Grade','2nd Grade','3rd Grade',
  '4th Grade','5th Grade','6th Grade','7th Grade','8th Grade',
  '9th Grade','10th Grade','11th Grade','12th Grade']

const CHECKIN_TYPES = ['Daily Morning','End of Day','After Recess/Break',
  'Before Test/Assessment','Monday Reset','Friday Reflection','After Conflict']

const CASEL_COMPETENCIES = ['Self-Awareness','Self-Management','Social Awareness',
  'Relationship Skills','Responsible Decision-Making','Mixed/All Competencies']

const FORMATS = ['Written Response','Rating Scale','Emoji/Visual Selection',
  'Choice Board','Think-Pair-Share','Journal Prompt','Discussion Circle']

const DURATIONS = ['2-3 minutes','5 minutes','10 minutes','15 minutes']

const ZONES = [
  { id: 'blue',   label: 'Blue Zone',   desc: 'Sad, sick, tired, bored',         color: 'bg-blue-100 text-blue-700 border-blue-300'   },
  { id: 'green',  label: 'Green Zone',  desc: 'Happy, calm, focused, ready',      color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'yellow', label: 'Yellow Zone', desc: 'Worried, excited, silly, confused', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'red',    label: 'Red Zone',    desc: 'Angry, terrified, out of control',  color: 'bg-red-100 text-red-700 border-red-300'     },
]

const MOOD_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Great' }
const MOOD_EMOJI  = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' }

const TIER_COLORS = {
  1: 'bg-green-100 text-green-700 border-green-300',
  2: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  3: 'bg-red-100 text-red-700 border-red-300',
}
const TIER_LABELS = { 1: 'Tier 1', 2: 'Tier 2 — Review', 3: 'Tier 3 — Urgent' }

// ─── Component ────────────────────────────────────────────────────────────────

export default function SELCheckInPage() {
  const router = useRouter()

  // Auth
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Tab
  const [activeTab, setActiveTab] = useState('generator') // 'generator' | 'earlywarning'

  // ── Generator tab state ──────────────────────────────────────────────────
  const [gradeLevel,      setGradeLevel]      = useState('3rd Grade')
  const [checkInType,     setCheckInType]     = useState('Daily Morning')
  const [selCompetency,   setSelCompetency]   = useState('Self-Awareness')
  const [format,          setFormat]          = useState('Written Response')
  const [duration,        setDuration]        = useState('5 minutes')
  const [includeVisuals,  setIncludeVisuals]  = useState(true)
  const [includeFollowUp, setIncludeFollowUp] = useState(true)
  const [quantity,        setQuantity]        = useState('5')
  const [zonesEnabled,    setZonesEnabled]    = useState(true)
  const [generating,      setGenerating]      = useState(false)
  const [exporting,       setExporting]       = useState(false)
  const [generatedCheckIns, setGeneratedCheckIns] = useState('')
  const [copied,  setCopied]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const outputRef = useRef(null)

  // ── Early Warning demo ───────────────────────────────────────────────────
  const [showEWDemo, setShowEWDemo] = useState(false)

  const handleShowEWDemo = () => {
    setClassLabel('Demo Class')
    setStudentCount(20)
    setShowEWDemo(true)
    const demoInput = {}
    const zones = ['Green Zone','Green Zone','Yellow Zone','Yellow Zone','Blue Zone','Red Zone']
    const moods  = [5,5,4,4,4,3,3,3,3,2,2,2,2,1,1,4,3,2,1,1]
    const notes  = {
      'Student 06': 'Seems tired today',
      'Student 10': 'Said nothing is going right',
      'Student 14': 'Very quiet, did not want to participate',
      'Student 19': 'Has been low all week',
      'Student 20': 'Mentioned feeling alone',
    }
    Array.from({ length: 20 }, (_, i) => `Student ${String(i+1).padStart(2,'0')}`).forEach((p, i) => {
      demoInput[p] = {
        moodScore:    moods[i],
        zone:         zones[i % zones.length],
        responseText: notes[p] || '',
      }
    })
    setResponseInput(demoInput)
    // Build demo historical data for dashboard
    const demoHistory = Array.from({ length: 20 }, (_, i) => {
      const mood = moods[i]
      return {
        user_id:             'demo',
        student_placeholder: `Student ${String(i+1).padStart(2,'0')}`,
        class_label:         'Demo Class',
        avg_mood_score:      mood,
        total_checkins:      Math.floor(Math.random() * 8) + 3,
        lowest_mood:         Math.max(1, mood - 1),
        highest_mood:        Math.min(5, mood + 1),
        low_mood_count:      mood <= 2 ? Math.floor(Math.random() * 4) + 1 : 0,
        tier2_flag_count:    mood <= 2 ? 2 : 0,
        crisis_flag_count:   0,
        low_mood_last_7_days: mood <= 2 ? Math.floor(Math.random() * 4) + 2 : 0,
        last_checkin_date:   new Date().toISOString().split('T')[0],
      }
    })
    setHistoricalData(demoHistory)
    setActiveWarningView('dashboard')
  }

  const handleResetEWDemo = () => {
    setShowEWDemo(false)
    setClassLabel('')
    setResponseInput({})
    setHistoricalData(null)
    setTrends(null)
    setReferralNote('')
    setSelectedStudent(null)
    setActiveWarningView('entry')
  }

  // ── Early Warning tab state ──────────────────────────────────────────────
  const [classLabel,         setClassLabel]         = useState('')
  const [studentCount,       setStudentCount]       = useState(20)
  const [responses,          setResponses]          = useState([]) // array of {placeholder, moodScore, zone, responseText}
  const [responseInput,      setResponseInput]      = useState({}) // keyed by placeholder
  const [trends,             setTrends]             = useState(null)
  const [analyzingTrends,    setAnalyzingTrends]    = useState(false)
  const [savingResponses,    setSavingResponses]    = useState(false)
  const [referralNote,       setReferralNote]       = useState('')
  const [generatingReferral, setGeneratingReferral] = useState(false)
  const [selectedStudent,    setSelectedStudent]    = useState(null)
  const [historicalData,     setHistoricalData]     = useState(null)
  const [loadingHistory,     setLoadingHistory]     = useState(false)
  const [activeWarningView,  setActiveWarningView]  = useState('entry') // 'entry' | 'dashboard' | 'referral'

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else router.push('/auth/login')
    }
    checkSession()
  }, [router])

  // ── Build placeholder list ────────────────────────────────────────────────
  const placeholders = Array.from({ length: studentCount }, (_, i) =>
    `Student ${String(i + 1).padStart(2, '0')}`)

  // ── Generator handlers ────────────────────────────────────────────────────
  const handleShowDemo = () => {
    setGradeLevel('4th Grade'); setCheckInType('Daily Morning')
    setSelCompetency('Self-Awareness'); setFormat('Choice Board')
    setDuration('5 minutes'); setIncludeVisuals(true)
    setIncludeFollowUp(true); setQuantity('5'); setZonesEnabled(true)
    setShowDemo(true); setGeneratedCheckIns('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade'); setCheckInType('Daily Morning')
    setSelCompetency('Self-Awareness'); setFormat('Written Response')
    setDuration('5 minutes'); setIncludeVisuals(true)
    setIncludeFollowUp(true); setQuantity('5'); setZonesEnabled(true)
    setShowDemo(false); setGeneratedCheckIns('')
  }

  const handleGenerate = async () => {
    setGenerating(true); setGeneratedCheckIns(''); setSaved(false)
    try {
      const res  = await fetch('/api/generate-sel-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, checkInType, selCompetency, format, duration,
          includeVisuals, includeFollowUp, quantity, zonesEnabled,
        }),
      })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error) }
      else {
        setGeneratedCheckIns(data.checkIns)
        await handleSave(data.checkIns)
        outputRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch { alert('Error generating SEL check-ins. Please try again.') }
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
          title: `SEL Check-Ins: ${selCompetency}`,
          toolType: 'sel-checkin', toolName: 'SEL Check-In', content,
          metadata: { gradeLevel, checkInType, selCompetency, format, quantity },
        }),
      })
      setSaved(true)
    } catch (err) { console.error('Save error:', err) }
  }

  const handleExportDocx = async () => {
    if (!generatedCheckIns) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `SEL Check-Ins - ${selCompetency}`,
          content: generatedCheckIns, toolName: 'SEL Check-In',
        }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url  = window.URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `SEL_CheckIns_${selCompetency.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCheckIns)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── Early Warning: save batch responses ──────────────────────────────────
  const handleSaveResponses = async () => {
    if (!classLabel.trim()) { alert('Please enter a class label first.'); return }
    const entries = placeholders.map(p => ({
      user_id:            user.id,
      student_placeholder: p,
      class_label:        classLabel,
      grade_level:        gradeLevel,
      casel_competency:   selCompetency,
      checkin_type:       checkInType,
      zone_of_regulation: responseInput[p]?.zone || null,
      mood_score:         responseInput[p]?.moodScore || null,
      response_text:      responseInput[p]?.responseText || null,
      format_used:        format,
      checkin_date:       new Date().toISOString().split('T')[0],
    })).filter(e => e.mood_score !== null)

    if (entries.length === 0) { alert('Please enter at least one student response.'); return }

    setSavingResponses(true)
    try {
      const { error } = await supabase.from('sel_checkin_responses').insert(entries)
      if (error) throw error
      alert(`✅ ${entries.length} responses saved successfully.`)
      setResponseInput({})
    } catch (err) {
      console.error('Save responses error:', err)
      alert('Error saving responses. Please try again.')
    }
    setSavingResponses(false)
  }

  // ── Early Warning: load trends ────────────────────────────────────────────
  const handleLoadTrends = async () => {
    if (!classLabel.trim()) { alert('Please enter a class label to load trends.'); return }
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('sel_student_trends')
        .select('*')
        .eq('user_id', user.id)
        .eq('class_label', classLabel)
        .order('avg_mood_score', { ascending: true })

      if (error) throw error
      setHistoricalData(data)
      setActiveWarningView('dashboard')
    } catch (err) {
      console.error('Load trends error:', err)
      alert('Error loading trend data.')
    }
    setLoadingHistory(false)
  }

  // ── Early Warning: analyze & flag ─────────────────────────────────────────
  const handleAnalyzeTrends = async () => {
    if (!historicalData || historicalData.length === 0) {
      alert('Load class trends first.'); return
    }
    setAnalyzingTrends(true)
    try {
      const res  = await fetch('/api/sel-early-warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:      'analyze',
          classLabel,
          gradeLevel,
          trendData:   historicalData,
        }),
      })
      const data = await res.json()
      if (data.error) { alert(data.error); return }
      setTrends(data)
    } catch { alert('Error analyzing trends.') }
    setAnalyzingTrends(false)
  }

  // ── Early Warning: generate referral note ────────────────────────────────
  const handleGenerateReferral = async (student) => {
    setSelectedStudent(student)
    setGeneratingReferral(true)
    setActiveWarningView('referral')
    try {
      // Pull last 10 check-ins for this student
      const { data: history } = await supabase
        .from('sel_checkin_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('student_placeholder', student.student_placeholder)
        .eq('class_label', classLabel)
        .order('checkin_date', { ascending: false })
        .limit(10)

      const res  = await fetch('/api/sel-early-warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:      'referral',
          student,
          history:     history || [],
          gradeLevel,
          classLabel,
        }),
      })
      const data = await res.json()
      if (data.error) { alert(data.error); return }
      setReferralNote(data.referralNote)
    } catch { alert('Error generating referral note.') }
    setGeneratingReferral(false)
  }

  const handleMarkReviewed = async (studentPlaceholder) => {
    await supabase
      .from('sel_checkin_responses')
      .update({ reviewed: true })
      .eq('user_id', user.id)
      .eq('student_placeholder', studentPlaceholder)
      .eq('class_label', classLabel)
    setHistoricalData(prev =>
      prev.map(s => s.student_placeholder === studentPlaceholder
        ? { ...s, reviewed: true } : s))
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">SEL Check-In & Early Warning</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Title */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">💚</span>
            <h1 className="text-2xl font-semibold text-gray-800">SEL Check-In & Early Warning</h1>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">CASEL ALIGNED</span>
          </div>
          <p className="text-gray-500 text-sm">Generate check-in prompts, track anonymized student responses, and get AI-powered Tier 2 flags and counselor referral notes — all FERPA compliant.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('generator')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'generator' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
            💚 Check-In Generator
          </button>
          <button onClick={() => setActiveTab('earlywarning')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'earlywarning' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
            🚨 Early Warning System
          </button>
        </div>

        {/* ════════════════════════════════════════════
            GENERATOR TAB
        ════════════════════════════════════════════ */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* Demo controls */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">Configure your check-in below, then generate.</p>
                <div className="flex gap-2">
                  {showDemo
                    ? <button onClick={handleResetDemo} className="text-sm text-gray-500 hover:text-gray-700 font-medium">↺ Reset</button>
                    : <button onClick={handleShowDemo} className="text-sm text-purple-600 hover:text-purple-700 font-medium">✨ See Demo</button>
                  }
                </div>
              </div>

              {/* Settings grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: 'Grade Level',              value: gradeLevel,    setter: setGradeLevel,    opts: GRADE_LEVELS },
                  { label: 'Check-In Type',            value: checkInType,   setter: setCheckInType,   opts: CHECKIN_TYPES },
                  { label: 'CASEL Competency Focus',   value: selCompetency, setter: setSelCompetency, opts: CASEL_COMPETENCIES },
                  { label: 'Format',                   value: format,        setter: setFormat,        opts: FORMATS },
                  { label: 'Duration',                 value: duration,      setter: setDuration,      opts: DURATIONS },
                  { label: 'How Many',                 value: quantity,      setter: setQuantity,      opts: ['1','3','5','10'], labels: ['1 check-in','3 check-ins','5 check-ins','10 check-ins'] },
                ].map(({ label, value, setter, opts, labels }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <select value={value} onChange={e => setter(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      {opts.map((o, i) => <option key={o} value={o}>{labels ? labels[i] : o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 mb-6">
                {[
                  { state: includeVisuals,  setter: setIncludeVisuals,  label: 'Include visual supports',    desc: 'Emoji suggestions, feeling charts, or visual scales' },
                  { state: includeFollowUp, setter: setIncludeFollowUp, label: 'Include follow-up prompts',  desc: 'Questions to dig deeper based on student responses' },
                  { state: zonesEnabled,    setter: setZonesEnabled,    label: 'Zones of Regulation aligned', desc: 'Frame prompts using Blue / Green / Yellow / Red zone language' },
                ].map(({ state, setter, label, desc }) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={state} onChange={e => setter(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                    <div>
                      <span className="text-gray-700 font-medium text-sm">{label}</span>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button onClick={handleGenerate} disabled={generating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                {generating ? <><span className="animate-spin">⏳</span>Generating...</> : <><span>✨</span>Generate Check-Ins</>}
              </button>
            </div>

            {/* Output */}
            <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Generated Check-Ins</h2>
                  {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                </div>
                {generatedCheckIns && (
                  <div className="flex items-center gap-3">
                    <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                    <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                      {exporting ? 'Exporting...' : '📄 Export .docx'}
                    </button>
                  </div>
                )}
              </div>
              {generatedCheckIns ? (
                <div className="bg-gray-50 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedCheckIns}</pre>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-3">💭</div>
                    <p className="text-gray-400">Your generated check-ins will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            EARLY WARNING TAB
        ════════════════════════════════════════════ */}
        {activeTab === 'earlywarning' && (
          <div className="space-y-6">

            {/* Demo button */}
            <div className="flex justify-end">
              {!showEWDemo
                ? <button onClick={handleShowEWDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                    <span>✨</span> See Demo
                  </button>
                : <button onClick={handleResetEWDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    <span>↺</span> Reset Demo
                  </button>
              }
            </div>

            {/* Demo banner */}
            {showEWDemo && (
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-purple-500 text-xl">✨</span>
                  <div>
                    <h3 className="text-purple-700 font-medium text-sm">Demo Mode Active</h3>
                    <p className="text-purple-600 text-xs mt-0.5">We've pre-filled 20 students with a mix of mood scores including Tier 1, Tier 2, and Tier 3 examples. Click <strong>"Run Early Warning"</strong> on the dashboard to see the AI analysis in action. This data is not saved to your account.</p>
                  </div>
                </div>
              </div>
            )}

            {/* FERPA notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-blue-600 text-xl">🔒</span>
              <div>
                <p className="text-blue-800 font-medium text-sm">FERPA Compliant</p>
                <p className="text-blue-700 text-xs">No real student names are stored. All responses are tracked using anonymous placeholders (Student 01, Student 02, etc.) tied only to your account.</p>
              </div>
            </div>

            {/* Sub-nav */}
            <div className="flex gap-2">
              {[
                { id: 'entry',     label: '📝 Enter Responses' },
                { id: 'dashboard', label: '📊 Class Dashboard'  },
                { id: 'referral',  label: '📋 Referral Notes'   },
              ].map(v => (
                <button key={v.id} onClick={() => setActiveWarningView(v.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${activeWarningView === v.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* ── ENTRY VIEW ── */}
            {activeWarningView === 'entry' && (
              <div className="space-y-5">

                {/* Class setup */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-4">Class Setup</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Class Label</label>
                      <input value={classLabel} onChange={e => setClassLabel(e.target.value)}
                        placeholder="e.g., Period 3, Blue Group, Homeroom..."
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Number of Students</label>
                      <input type="number" min={1} max={40} value={studentCount} onChange={e => setStudentCount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Response entry grid */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Today's Responses</h2>
                      <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {placeholders.map(p => {
                      const resp = responseInput[p] || {}
                      return (
                        <div key={p} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="col-span-2">
                            <span className="text-xs font-semibold text-gray-600">{p}</span>
                          </div>

                          {/* Mood score */}
                          <div className="col-span-4 flex gap-1">
                            {[1,2,3,4,5].map(score => (
                              <button key={score}
                                onClick={() => setResponseInput(prev => ({ ...prev, [p]: { ...prev[p], moodScore: score }}))}
                                className={`flex-1 py-1.5 rounded-lg text-sm transition-all border ${resp.moodScore === score ? 'bg-purple-100 border-purple-400 text-purple-700 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'}`}
                                title={MOOD_LABELS[score]}>
                                {MOOD_EMOJI[score]}
                              </button>
                            ))}
                          </div>

                          {/* Zone */}
                          <div className="col-span-3">
                            <select value={resp.zone || ''} onChange={e => setResponseInput(prev => ({ ...prev, [p]: { ...prev[p], zone: e.target.value }}))}
                              className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700">
                              <option value="">Zone...</option>
                              {ZONES.map(z => <option key={z.id} value={z.label}>{z.label}</option>)}
                            </select>
                          </div>

                          {/* Optional note */}
                          <div className="col-span-3">
                            <input value={resp.responseText || ''} onChange={e => setResponseInput(prev => ({ ...prev, [p]: { ...prev[p], responseText: e.target.value }}))}
                              placeholder="Note..."
                              className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700" />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <button onClick={handleSaveResponses} disabled={savingResponses}
                    className="w-full mt-5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                    {savingResponses ? <><span className="animate-spin">⏳</span>Saving...</> : <><span>💾</span>Save Today's Responses</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── DASHBOARD VIEW ── */}
            {activeWarningView === 'dashboard' && (
              <div className="space-y-5">

                {/* Load controls */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-4">Class Trend Dashboard</h2>
                  <div className="flex gap-3">
                    <input value={classLabel} onChange={e => setClassLabel(e.target.value)}
                      placeholder="Enter class label to load..."
                      className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700" />
                    <button onClick={handleLoadTrends} disabled={loadingHistory}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm font-medium rounded-xl transition-colors">
                      {loadingHistory ? '⏳ Loading...' : '📊 Load Trends'}
                    </button>
                    {historicalData && (
                      <button onClick={handleAnalyzeTrends} disabled={analyzingTrends}
                        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-xl transition-colors">
                        {analyzingTrends ? '⏳ Analyzing...' : '🚨 Run Early Warning'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Student trend cards */}
                {historicalData && historicalData.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">
                        {classLabel} — {historicalData.length} Students
                      </h3>
                      {trends && (
                        <div className="flex gap-2 text-xs">
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            🚨 {trends.tier3Count || 0} Urgent
                          </span>
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                            ⚠️ {trends.tier2Count || 0} Review
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {historicalData.map(student => {
                        const aiFlag = trends?.flags?.find(f => f.placeholder === student.student_placeholder)
                        const tierLevel = aiFlag?.tier || (student.avg_mood_score <= 2 ? 2 : 1)
                        const isCrisis  = aiFlag?.crisisFlag || student.crisis_flag_count > 0

                        return (
                          <div key={student.student_placeholder}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 ${isCrisis ? 'border-red-300 bg-red-50' : tierLevel >= 2 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-gray-700 text-sm w-24">{student.student_placeholder}</span>

                              {/* Mood bar */}
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <div key={s} className={`w-5 h-5 rounded-md ${s <= Math.round(student.avg_mood_score) ? 'bg-purple-400' : 'bg-gray-200'}`} />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">{student.avg_mood_score}/5</span>
                              </div>

                              <div className="text-xs text-gray-500">
                                {student.total_checkins} check-in{student.total_checkins !== 1 ? 's' : ''}
                                {student.low_mood_last_7_days > 0 && (
                                  <span className="ml-2 text-orange-600 font-medium">⚠️ {student.low_mood_last_7_days} low days (7d)</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCrisis && (
                                <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded-full font-bold">🚨 Crisis Flag</span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${TIER_COLORS[tierLevel]}`}>
                                {TIER_LABELS[tierLevel]}
                              </span>
                              {tierLevel >= 2 && (
                                <button onClick={() => handleGenerateReferral(student)}
                                  className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                                  📋 Referral Note
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* AI analysis summary */}
                {trends?.summary && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">🧠 AI Pattern Analysis</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{trends.summary}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── REFERRAL VIEW ── */}
            {activeWarningView === 'referral' && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Counselor Referral Note</h2>
                      {selectedStudent && (
                        <p className="text-xs text-gray-500">{selectedStudent.student_placeholder} · {classLabel}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {referralNote && (
                        <>
                          <button onClick={() => navigator.clipboard.writeText(referralNote).then(() => alert('Copied!'))}
                            className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium">
                            📋 Copy
                          </button>
                          <button onClick={async () => {
                            const res = await fetch('/api/export-docx', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title: `SEL Referral Note — ${selectedStudent?.student_placeholder}`, content: referralNote, toolName: 'SEL Early Warning' }),
                            })
                            if (res.ok) {
                              const blob = await res.blob()
                              const url  = window.URL.createObjectURL(blob)
                              const a    = document.createElement('a')
                              a.href = url; a.download = `SEL_Referral_${selectedStudent?.student_placeholder?.replace(' ','_')}.docx`
                              document.body.appendChild(a); a.click(); document.body.removeChild(a)
                            }
                          }} className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                            📄 Export .docx
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Crisis guardrail */}
                  {selectedStudent?.crisis_flag_count > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-red-600 text-xl">🚨</span>
                        <div>
                          <p className="text-red-800 font-semibold text-sm">Crisis Language Detected</p>
                          <p className="text-red-700 text-xs mt-1">This student's check-in responses have flagged potential crisis-level language. <strong>Do not rely on this AI-generated note as your primary response.</strong> Follow your school or district crisis protocol immediately and contact appropriate support personnel.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {generatingReferral ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <span className="text-3xl animate-spin block mb-3">⏳</span>
                        <p className="text-gray-500 text-sm">Generating referral note...</p>
                      </div>
                    </div>
                  ) : referralNote ? (
                    <textarea value={referralNote} onChange={e => setReferralNote(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 resize-none text-sm leading-relaxed"
                      style={{ minHeight: '400px' }} />
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-gray-400 text-sm">Select a Tier 2 or Tier 3 student from the dashboard to generate a referral note</p>
                      <button onClick={() => setActiveWarningView('dashboard')} className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium">
                        ← Back to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}