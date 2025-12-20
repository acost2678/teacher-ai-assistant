'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function FBAWriterPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedFBA, setGeneratedFBA] = useState('')
  const [editedFBA, setEditedFBA] = useState('')
  const [exporting, setExporting] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // Student Context
  const [studentIdentifier, setStudentIdentifier] = useState('Student A')
  const [gradeLevel, setGradeLevel] = useState('Elementary (K-5)')
  const [setting, setSetting] = useState('General Education Classroom')
  const [disabilityCategory, setDisabilityCategory] = useState('')
  
  // Target Behavior
  const [targetBehavior, setTargetBehavior] = useState('')
  const [behaviorDescription, setBehaviorDescription] = useState('')
  
  // ABC Data - multiple observations
  const [abcObservations, setAbcObservations] = useState([
    { antecedent: '', behavior: '', consequence: '', date: '', time: '', setting: '' }
  ])
  
  // Setting Events & Context
  const [settingEvents, setSettingEvents] = useState([])
  const [additionalContext, setAdditionalContext] = useState('')
  
  // Data Summary
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState('moderate')
  const [peakTimes, setPeakTimes] = useState([])
  const [peakSettings, setPeakSettings] = useState([])
  
  // Output preferences
  const [outputFormat, setOutputFormat] = useState('full-narrative')
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  
  const [activeTab, setActiveTab] = useState('context') // 'context' | 'abc' | 'summary' | 'output'
  
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

  const settingEventOptions = [
    { id: 'sleep', label: 'Poor sleep / Fatigue' },
    { id: 'medication', label: 'Medication changes / Missed medication' },
    { id: 'home', label: 'Home/family issues' },
    { id: 'hunger', label: 'Hunger / Missed meals' },
    { id: 'illness', label: 'Illness / Not feeling well' },
    { id: 'transitions', label: 'Difficult transitions' },
    { id: 'schedule', label: 'Schedule changes' },
    { id: 'sensory', label: 'Sensory overload' },
    { id: 'peer', label: 'Peer conflicts' },
    { id: 'academic', label: 'Academic frustration' },
  ]

  const timeOptions = [
    { id: 'morning-arrival', label: 'Morning / Arrival' },
    { id: 'morning-instruction', label: 'Morning Instruction' },
    { id: 'specials', label: 'Specials (Art, PE, Music)' },
    { id: 'lunch', label: 'Lunch / Cafeteria' },
    { id: 'recess', label: 'Recess' },
    { id: 'afternoon', label: 'Afternoon Instruction' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'dismissal', label: 'Dismissal' },
    { id: 'unstructured', label: 'Unstructured Time' },
  ]

  const settingOptions = [
    { id: 'gen-ed', label: 'General Ed Classroom' },
    { id: 'sped', label: 'Special Ed Classroom' },
    { id: 'hallway', label: 'Hallway' },
    { id: 'cafeteria', label: 'Cafeteria' },
    { id: 'playground', label: 'Playground / Recess' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'specials', label: 'Specials Classroom' },
    { id: 'bus', label: 'Bus' },
    { id: 'small-group', label: 'Small Group Setting' },
    { id: 'one-on-one', label: 'One-on-One Setting' },
  ]

  const toggleSettingEvent = (eventId) => {
    setSettingEvents(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    )
  }

  const togglePeakTime = (timeId) => {
    setPeakTimes(prev => 
      prev.includes(timeId) ? prev.filter(id => id !== timeId) : [...prev, timeId]
    )
  }

  const togglePeakSetting = (settingId) => {
    setPeakSettings(prev => 
      prev.includes(settingId) ? prev.filter(id => id !== settingId) : [...prev, settingId]
    )
  }

  const addObservation = () => {
    setAbcObservations(prev => [...prev, { antecedent: '', behavior: '', consequence: '', date: '', time: '', setting: '' }])
  }

  const removeObservation = (index) => {
    if (abcObservations.length > 1) {
      setAbcObservations(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateObservation = (index, field, value) => {
    setAbcObservations(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleShowDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('Emotional Disturbance')
    setTargetBehavior('Physical Aggression')
    setBehaviorDescription('Hitting, kicking, or pushing peers and adults when demands are placed or during transitions')
    setAbcObservations([
      { 
        antecedent: 'Teacher asked student to start independent math work', 
        behavior: 'Student threw pencil, pushed desk, said "I can\'t do this"', 
        consequence: 'Teacher removed math work, sent student to calm corner',
        date: '12/15',
        time: 'Morning Instruction',
        setting: 'General Ed Classroom'
      },
      { 
        antecedent: 'Transition announcement - time to clean up for lunch', 
        behavior: 'Student hit peer who was nearby, kicked chair over', 
        consequence: 'Peer moved away, adult came to help student transition',
        date: '12/16',
        time: 'Transition',
        setting: 'General Ed Classroom'
      },
      { 
        antecedent: 'Teacher gave writing prompt, class began working', 
        behavior: 'Student ripped paper, pushed materials off desk, put head down', 
        consequence: 'Teacher offered a break, reduced assignment length',
        date: '12/17',
        time: 'Morning Instruction',
        setting: 'General Ed Classroom'
      },
      { 
        antecedent: 'Asked to read aloud during small group reading', 
        behavior: 'Student refused, pushed book away, left the group', 
        consequence: 'Teacher allowed student to skip turn, student returned after 5 min',
        date: '12/18',
        time: 'Morning Instruction',
        setting: 'Small Group Setting'
      },
    ])
    setSettingEvents(['academic', 'transitions'])
    setAdditionalContext('Student receives reading intervention. Recent evaluation shows reading 2 grade levels below. Student has expressed feeling "stupid" about reading.')
    setFrequency('3-5 times per day')
    setDuration('Episodes last 2-10 minutes')
    setIntensity('moderate-high')
    setPeakTimes(['morning-instruction', 'transitions'])
    setPeakSettings(['gen-ed', 'small-group'])
    setIncludeRecommendations(true)
    setGeneratedFBA('')
    setActiveTab('context')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('')
    setTargetBehavior('')
    setBehaviorDescription('')
    setAbcObservations([{ antecedent: '', behavior: '', consequence: '', date: '', time: '', setting: '' }])
    setSettingEvents([])
    setAdditionalContext('')
    setFrequency('')
    setDuration('')
    setIntensity('moderate')
    setPeakTimes([])
    setPeakSettings([])
    setGeneratedFBA('')
    setEditedFBA('')
    setActiveTab('context')
    setShowDemo(false)
  }

  const handleGenerate = async () => {
    // Validate
    if (!targetBehavior) {
      alert('Please enter a target behavior')
      return
    }
    const hasABCData = abcObservations.some(obs => obs.antecedent && obs.behavior && obs.consequence)
    if (!hasABCData) {
      alert('Please enter at least one complete ABC observation')
      return
    }

    setGenerating(true)
    setGeneratedFBA('')

    try {
      const response = await fetch('/api/fba-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIdentifier,
          gradeLevel,
          setting,
          disabilityCategory,
          targetBehavior,
          behaviorDescription,
          abcObservations: abcObservations.filter(obs => obs.antecedent && obs.behavior && obs.consequence),
          settingEvents: settingEvents.map(id => settingEventOptions.find(opt => opt.id === id)?.label).filter(Boolean),
          additionalContext,
          frequency,
          duration,
          intensity,
          peakTimes: peakTimes.map(id => timeOptions.find(opt => opt.id === id)?.label).filter(Boolean),
          peakSettings: peakSettings.map(id => settingOptions.find(opt => opt.id === id)?.label).filter(Boolean),
          outputFormat,
          includeRecommendations,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        setGeneratedFBA(data.fba)
        setEditedFBA(data.fba)
        setActiveTab('output')
      }
    } catch (error) {
      alert('Error generating FBA. Please try again.')
    }

    setGenerating(false)
  }

  const handleExport = async () => {
    if (!generatedFBA) return
    setExporting(true)

    try {
      const content = editedFBA || generatedFBA

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Functional Behavioral Assessment - ${studentIdentifier}`,
          content: content,
          toolName: 'FBA Writer'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `FBA_${studentIdentifier.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
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
    navigator.clipboard.writeText(editedFBA || generatedFBA)
    alert('FBA copied to clipboard!')
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">FBA Writer</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🔍</span>
                <h1 className="text-2xl font-semibold text-gray-800">FBA Writer</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">COMPLIANCE</span>
              </div>
              <p className="text-gray-500">Generate comprehensive Functional Behavioral Assessments. Input your observation data, get a professional FBA narrative with function hypothesis and BIP recommendations.</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Student names and data are never stored. Use identifiers like "Student A". The FBA uses "[Student Name]" placeholders - add real names after downloading to your secure system.</p>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-xl">⚠️</span>
              <div>
                <h3 className="text-amber-800 font-medium">Professional Review Required</h3>
                <p className="text-amber-700 text-sm">This tool assists with documentation but does not replace professional judgment. All FBAs should be reviewed by qualified personnel (BCBA, School Psychologist, or trained behavior specialist) before finalization.</p>
              </div>
            </div>
          </div>

          {/* See Demo Button */}
          <div className="flex gap-3">
            {!showDemo ? (
              <button
                onClick={handleShowDemo}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                <span>✨</span> See Demo
              </button>
            ) : (
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <span>↺</span> Reset Demo
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('context')}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'context'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. Context
          </button>
          <button
            onClick={() => setActiveTab('abc')}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'abc'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            2. ABC Data
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            3. Patterns
          </button>
          <button
            onClick={() => setActiveTab('output')}
            disabled={!generatedFBA}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'output'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            4. FBA Output
          </button>
        </div>

        {/* Context Tab */}
        {activeTab === 'context' && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Identifier</label>
                  <input
                    type="text"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="Student A"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="Early Childhood (Pre-K)">Early Childhood (Pre-K)</option>
                    <option value="Elementary (K-5)">Elementary (K-5)</option>
                    <option value="Middle School (6-8)">Middle School (6-8)</option>
                    <option value="High School (9-12)">High School (9-12)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Setting</label>
                  <select value={setting} onChange={(e) => setSetting(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="General Education Classroom">General Education Classroom</option>
                    <option value="Special Education Classroom">Special Education Classroom</option>
                    <option value="Resource Room">Resource Room</option>
                    <option value="Self-Contained Classroom">Self-Contained Classroom</option>
                    <option value="Inclusion Setting">Inclusion Setting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disability Category (optional)</label>
                  <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="">Not specified</option>
                    <option value="Autism">Autism</option>
                    <option value="Emotional Disturbance">Emotional Disturbance</option>
                    <option value="Specific Learning Disability">Specific Learning Disability</option>
                    <option value="ADHD/Other Health Impairment">ADHD/Other Health Impairment</option>
                    <option value="Intellectual Disability">Intellectual Disability</option>
                    <option value="Speech/Language Impairment">Speech/Language Impairment</option>
                    <option value="Multiple Disabilities">Multiple Disabilities</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target Behavior */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Target Behavior</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Behavior Name</label>
                  <input
                    type="text"
                    value={targetBehavior}
                    onChange={(e) => setTargetBehavior(e.target.value)}
                    placeholder="e.g., Physical Aggression, Task Refusal, Elopement"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observable Description</label>
                  <textarea
                    value={behaviorDescription}
                    onChange={(e) => setBehaviorDescription(e.target.value)}
                    placeholder="Describe the behavior in observable, measurable terms. What does it look like? Include examples.&#10;&#10;e.g., 'Hitting, kicking, or pushing peers and adults. May include throwing objects. Does not include verbal aggression.'"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Setting Events */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Setting Events (Select all that apply)</h2>
                <p className="text-sm text-gray-500">Factors that make the behavior more likely to occur</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {settingEventOptions.map(event => (
                  <button
                    key={event.id}
                    onClick={() => toggleSettingEvent(event.id)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      settingEvents.includes(event.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Context */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Context (Optional)</h2>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any relevant background: academic levels, previous interventions tried, relevant history, medical considerations, student strengths, etc."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={() => setActiveTab('abc')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors"
            >
              Next: Enter ABC Data →
            </button>
          </div>
        )}

        {/* ABC Data Tab */}
        {activeTab === 'abc' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">ABC Observations</h2>
                  <p className="text-sm text-gray-500">Enter at least 3-5 observations for best results</p>
                </div>
                <button
                  onClick={addObservation}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  + Add Observation
                </button>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {abcObservations.map((obs, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={obs.date}
                          onChange={(e) => updateObservation(index, 'date', e.target.value)}
                          placeholder="Date"
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm w-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={obs.time}
                          onChange={(e) => updateObservation(index, 'time', e.target.value)}
                          placeholder="Time/Period"
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={obs.setting}
                          onChange={(e) => updateObservation(index, 'setting', e.target.value)}
                          placeholder="Setting/Location"
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      {abcObservations.length > 1 && (
                        <button
                          onClick={() => removeObservation(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-amber-700 mb-1 uppercase">A - Antecedent</label>
                        <textarea
                          value={obs.antecedent}
                          onChange={(e) => updateObservation(index, 'antecedent', e.target.value)}
                          placeholder="What happened RIGHT BEFORE the behavior? What was the trigger?"
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-red-700 mb-1 uppercase">B - Behavior</label>
                        <textarea
                          value={obs.behavior}
                          onChange={(e) => updateObservation(index, 'behavior', e.target.value)}
                          placeholder="What did the student DO? Describe exactly what you observed."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1 uppercase">C - Consequence</label>
                        <textarea
                          value={obs.consequence}
                          onChange={(e) => updateObservation(index, 'consequence', e.target.value)}
                          placeholder="What happened AFTER? How did adults/peers respond? What did student get or avoid?"
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab('context')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Back to Context
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
              >
                Next: Patterns →
              </button>
            </div>
          </div>
        )}

        {/* Summary/Patterns Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Data Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Behavior Data Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g., 3-5 times per day"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., Episodes last 5-10 minutes"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                  <select value={intensity} onChange={(e) => setIntensity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="low">Low - Minor disruption</option>
                    <option value="moderate">Moderate - Significant disruption</option>
                    <option value="moderate-high">Moderate-High - Safety concern emerging</option>
                    <option value="high">High - Immediate safety concern</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Peak Times */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">When Does the Behavior Occur Most?</h2>
                <p className="text-sm text-gray-500">Select the times when behavior is most frequent</p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {timeOptions.map(time => (
                  <button
                    key={time.id}
                    onClick={() => togglePeakTime(time.id)}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      peakTimes.includes(time.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Peak Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Where Does the Behavior Occur Most?</h2>
                <p className="text-sm text-gray-500">Select the settings where behavior is most frequent</p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {settingOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => togglePeakSetting(opt.id)}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      peakSettings.includes(opt.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Output Options</h2>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRecommendations}
                    onChange={(e) => setIncludeRecommendations(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Include BIP Recommendations</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Analyzing data and generating FBA...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Generate FBA
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('abc')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to ABC Data
            </button>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedFBA && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated FBA</h2>
                  <p className="text-gray-500 text-sm">Review and edit before exporting. Replace "[Student Name]" with actual name in your secure system.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {exporting ? 'Exporting...' : '📄 Export (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            {/* FBA Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <textarea
                value={editedFBA}
                onChange={(e) => setEditedFBA(e.target.value)}
                rows={30}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
              />
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">⚠️</span>
                <div>
                  <h3 className="text-amber-800 font-medium">Before Finalizing</h3>
                  <ul className="text-amber-700 text-sm mt-1 list-disc list-inside">
                    <li>Verify all data is accurate and matches your records</li>
                    <li>Have a qualified professional (BCBA, School Psychologist) review</li>
                    <li>Replace "[Student Name]" with actual name in your secure IEP system</li>
                    <li>Adjust function hypothesis based on your professional judgment</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('summary')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Edit Data
            </button>
          </div>
        )}
      </main>
    </div>
  )
}