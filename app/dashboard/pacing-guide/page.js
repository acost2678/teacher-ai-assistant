'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PacingGuidePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState('')
  
  // Basic Info
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [unitTopic, setUnitTopic] = useState('')
  const [timeframe, setTimeframe] = useState('3 weeks')
  const [totalDays, setTotalDays] = useState('15')
  const [startDate, setStartDate] = useState('')
  
  // Standards
  const [standardsFramework, setStandardsFramework] = useState('common-core')
  const [customStandards, setCustomStandards] = useState('')
  
  // Goals & Prior Knowledge
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [endGoals, setEndGoals] = useState('')
  
  // Texts/Readings
  const [texts, setTexts] = useState([])
  
  // Unit Portions/Milestones
  const [unitPortions, setUnitPortions] = useState([])
  
  // Assessments
  const [assessments, setAssessments] = useState([])
  
  // Holidays
  const [includeHolidays, setIncludeHolidays] = useState(false)
  const [holidays, setHolidays] = useState('')
  
  // Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Output - now stores structured data
  const [pacingData, setPacingData] = useState(null)
  const [pacingGuide, setPacingGuide] = useState('') // Plain text backup
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [activeSection, setActiveSection] = useState('basics')
  const [outputView, setOutputView] = useState('table') // 'table' or 'text'
  
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

  // Text management
  const addText = () => {
    setTexts([...texts, { id: Date.now(), title: '', author: '', type: 'novel', chapters: '', pages: '', targetDays: '', notes: '' }])
  }
  const updateText = (id, field, value) => {
    setTexts(texts.map(t => t.id === id ? { ...t, [field]: value } : t))
  }
  const removeText = (id) => {
    setTexts(texts.filter(t => t.id !== id))
  }

  // Unit portions management
  const addPortion = () => {
    setUnitPortions([...unitPortions, { id: Date.now(), name: '', focus: '', startDay: '', endDay: '', keyObjectives: '', textsIncluded: '' }])
  }
  const updatePortion = (id, field, value) => {
    setUnitPortions(unitPortions.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  const removePortion = (id) => {
    setUnitPortions(unitPortions.filter(p => p.id !== id))
  }

  // Assessment management
  const addAssessment = () => {
    setAssessments([...assessments, { id: Date.now(), name: '', type: 'formative', day: '', description: '' }])
  }
  const updateAssessment = (id, field, value) => {
    setAssessments(assessments.map(a => a.id === id ? { ...a, [field]: value } : a))
  }
  const removeAssessment = (id) => {
    setAssessments(assessments.filter(a => a.id !== id))
  }

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('English Language Arts')
    setUnitTopic('Historical Fiction & The American Revolution')
    setTimeframe('4 weeks')
    setTotalDays('20')
    setStartDate('2025-01-06')
    setStandardsFramework('common-core')
    setCustomStandards('RL.5.2 - Determine theme from details\nRL.5.3 - Compare and contrast characters\nRL.5.6 - Describe how narrator\'s point of view influences events\nW.5.3 - Write narratives with effective technique')
    setPriorKnowledge('Students have read realistic fiction and understand basic story elements.')
    setEndGoals('Students will analyze how historical context shapes fictional narratives and write their own historical fiction scene.')
    setTexts([
      { id: 1, title: 'My Brother Sam is Dead', author: 'James Lincoln Collier', type: 'novel', chapters: 'Chapters 1-14', pages: '1-215', targetDays: 'Days 1-15', notes: 'Core anchor text' },
      { id: 2, title: 'George vs. George', author: 'Rosalyn Schanzer', type: 'nonfiction', chapters: 'Selected sections', pages: '', targetDays: 'Days 3, 8, 12', notes: 'Paired nonfiction' },
    ])
    setUnitPortions([
      { id: 1, name: 'Part 1: Setting the Stage', focus: 'Historical context, introducing the novel', startDay: '1', endDay: '5', keyObjectives: 'Understand setting, identify characters', textsIncluded: 'Ch 1-4' },
      { id: 2, name: 'Part 2: Rising Conflict', focus: 'Analyzing conflict, comparing perspectives', startDay: '6', endDay: '12', keyObjectives: 'Analyze motivations, identify theme', textsIncluded: 'Ch 5-10' },
      { id: 3, name: 'Part 3: Resolution & Response', focus: 'Theme analysis, historical fiction writing', startDay: '13', endDay: '20', keyObjectives: 'Determine theme, write scene', textsIncluded: 'Ch 11-14' },
    ])
    setAssessments([
      { id: 1, name: 'Character Analysis Quiz', type: 'formative', day: '5', description: 'Quiz on characters and setting' },
      { id: 2, name: 'Theme Essay', type: 'summative', day: '18', description: 'Essay analyzing theme' },
    ])
    setIncludeHolidays(true)
    setHolidays('Day 10 - MLK Day (No School)')
    setShowDemo(true)
    setPacingData(null)
    setPacingGuide('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setUnitTopic('')
    setTimeframe('3 weeks')
    setTotalDays('15')
    setStartDate('')
    setStandardsFramework('common-core')
    setCustomStandards('')
    setPriorKnowledge('')
    setEndGoals('')
    setTexts([])
    setUnitPortions([])
    setAssessments([])
    setIncludeHolidays(false)
    setHolidays('')
    setAdditionalNotes('')
    setShowDemo(false)
    setPacingData(null)
    setPacingGuide('')
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
    setPacingData(null)
    setPacingGuide('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-pacing-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, unitTopic, timeframe, totalDays, startDate,
          standardsFramework, customStandards, priorKnowledge, endGoals,
          texts, unitPortions, assessments, includeHolidays, holidays, additionalNotes,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setPacingData(data.pacingData)
        setPacingGuide(data.pacingGuide)
        await handleSave(data.pacingGuide, data.pacingData)
        scrollToOutput()
      }
    } catch (error) {
      alert('Error generating pacing guide. Please try again.')
    }
    
    setGenerating(false)
  }

  const handleSave = async (content, data) => {
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
          metadata: { gradeLevel, subject, unitTopic, timeframe, totalDays, pacingData: data },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportExcel = async () => {
    if (!pacingData) return
    setExporting(true)
    setExportType('excel')
    try {
      const response = await fetch('/api/export-pacing-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacingData, unitTopic }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Pacing_Guide_${unitTopic.replace(/\s+/g, '_')}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Failed to export to Excel')
    }
    setExporting(false)
    setExportType('')
  }

  const handleExportDocx = async () => {
    if (!pacingData) return
    setExporting(true)
    setExportType('docx')
    try {
      const response = await fetch('/api/export-pacing-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacingData, unitTopic }),
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
      alert('Failed to export to Word')
    }
    setExporting(false)
    setExportType('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pacingGuide)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sections = [
    { id: 'basics', label: 'Basics', icon: '📋' },
    { id: 'texts', label: 'Texts', icon: '📚', count: texts.length },
    { id: 'portions', label: 'Unit Portions', icon: '📅', count: unitPortions.length },
    { id: 'assessments', label: 'Assessments', icon: '✅', count: assessments.length },
    { id: 'other', label: 'Other', icon: '⚙️' },
  ]

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Pacing Guide</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📅</span>
                <h1 className="text-2xl font-semibold text-gray-800">Pacing Guide</h1>
              </div>
              <p className="text-gray-500">Plan your unit day-by-day with texts, milestones, and assessments.</p>
            </div>
            <div className="flex items-center gap-3">
              {showDemo && (
                <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowDemo} className={`text-sm font-medium transition-colors ${showDemo ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                Show Demo
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo loaded!</h3>
                  <p className="text-purple-600 text-sm">Example: 5th Grade Historical Fiction with texts and portions.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                  {section.count !== undefined && section.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeSection === section.id ? 'bg-white/20' : 'bg-purple-100 text-purple-700'}`}>
                      {section.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* BASICS */}
            {activeSection === 'basics' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Unit Basics</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level *</label>
                    <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit/Topic *</label>
                  <input type="text" value={unitTopic} onChange={(e) => setUnitTopic(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" placeholder="e.g., Fraction Operations, Persuasive Writing" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                    <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                      {['1 week', '2 weeks', '3 weeks', '4 weeks', '6 weeks', '9 weeks (Quarter)'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                    <input type="number" value={totalDays} onChange={(e) => setTotalDays(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" placeholder="15" min="1" max="90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standards Framework</label>
                  <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="common-core">Common Core (CCSS)</option>
                    <option value="ngss">NGSS</option>
                    <option value="texas-teks">Texas TEKS</option>
                    <option value="florida-best">Florida B.E.S.T.</option>
                  </select>
                </div>
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">📋 Paste Your Standards</label>
                  <textarea value={customStandards} onChange={(e) => setCustomStandards(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 h-20 resize-none" placeholder="Paste specific standards..." />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prior Knowledge</label>
                  <textarea value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 h-16 resize-none" placeholder="What should students already know?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Goals</label>
                  <textarea value={endGoals} onChange={(e) => setEndGoals(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 h-16 resize-none" placeholder="What should students master?" />
                </div>
              </div>
            )}

            {/* TEXTS */}
            {activeSection === 'texts' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Texts & Readings</h2>
                    <p className="text-gray-500 text-sm">Add books and texts with target timelines.</p>
                  </div>
                  <button onClick={addText} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                    <span>+</span> Add Text
                  </button>
                </div>
                {texts.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-3 block">📚</span>
                    <p className="text-gray-500">No texts added yet</p>
                    <button onClick={addText} className="text-purple-600 hover:text-purple-700 font-medium mt-2">+ Add your first text</button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {texts.map((text, index) => (
                      <div key={text.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">Text {index + 1}</span>
                          <button onClick={() => removeText(text.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" value={text.title} onChange={(e) => updateText(text.id, 'title', e.target.value)} placeholder="Title" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          <input type="text" value={text.author} onChange={(e) => updateText(text.id, 'author', e.target.value)} placeholder="Author" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" value={text.chapters} onChange={(e) => updateText(text.id, 'chapters', e.target.value)} placeholder="Chapters" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          <input type="text" value={text.targetDays} onChange={(e) => updateText(text.id, 'targetDays', e.target.value)} placeholder="Target Days" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          <input type="text" value={text.notes} onChange={(e) => updateText(text.id, 'notes', e.target.value)} placeholder="Notes" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PORTIONS */}
            {activeSection === 'portions' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Unit Portions</h2>
                    <p className="text-gray-500 text-sm">Break unit into phases with timelines.</p>
                  </div>
                  <button onClick={addPortion} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                    <span>+</span> Add Portion
                  </button>
                </div>
                {unitPortions.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-3 block">📅</span>
                    <p className="text-gray-500">No portions added yet</p>
                    <button onClick={addPortion} className="text-purple-600 hover:text-purple-700 font-medium mt-2">+ Add first portion</button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {unitPortions.map((portion, index) => (
                      <div key={portion.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg text-sm">Part {index + 1}</span>
                          <button onClick={() => removePortion(portion.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                        </div>
                        <input type="text" value={portion.name} onChange={(e) => updatePortion(portion.id, 'name', e.target.value)} placeholder="Portion Name (e.g., Part 1: Introduction)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" value={portion.startDay} onChange={(e) => updatePortion(portion.id, 'startDay', e.target.value)} placeholder="Start Day" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          <input type="text" value={portion.endDay} onChange={(e) => updatePortion(portion.id, 'endDay', e.target.value)} placeholder="End Day" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <textarea value={portion.focus} onChange={(e) => updatePortion(portion.id, 'focus', e.target.value)} placeholder="Focus / Description" rows={2} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ASSESSMENTS */}
            {activeSection === 'assessments' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Assessments</h2>
                    <p className="text-gray-500 text-sm">Plan formative and summative assessments.</p>
                  </div>
                  <button onClick={addAssessment} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                    <span>+</span> Add Assessment
                  </button>
                </div>
                {assessments.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-3 block">✅</span>
                    <p className="text-gray-500">No assessments added yet</p>
                    <button onClick={addAssessment} className="text-purple-600 hover:text-purple-700 font-medium mt-2">+ Add assessment</button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {assessments.map((a, index) => (
                      <div key={a.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`font-medium px-3 py-1 rounded-lg text-sm ${a.type === 'summative' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {a.type === 'summative' ? 'Summative' : 'Formative'} {index + 1}
                          </span>
                          <button onClick={() => removeAssessment(a.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" value={a.name} onChange={(e) => updateAssessment(a.id, 'name', e.target.value)} placeholder="Name" className="col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          <input type="text" value={a.day} onChange={(e) => updateAssessment(a.id, 'day', e.target.value)} placeholder="Day" className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <select value={a.type} onChange={(e) => updateAssessment(a.id, 'type', e.target.value)} className="w-full mt-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="formative">Formative</option>
                          <option value="summative">Summative</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OTHER */}
            {activeSection === 'other' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Settings</h2>
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <input type="checkbox" id="includeHolidays" checked={includeHolidays} onChange={(e) => setIncludeHolidays(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                    <label htmlFor="includeHolidays" className="text-gray-800 font-medium">Account for holidays</label>
                  </div>
                  {includeHolidays && (
                    <textarea value={holidays} onChange={(e) => setHolidays(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 h-16 mt-2 resize-none" placeholder="e.g., No school Oct 14" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 h-24 resize-none" placeholder="Cross-curricular connections, special considerations..." />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={generating || !unitTopic} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate Pacing Guide</>)}
            </button>
          </div>

          {/* Right Column - Output */}
          <div ref={outputRef}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              {/* Header with Export Options */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Generated Guide</h2>
                  {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                </div>
              </div>

              {/* Export Buttons */}
              {pacingData && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium mr-2">Export:</span>
                  <button
                    onClick={handleExportExcel}
                    disabled={exporting}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {exporting && exportType === 'excel' ? '...' : '📊'} Excel
                  </button>
                  <button
                    onClick={handleExportDocx}
                    disabled={exporting}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {exporting && exportType === 'docx' ? '...' : '📄'} Word
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy Text'}
                  </button>
                </div>
              )}

              {/* View Toggle */}
              {pacingData && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setOutputView('table')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${outputView === 'table' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    📊 Table View
                  </button>
                  <button
                    onClick={() => setOutputView('text')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${outputView === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    📝 Text View
                  </button>
                </div>
              )}

              {/* Output Display */}
              {pacingData ? (
                <div className="max-h-[60vh] overflow-y-auto">
                  {outputView === 'table' ? (
                    <div className="space-y-4">
                      {/* Unit Overview */}
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="font-semibold text-purple-800 mb-2">{pacingData.unitOverview?.title}</h3>
                        <p className="text-sm text-purple-700">{pacingData.unitOverview?.gradeSubject} • {pacingData.unitOverview?.duration}</p>
                      </div>

                      {/* Daily Plan Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-purple-600 text-white">
                              <th className="px-3 py-2 text-left rounded-tl-lg">Day</th>
                              <th className="px-3 py-2 text-left">Topic</th>
                              <th className="px-3 py-2 text-left">Reading</th>
                              <th className="px-3 py-2 text-left">Activities</th>
                              <th className="px-3 py-2 text-left rounded-tr-lg">Assessment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pacingData.dailyPlan?.map((day, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-3 py-2 font-medium text-purple-700">{day.day}</td>
                                <td className="px-3 py-2">{day.topic}</td>
                                <td className="px-3 py-2 text-gray-600">{day.reading || '-'}</td>
                                <td className="px-3 py-2 text-gray-600">{day.activities}</td>
                                <td className="px-3 py-2 text-gray-600">{day.assessment || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Assessment Summary */}
                      {pacingData.assessmentPlan?.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-4">
                          <h4 className="font-semibold text-orange-800 mb-2">Assessment Plan</h4>
                          <div className="space-y-1">
                            {pacingData.assessmentPlan.map((a, i) => (
                              <p key={i} className="text-sm text-orange-700">
                                <span className="font-medium">Day {a.day}:</span> {a.name} ({a.type})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed bg-gray-50 rounded-xl p-4">
                      {pacingGuide}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center min-h-[300px] flex items-center justify-center">
                  <div>
                    <span className="text-4xl mb-3 block">📅</span>
                    <p className="text-gray-400">Your pacing guide will appear here</p>
                    <p className="text-gray-300 text-sm mt-1">with table and text views</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}