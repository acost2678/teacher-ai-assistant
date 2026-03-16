'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import GoogleDriveButton from '../../../components/GoogleDriveButton'

const CATEGORIES = [
  'SEL & Student Support',
  'Classroom Management',
  'Instructional Strategies',
  'Special Education & IEPs',
  'Data & Assessment',
  'Trauma-Informed Practices',
]

const AUDIENCES = [
  'All School Staff',
  'Teachers',
  'Administrators',
  'Paraprofessionals',
  'Counselors & Support Staff',
  'New Staff / Onboarding',
]

const DURATIONS = [
  '30 minutes',
  '45 minutes',
  '1 hour',
  '90 minutes',
  'Half day',
]

const DEMO = {
  title: 'Building Trauma-Informed Classrooms',
  category: 'Trauma-Informed Practices',
  audience: 'Teachers',
  duration: '1 hour',
  objectives: 'Participants will identify the impact of ACEs on student learning and behavior. Participants will apply at least 3 trauma-informed classroom strategies. Participants will develop a personal action plan for implementation.',
  outputMode: 'quick',
}

export default function PDGeneratorPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('SEL & Student Support')
  const [audience, setAudience] = useState('All School Staff')
  const [duration, setDuration] = useState('1 hour')
  const [objectives, setObjectives] = useState('')
  const [outputMode, setOutputMode] = useState('quick')

  const [slideData, setSlideData] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [saved, setSaved] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

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
    setTitle(DEMO.title)
    setCategory(DEMO.category)
    setAudience(DEMO.audience)
    setDuration(DEMO.duration)
    setObjectives(DEMO.objectives)
    setOutputMode(DEMO.outputMode)
    setShowDemo(true)
    setSlideData(null)
  }

  const handleResetDemo = () => {
    setTitle('')
    setCategory('SEL & Student Support')
    setAudience('All School Staff')
    setDuration('1 hour')
    setObjectives('')
    setOutputMode('quick')
    setShowDemo(false)
    setSlideData(null)
  }

  const handleGenerate = async () => {
    if (!title) return alert('Please enter a PD title')
    setGenerating(true)
    setSlideData(null)
    setSaved(false)
    setActiveSlide(0)

    try {
      const res = await fetch('/api/generate-pd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, title, category, audience, duration, objectives, outputMode }),
      })
      const data = await res.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setSlideData(data.slideData)
        setSaved(true)
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (err) {
      alert('Failed to generate. Please try again.')
    }
    setGenerating(false)
  }

  const handleExportPptx = async () => {
    if (!slideData) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-pd-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideData }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${slideData.title.replace(/[^a-z0-9]/gi, '_')}.pptx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Export failed. Please try again.')
      }
    } catch (err) {
      alert('Export failed.')
    }
    setExporting(false)
  }

  const getSlidePreviewContent = (slide) => {
    if (!slide) return null
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col justify-center h-full bg-gradient-to-br from-[#1B3A6B] to-[#0D7377] rounded-xl p-6 text-white">
            {slideData?.category && (
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider">
                {slideData.category}
              </span>
            )}
            <h2 className="text-2xl font-bold leading-tight mb-2">{slide.title}</h2>
            {slide.subtitle && <p className="text-base opacity-80 italic">{slide.subtitle}</p>}
            <div className="mt-auto pt-4 border-t border-white/20 text-sm opacity-70">
              {slideData?.audience} · {slideData?.duration}
            </div>
          </div>
        )
      case 'agenda':
        return (
          <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden">
            <div className="bg-[#1B3A6B] px-4 py-3">
              <h3 className="text-white font-bold text-lg">{slide.title}</h3>
            </div>
            <div className="p-4 space-y-2 flex-1 overflow-auto">
              {(slide.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#0D7377] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'activity':
        return (
          <div className="flex flex-col h-full bg-emerald-50 rounded-xl overflow-hidden">
            <div className="bg-[#14A085] px-4 py-3">
              <div className="text-white/80 text-xs font-bold uppercase mb-1">✦ {slide.activity_type}</div>
              <h3 className="text-white font-bold text-lg">{slide.title}</h3>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              {slide.prompt && (
                <div className="bg-white border-2 border-[#0D7377] rounded-lg p-3 mb-3 text-sm font-medium text-[#1B3A6B] italic">
                  {slide.prompt}
                </div>
              )}
              {slide.instructions && (
                <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
                  {slide.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                </ol>
              )}
            </div>
          </div>
        )
      case 'action_steps':
        return (
          <div className="flex flex-col h-full bg-[#1B3A6B] rounded-xl overflow-hidden">
            <div className="bg-[#0D7377] px-4 py-3">
              <h3 className="text-white font-bold text-lg">{slide.title}</h3>
            </div>
            <div className="p-4 space-y-2 flex-1 overflow-auto">
              {(slide.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#1E4C8F] rounded-lg px-3 py-2">
                  <span className="w-7 h-7 bg-amber-500 text-white text-xs font-bold flex items-center justify-center rounded shrink-0">{i + 1}</span>
                  <span className="text-white text-sm">{item}</span>
                </div>
              ))}
              {slide.reflection_prompt && (
                <div className="bg-[#14A085] rounded-lg px-3 py-2 text-white text-sm italic mt-2">
                  💭 {slide.reflection_prompt}
                </div>
              )}
            </div>
          </div>
        )
      case 'resources':
        return (
          <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden">
            <div className="bg-[#1B3A6B] px-4 py-3">
              <h3 className="text-white font-bold text-lg">{slide.title}</h3>
            </div>
            <div className="p-4 flex-1 overflow-auto space-y-2">
              {(slide.items || []).map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="w-1.5 h-full min-h-4 bg-amber-500 rounded shrink-0 mt-1"></span>
                  <div>
                    <p className="text-xs font-bold text-[#1B3A6B]">{typeof item === 'string' ? item : item.label}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden">
            <div className="bg-[#1B3A6B] px-4 py-3">
              <h3 className="text-white font-bold text-lg">{slide.title}</h3>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              {slide.stat && (
                <div className="float-right ml-4 mb-3 w-36 bg-[#1B3A6B] rounded-lg p-3 text-white text-xs italic text-center leading-relaxed">
                  {slide.stat}
                </div>
              )}
              {slide.heading && (
                <p className="text-xs font-bold text-[#0D7377] uppercase tracking-wide mb-2">{slide.heading}</p>
              )}
              {slide.bullets && (
                <ul className="space-y-2">
                  {slide.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0D7377] mt-0.5 shrink-0">▸</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )
    }
  }

  const getSlideIcon = (type) => {
    switch (type) {
      case 'title': return '🎯'
      case 'agenda': return '📋'
      case 'objectives': return '🏆'
      case 'activity': return '✦'
      case 'resources': return '📚'
      case 'action_steps': return '✅'
      default: return '📄'
    }
  }

  const getDriveContent = () => {
    if (!slideData) return ''
    let text = `${slideData.title}\n`
    text += `${slideData.subtitle || ''}\n\n`
    text += `Audience: ${slideData.audience} | Duration: ${slideData.duration} | Category: ${slideData.category}\n\n`
    text += `LEARNING OBJECTIVES:\n${(slideData.objectives || []).map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n`
    ;(slideData.slides || []).forEach((s, i) => {
      text += `--- SLIDE ${i + 1}: ${s.title} (${s.type}) ---\n`
      if (s.bullets) text += s.bullets.map(b => `• ${b}`).join('\n') + '\n'
      if (s.items) text += s.items.map(item => typeof item === 'string' ? `• ${item}` : `• ${item.label}: ${item.description || ''}`).join('\n') + '\n'
      if (s.prompt) text += `Prompt: ${s.prompt}\n`
      if (s.instructions) text += s.instructions.map((inst, j) => `${j + 1}. ${inst}`).join('\n') + '\n'
      if (s.presenter_notes) text += `\nPRESENTER NOTES: ${s.presenter_notes}\n`
      text += '\n'
    })
    return text
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
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">PD Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          {/* Title Row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Professional Development Generator</h1>
              <p className="text-gray-500 mt-1">Generate research-grounded PD presentations ready to export as PowerPoint or Google Slides.</p>
            </div>
            <div className="flex items-center gap-3">
              {showDemo && (
                <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button
                onClick={handleShowDemo}
                className={`text-sm font-medium transition-colors ${showDemo ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}
              >
                Show Demo
              </button>
            </div>
          </div>

          {/* Demo Banner */}
          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in example inputs for a 1-hour trauma-informed PD. Click Generate to see the full presentation.</p>
                </div>
              </div>
            </div>
          )}

          {/* Output Mode Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Output Mode</label>
            <div className="flex gap-3">
              <button onClick={() => setOutputMode('quick')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${outputMode === 'quick' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <div className="text-lg mb-1">⚡</div>
                <div className="font-semibold">Quick Export</div>
                <div className="text-xs opacity-70 mt-0.5">Full slides ready to present</div>
              </button>
              <button onClick={() => setOutputMode('draft')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${outputMode === 'draft' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <div className="text-lg mb-1">✏️</div>
                <div className="font-semibold">Draft & Edit</div>
                <div className="text-xs opacity-70 mt-0.5">Detailed outline with notes</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">PD Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building Trauma-Informed Classrooms"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
          </div>

          {/* Category + Audience */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic Category *</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audience *</label>
              <div className="relative">
                <select value={audience} onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                  {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${duration === d ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives <span className="text-gray-400 font-normal">(optional — AI will infer if blank)</span>
            </label>
            <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)}
              placeholder="e.g. Participants will identify 3 trauma-informed classroom strategies..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <button onClick={handleGenerate} disabled={generating || !title}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating Presentation... (this may take 20-30 seconds)</>) : (<><span>✨</span>Generate PD Presentation</>)}
          </button>
        </div>

        {/* Output Section */}
        {slideData && (
          <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{slideData.title}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{slideData.slides?.length} slides · {slideData.audience} · {slideData.duration}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => setShowNotes(!showNotes)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${showNotes ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {showNotes ? '📝 Hide Notes' : '📝 Show Notes'}
                </button>
                <button onClick={handleExportPptx} disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg text-sm font-medium transition-colors">
                  {exporting ? 'Exporting...' : '📊 Download .pptx'}
                </button>
                <GoogleDriveButton
                  title={`PD: ${slideData.title}`}
                  content={getDriveContent()}
                  toolName="PD Generator"
                />
              </div>
            </div>

            {/* Objectives */}
            {slideData.objectives && slideData.objectives.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Learning Objectives</p>
                <ul className="space-y-1">
                  {slideData.objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 shrink-0">✓</span>{obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slide viewer */}
            <div className="flex gap-4">
              {/* Thumbnail sidebar */}
              <div className="w-44 shrink-0 space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {slideData.slides.map((s, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all text-xs ${activeSlide === i ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span>{getSlideIcon(s.type)}</span>
                      <span className="font-medium text-gray-500 uppercase" style={{ fontSize: '9px' }}>{s.type}</span>
                    </div>
                    <p className="text-gray-700 font-medium leading-tight line-clamp-2">{s.title}</p>
                  </button>
                ))}
              </div>

              {/* Main preview */}
              <div className="flex-1">
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {getSlidePreviewContent(slideData.slides[activeSlide])}
                </div>

                {/* Presenter notes */}
                {showNotes && slideData.slides[activeSlide]?.presenter_notes && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">📝 Presenter Notes</p>
                    <p className="text-sm text-amber-900 leading-relaxed">{slideData.slides[activeSlide].presenter_notes}</p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-3">
                  <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} disabled={activeSlide === 0}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500">{activeSlide + 1} / {slideData.slides.length}</span>
                  <button onClick={() => setActiveSlide(Math.min(slideData.slides.length - 1, activeSlide + 1))} disabled={activeSlide === slideData.slides.length - 1}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}