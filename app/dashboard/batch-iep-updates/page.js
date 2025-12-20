'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BatchIEPUpdatesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(0)
  const [exporting, setExporting] = useState(false)
  
  // Settings
  const [reportingPeriod, setReportingPeriod] = useState('Quarter 2')
  const [gradeLevel, setGradeLevel] = useState('Elementary (K-5)')
  const [toneStyle, setToneStyle] = useState('professional')
  
  // Students data - privacy-first
  const [numberOfStudents, setNumberOfStudents] = useState(5)
  const [studentGoals, setStudentGoals] = useState([])
  const [generatedUpdates, setGeneratedUpdates] = useState([])
  
  const [activeTab, setActiveTab] = useState('input') // 'input' | 'review'
  const [selectedUpdate, setSelectedUpdate] = useState(0)
  const [editedUpdates, setEditedUpdates] = useState([])
  const [showDemo, setShowDemo] = useState(false)
  
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

  // Initialize student goals array when number changes
  useEffect(() => {
    if (!showDemo) {
      setStudentGoals(prev => {
        const newGoals = [...prev]
        while (newGoals.length < numberOfStudents) {
          newGoals.push({ 
            identifier: `Student ${newGoals.length + 1}`, 
            goalArea: 'reading',
            annualGoal: '',
            baseline: '',
            currentLevel: '',
            interventions: '',
            progress: 'progressing'
          })
        }
        return newGoals.slice(0, numberOfStudents)
      })
    }
  }, [numberOfStudents, showDemo])

  const goalAreas = [
    { id: 'reading', name: 'Reading' },
    { id: 'writing', name: 'Writing' },
    { id: 'math', name: 'Mathematics' },
    { id: 'behavior', name: 'Behavior/Social-Emotional' },
    { id: 'speech', name: 'Speech/Language' },
    { id: 'motor', name: 'Fine/Gross Motor' },
    { id: 'adaptive', name: 'Adaptive/Life Skills' },
    { id: 'transition', name: 'Transition' },
  ]

  const progressOptions = [
    { id: 'mastered', name: 'Mastered - Goal Met', color: 'green' },
    { id: 'progressing', name: 'Progressing - On Track', color: 'blue' },
    { id: 'slow-progress', name: 'Slow Progress - Some Growth', color: 'yellow' },
    { id: 'minimal', name: 'Minimal Progress - Concern', color: 'orange' },
    { id: 'regression', name: 'Regression - Losing Skills', color: 'red' },
    { id: 'not-addressed', name: 'Not Addressed This Period', color: 'gray' },
  ]

  const handleShowDemo = () => {
    setReportingPeriod('Quarter 2')
    setGradeLevel('Elementary (K-5)')
    setToneStyle('professional')
    setNumberOfStudents(3)
    setStudentGoals([
      { 
        identifier: 'Student A', 
        goalArea: 'reading',
        annualGoal: 'By the end of the IEP year, student will read grade-level text with 95% accuracy and answer comprehension questions with 80% accuracy.',
        baseline: 'Currently reading at DRA level 18 (beginning 2nd grade) with 85% accuracy. Comprehension at 60%.',
        currentLevel: 'Now reading at DRA level 24 (end of 2nd grade) with 90% accuracy. Comprehension at 72%.',
        interventions: 'Wilson Reading System 4x/week, small group instruction, graphic organizers for comprehension',
        progress: 'progressing'
      },
      { 
        identifier: 'Student B', 
        goalArea: 'behavior',
        annualGoal: 'Student will use appropriate coping strategies when frustrated, reducing classroom outbursts from 5x/day to 1x/day or less.',
        baseline: 'Averaging 5 outbursts per day, leaving classroom 2-3 times daily, physical aggression 1-2x weekly.',
        currentLevel: 'Now averaging 2 outbursts per day, leaving classroom 1x daily, no physical aggression this quarter.',
        interventions: 'Check-in/check-out, calm corner access, social skills group 2x/week, behavior contract',
        progress: 'progressing'
      },
      { 
        identifier: 'Student C', 
        goalArea: 'math',
        annualGoal: 'Student will solve 2-digit addition and subtraction problems with regrouping with 85% accuracy.',
        baseline: 'Solving 2-digit addition without regrouping at 70% accuracy. Cannot yet regroup.',
        currentLevel: 'Now solving 2-digit addition WITH regrouping at 65% accuracy. Subtraction with regrouping at 40%.',
        interventions: 'Touch Math, manipulatives, daily fact practice, 1:1 instruction 3x/week',
        progress: 'slow-progress'
      },
    ])
    setGeneratedUpdates([])
    setActiveTab('input')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setReportingPeriod('Quarter 2')
    setGradeLevel('Elementary (K-5)')
    setToneStyle('professional')
    setNumberOfStudents(5)
    setStudentGoals([])
    setGeneratedUpdates([])
    setActiveTab('input')
    setShowDemo(false)
  }

  const updateStudentGoal = (index, field, value) => {
    setStudentGoals(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleGenerate = async () => {
    // Validate
    const hasGoals = studentGoals.some(s => s.annualGoal && s.currentLevel)
    if (!hasGoals) {
      alert('Please enter at least one student with an annual goal and current level')
      return
    }

    setGenerating(true)
    setGeneratedUpdates([])
    setCurrentStudent(0)

    try {
      const updates = []
      
      for (let i = 0; i < studentGoals.length; i++) {
        setCurrentStudent(i + 1)
        
        const student = studentGoals[i]
        // Skip students with no goal info
        if (!student.annualGoal || !student.currentLevel) {
          updates.push({
            identifier: student.identifier,
            update: '[No goal information provided - skipped]',
            skipped: true
          })
          continue
        }

        const response = await fetch('/api/batch-iep-updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportingPeriod,
            gradeLevel,
            toneStyle,
            studentIdentifier: student.identifier,
            goalArea: student.goalArea,
            annualGoal: student.annualGoal,
            baseline: student.baseline,
            currentLevel: student.currentLevel,
            interventions: student.interventions,
            progress: student.progress,
          }),
        })

        const data = await response.json()
        
        if (data.error) {
          updates.push({
            identifier: student.identifier,
            update: `[Error generating update: ${data.error}]`,
            error: true
          })
        } else {
          updates.push({
            identifier: student.identifier,
            goalArea: student.goalArea,
            progress: student.progress,
            update: data.update,
            skipped: false,
            error: false
          })
        }
      }

      setGeneratedUpdates(updates)
      setEditedUpdates(updates.map(u => u.update))
      setActiveTab('review')
      setSelectedUpdate(0)
      
    } catch (error) {
      alert('Error generating updates. Please try again.')
    }

    setGenerating(false)
    setCurrentStudent(0)
  }

  const handleExportAll = async () => {
    if (generatedUpdates.length === 0) return
    setExporting(true)

    try {
      let combinedContent = `IEP PROGRESS UPDATES - ${reportingPeriod}\n`
      combinedContent += `Grade Level: ${gradeLevel}\n`
      combinedContent += `Generated: ${new Date().toLocaleDateString()}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      generatedUpdates.forEach((item, index) => {
        if (!item.skipped && !item.error) {
          const goalAreaName = goalAreas.find(g => g.id === item.goalArea)?.name || item.goalArea
          const progressName = progressOptions.find(p => p.id === item.progress)?.name || item.progress
          combinedContent += `--- ${item.identifier} ---\n`
          combinedContent += `Goal Area: ${goalAreaName}\n`
          combinedContent += `Progress Status: ${progressName}\n\n`
          combinedContent += editedUpdates[index] || item.update
          combinedContent += `\n\n${'='.repeat(60)}\n\n`
        }
      })

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `IEP Progress Updates - ${reportingPeriod}`,
          content: combinedContent,
          toolName: 'Batch IEP Updates'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `IEP_Progress_Updates_${reportingPeriod.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
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

  const handleCopyOne = (index) => {
    navigator.clipboard.writeText(editedUpdates[index] || generatedUpdates[index]?.update)
    alert('Update copied to clipboard!')
  }

  const handleCopyAll = () => {
    let combinedContent = ''
    generatedUpdates.forEach((item, index) => {
      if (!item.skipped && !item.error) {
        combinedContent += `--- ${item.identifier} ---\n\n`
        combinedContent += editedUpdates[index] || item.update
        combinedContent += `\n\n---\n\n`
      }
    })
    navigator.clipboard.writeText(combinedContent)
    alert('All updates copied to clipboard!')
  }

  const completedUpdates = generatedUpdates.filter(u => !u.skipped && !u.error).length

  const getProgressBadgeColor = (progressId) => {
    const colors = {
      'mastered': 'bg-green-100 text-green-700',
      'progressing': 'bg-blue-100 text-blue-700',
      'slow-progress': 'bg-yellow-100 text-yellow-700',
      'minimal': 'bg-orange-100 text-orange-700',
      'regression': 'bg-red-100 text-red-700',
      'not-addressed': 'bg-gray-100 text-gray-600',
    }
    return colors[progressId] || 'bg-gray-100 text-gray-600'
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
            <span className="text-gray-800 font-medium">Batch IEP Updates</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📋</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch IEP Updates</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Generate IDEA-compliant progress updates for your entire caseload. Input goal data, get professional narratives.</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Student names and data are never stored. Use identifiers like "Student A". Updates use "[Student Name]" placeholders - add real names after downloading to your secure IEP system.</p>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">⚖️</span>
              <div>
                <h3 className="text-blue-800 font-medium">IDEA Compliance</h3>
                <p className="text-blue-700 text-sm">Generated updates include required elements: progress toward annual goal, comparison to baseline, and projected timeline. Always review and verify data accuracy before including in official IEP documents.</p>
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
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'input'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. Enter Goal Data
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedUpdates.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            2. Review & Export {completedUpdates > 0 && `(${completedUpdates})`}
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Settings</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Period</label>
                  <select value={reportingPeriod} onChange={(e) => setReportingPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Semester 1', 'Semester 2', 'Annual Review', 'Triennial'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="Early Childhood (Pre-K)">Early Childhood (Pre-K)</option>
                    <option value="Elementary (K-5)">Elementary (K-5)</option>
                    <option value="Middle School (6-8)">Middle School (6-8)</option>
                    <option value="High School (9-12)">High School (9-12)</option>
                    <option value="Transition (18-22)">Transition (18-22)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Writing Style</label>
                  <select value={toneStyle} onChange={(e) => setToneStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="professional">Professional & Formal</option>
                    <option value="parent-friendly">Parent-Friendly</option>
                    <option value="detailed">Detailed & Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Goals</label>
                  <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {[5, 10, 15, 20, 25, 30].map(n => (
                      <option key={n} value={n}>{n} goals</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Student Goals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Goal Progress Data</h2>
                  <p className="text-sm text-gray-500">Enter each goal's information - can be multiple goals per student</p>
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {studentGoals.map((student, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {/* Header Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={student.identifier}
                        onChange={(e) => updateStudentGoal(index, 'identifier', e.target.value)}
                        placeholder="Student identifier"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <select
                        value={student.goalArea}
                        onChange={(e) => updateStudentGoal(index, 'goalArea', e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {goalAreas.map(area => (
                          <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                      </select>
                      <select
                        value={student.progress}
                        onChange={(e) => updateStudentGoal(index, 'progress', e.target.value)}
                        className={`px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${getProgressBadgeColor(student.progress)}`}
                      >
                        {progressOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Goal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Annual Goal</label>
                        <textarea
                          value={student.annualGoal}
                          onChange={(e) => updateStudentGoal(index, 'annualGoal', e.target.value)}
                          placeholder="By the end of the IEP year, student will..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Baseline (Start of IEP)</label>
                        <textarea
                          value={student.baseline}
                          onChange={(e) => updateStudentGoal(index, 'baseline', e.target.value)}
                          placeholder="At the start of the IEP, student was..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Current Level (This Period)</label>
                        <textarea
                          value={student.currentLevel}
                          onChange={(e) => updateStudentGoal(index, 'currentLevel', e.target.value)}
                          placeholder="Currently, student is performing at..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Interventions/Services</label>
                        <textarea
                          value={student.interventions}
                          onChange={(e) => updateStudentGoal(index, 'interventions', e.target.value)}
                          placeholder="Services provided: e.g., Wilson Reading 4x/week, OT 1x/week..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  Generating update {currentStudent} of {numberOfStudents}...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate All Progress Updates
                </>
              )}
            </button>

            {generating && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-purple-600">{currentStudent} / {numberOfStudents}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStudent / numberOfStudents) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && generatedUpdates.length > 0 && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Progress Updates</h2>
                  <p className="text-gray-500 text-sm">{completedUpdates} updates ready • Review for accuracy before adding to IEP system</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                  >
                    📋 Copy All
                  </button>
                  <button
                    onClick={handleExportAll}
                    disabled={exporting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {exporting ? 'Exporting...' : '📄 Export All (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Update Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Update List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Goals</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {generatedUpdates.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedUpdate(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedUpdate === index
                          ? 'bg-purple-100 text-purple-700'
                          : item.skipped || item.error
                          ? 'bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{item.identifier}</div>
                      {!item.skipped && !item.error && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{goalAreas.find(g => g.id === item.goalArea)?.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getProgressBadgeColor(item.progress)}`}>
                            {item.progress === 'progressing' ? '📈' : item.progress === 'mastered' ? '✅' : item.progress === 'slow-progress' ? '📊' : '⚠️'}
                          </span>
                        </div>
                      )}
                      {item.skipped && <span className="text-xs">(skipped)</span>}
                      {item.error && <span className="text-xs text-red-500">(error)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Update Preview/Edit */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {generatedUpdates[selectedUpdate]?.identifier}
                    </h3>
                    {generatedUpdates[selectedUpdate] && !generatedUpdates[selectedUpdate].skipped && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {goalAreas.find(g => g.id === generatedUpdates[selectedUpdate]?.goalArea)?.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getProgressBadgeColor(generatedUpdates[selectedUpdate]?.progress)}`}>
                          {progressOptions.find(p => p.id === generatedUpdates[selectedUpdate]?.progress)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyOne(selectedUpdate)}
                    className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <textarea
                  value={editedUpdates[selectedUpdate] || ''}
                  onChange={(e) => {
                    const updated = [...editedUpdates]
                    updated[selectedUpdate] = e.target.value
                    setEditedUpdates(updated)
                  }}
                  rows={14}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Always verify data accuracy before including in official IEP documents. Replace "[Student Name]" with actual name in your secure system.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('input')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Goal Data
            </button>
          </div>
        )}
      </main>
    </div>
  )
}