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
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [toneStyle, setToneStyle] = useState('professional')
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  
  // Number of students selector
  const [numberOfStudents, setNumberOfStudents] = useState(5)
  
  // Students data
  const [studentData, setStudentData] = useState([])
  const [generatedUpdates, setGeneratedUpdates] = useState([])
  
  const [activeTab, setActiveTab] = useState('input')
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

  // Initialize student data array when number changes
  useEffect(() => {
    if (!showDemo) {
      setStudentData(prev => {
        const newData = [...prev]
        while (newData.length < numberOfStudents) {
          newData.push({ 
            identifier: `Student ${newData.length + 1}`, 
            disabilityCategory: 'Specific Learning Disability',
            goalArea: 'reading',
            annualGoal: '',
            baseline: '',
            currentLevel: '',
            percentGoalAchieved: '',
            interventions: '',
            accommodations: '',
            progress: 'progressing',
            recommendations: '',
            nextSteps: '',
            nextReviewDate: ''
          })
        }
        return newData.slice(0, numberOfStudents)
      })
    }
  }, [numberOfStudents, showDemo])

  const disabilityCategories = [
    'Specific Learning Disability',
    'Speech or Language Impairment',
    'Other Health Impairment',
    'Autism',
    'Emotional Disturbance',
    'Intellectual Disability',
    'Multiple Disabilities',
    'Developmental Delay',
    'Hearing Impairment',
    'Visual Impairment',
    'Orthopedic Impairment',
    'Traumatic Brain Injury',
    'Deaf-Blindness',
  ]

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
    setGradeLevel('5th Grade')
    setToneStyle('professional')
    setNumberOfStudents(2)
    setStudentData([
      { 
        identifier: 'Michael C.', 
        disabilityCategory: 'Specific Learning Disability',
        goalArea: 'reading',
        annualGoal: 'Michael will read grade-level passages with 90% accuracy and answer comprehension questions with 80% accuracy by the end of the IEP period.',
        baseline: 'At the start of the IEP period, reading skills at the 3rd grade level with 75% accuracy in word recognition and decoding. Comprehension at 55% accuracy on grade-level text.',
        currentLevel: 'Currently reading 4th grade level passages with 85% accuracy. Comprehension: 70% on literal questions, 60% on inferential questions.',
        percentGoalAchieved: '65',
        interventions: 'Daily small group reading instruction with special education teacher, Wilson Reading System',
        accommodations: 'Graphic organizers for comprehension, audiobook access, extended time for reading assignments, preferential seating',
        progress: 'progressing',
        recommendations: 'Continue current goal and supports. Introduce visualization and mental imagery strategies for inferential comprehension. Gradually increase text complexity.',
        nextSteps: 'Implement visualization strategies in daily instruction. Collaborate with general ed teacher on complex texts. Schedule progress review in 6 weeks.',
        nextReviewDate: '2025-03-15'
      },
      { 
        identifier: 'Sarah M.', 
        disabilityCategory: 'Autism',
        goalArea: 'behavior',
        annualGoal: 'Sarah will use appropriate coping strategies when frustrated, reducing classroom outbursts from 5x/day to 1x/day or less.',
        baseline: 'At baseline, averaging 5 outbursts per day, leaving classroom 2-3 times daily, physical aggression 1-2x weekly.',
        currentLevel: 'Currently averaging 2 outbursts per day, leaving classroom 1x daily, no physical aggression this quarter.',
        percentGoalAchieved: '75',
        interventions: 'Check-in/check-out system, social skills group 2x/week, behavior contract with daily feedback',
        accommodations: 'Calm corner access, sensory breaks every 45 minutes, visual schedule, advance notice of transitions',
        progress: 'progressing',
        recommendations: 'Continue current supports. Begin fading check-in frequency. Teach self-monitoring skills.',
        nextSteps: 'Train Sarah on self-monitoring checklist. Reduce check-ins from 4x to 3x daily. Parent meeting to review home strategies.',
        nextReviewDate: '2025-03-01'
      },
    ])
    setGeneratedUpdates([])
    setActiveTab('input')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setReportingPeriod('Quarter 2')
    setGradeLevel('5th Grade')
    setToneStyle('professional')
    setNumberOfStudents(5)
    setStudentData([])
    setGeneratedUpdates([])
    setActiveTab('input')
    setShowDemo(false)
  }

  const updateStudentData = (index, field, value) => {
    setStudentData(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleGenerate = async () => {
    const hasData = studentData.some(s => s.annualGoal && s.currentLevel)
    if (!hasData) {
      alert('Please enter at least one student with an annual goal and current level')
      return
    }

    setGenerating(true)
    setGeneratedUpdates([])
    setCurrentStudent(0)

    try {
      const updates = []
      
      for (let i = 0; i < studentData.length; i++) {
        setCurrentStudent(i + 1)
        
        const student = studentData[i]
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
            reportDate,
            studentIdentifier: student.identifier,
            disabilityCategory: student.disabilityCategory,
            goalArea: student.goalArea,
            annualGoal: student.annualGoal,
            baseline: student.baseline,
            currentLevel: student.currentLevel,
            percentGoalAchieved: student.percentGoalAchieved,
            interventions: student.interventions,
            accommodations: student.accommodations,
            progress: student.progress,
            recommendations: student.recommendations,
            nextSteps: student.nextSteps,
            nextReviewDate: student.nextReviewDate,
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
      combinedContent += `Report Date: ${reportDate}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      generatedUpdates.forEach((item, index) => {
        if (!item.skipped && !item.error) {
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

  const handleExportOne = async (index) => {
    const item = generatedUpdates[index]
    if (!item || item.skipped || item.error) return
    
    setExporting(true)
    try {
      const content = editedUpdates[index] || item.update

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `IEP Update - ${item.identifier}`,
          content: content,
          toolName: 'IEP Progress Update'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `IEP_Update_${item.identifier.replace(/\s+/g, '_')}.docx`
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
        combinedContent += editedUpdates[index] || item.update
        combinedContent += `\n\n${'='.repeat(60)}\n\n`
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
                <h1 className="text-2xl font-semibold text-gray-800">Batch IEP Progress Reports</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Generate complete IDEA-compliant progress monitoring reports for your entire caseload.</p>
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

          {/* Privacy & Compliance Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">🔒</span>
                <div>
                  <h3 className="text-green-800 font-medium">Privacy-First</h3>
                  <p className="text-green-700 text-sm">Use identifiers like "Student A". Updates use "[Student Name]" placeholders for FERPA compliance.</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">⚖️</span>
                <div>
                  <h3 className="text-blue-800 font-medium">IDEA Compliant</h3>
                  <p className="text-blue-700 text-sm">Reports include all required elements: progress toward goal, baseline comparison, data analysis, recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. Enter Student Data
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedUpdates.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'review' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50'
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How Many Students?</label>
                  <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-purple-50 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 font-medium">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map(n => (
                      <option key={n} value={n}>{n} student{n !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
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
                    {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'Transition (18-22)'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Date</label>
                  <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
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
              </div>
            </div>

            {/* Student Data Entry */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Student Progress Data</h2>
                  <p className="text-sm text-gray-500">Enter each student's IEP goal and progress information</p>
                </div>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
                  {numberOfStudents} student{numberOfStudents !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                {studentData.map((student, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    {/* Student Header */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                      <span className="bg-purple-600 text-white font-bold px-3 py-1 rounded-lg">
                        {index + 1}
                      </span>
                      <input
                        value={student.identifier}
                        onChange={(e) => updateStudentData(index, 'identifier', e.target.value)}
                        placeholder="Student identifier (e.g., Student A)"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <select
                        value={student.progress}
                        onChange={(e) => updateStudentData(index, 'progress', e.target.value)}
                        className={`px-3 py-2 rounded-lg font-medium ${getProgressBadgeColor(student.progress)}`}
                      >
                        {progressOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Row 1: Basic Info */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Disability Category</label>
                        <select
                          value={student.disabilityCategory}
                          onChange={(e) => updateStudentData(index, 'disabilityCategory', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {disabilityCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Goal Area</label>
                        <select
                          value={student.goalArea}
                          onChange={(e) => updateStudentData(index, 'goalArea', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {goalAreas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">% Goal Achieved</label>
                        <input
                          type="text"
                          value={student.percentGoalAchieved}
                          onChange={(e) => updateStudentData(index, 'percentGoalAchieved', e.target.value)}
                          placeholder="e.g., 65%"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Row 2: Goal & Performance */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Annual Goal *</label>
                        <textarea
                          value={student.annualGoal}
                          onChange={(e) => updateStudentData(index, 'annualGoal', e.target.value)}
                          placeholder="The measurable annual IEP goal..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Baseline Performance</label>
                        <textarea
                          value={student.baseline}
                          onChange={(e) => updateStudentData(index, 'baseline', e.target.value)}
                          placeholder="Performance at the start of the IEP period..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Current Performance *</label>
                        <textarea
                          value={student.currentLevel}
                          onChange={(e) => updateStudentData(index, 'currentLevel', e.target.value)}
                          placeholder="Current performance level with data..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Row 3: Supports */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Interventions/Services</label>
                        <textarea
                          value={student.interventions}
                          onChange={(e) => updateStudentData(index, 'interventions', e.target.value)}
                          placeholder="e.g., Wilson Reading 4x/week, small group instruction..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Accommodations</label>
                        <textarea
                          value={student.accommodations}
                          onChange={(e) => updateStudentData(index, 'accommodations', e.target.value)}
                          placeholder="e.g., Extended time, graphic organizers, preferential seating..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Row 4: Recommendations & Next Steps */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Recommendations</label>
                        <textarea
                          value={student.recommendations}
                          onChange={(e) => updateStudentData(index, 'recommendations', e.target.value)}
                          placeholder="Recommendations for continued progress..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Next Steps</label>
                        <textarea
                          value={student.nextSteps}
                          onChange={(e) => updateStudentData(index, 'nextSteps', e.target.value)}
                          placeholder="Action items with responsible parties..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Next Review Date */}
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-medium text-gray-600">Next Review Date:</label>
                      <input
                        type="date"
                        value={student.nextReviewDate}
                        onChange={(e) => updateStudentData(index, 'nextReviewDate', e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
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
                  Generating report {currentStudent} of {numberOfStudents}...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate All Progress Reports
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
                  <h2 className="text-lg font-semibold text-gray-800">Generated Progress Reports</h2>
                  <p className="text-gray-500 text-sm">{completedUpdates} reports ready • Review before adding to IEP system</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopyAll} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors">
                    📋 Copy All
                  </button>
                  <button onClick={handleExportAll} disabled={exporting} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors">
                    {exporting ? 'Exporting...' : '📄 Export All (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Update Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Update List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Students</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Update Preview/Edit */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800">{generatedUpdates[selectedUpdate]?.identifier}</h3>
                    {generatedUpdates[selectedUpdate] && !generatedUpdates[selectedUpdate].skipped && (
                      <span className={`text-xs px-2 py-0.5 rounded ${getProgressBadgeColor(generatedUpdates[selectedUpdate]?.progress)}`}>
                        {progressOptions.find(p => p.id === generatedUpdates[selectedUpdate]?.progress)?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopyOne(selectedUpdate)} className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium">
                      📋 Copy
                    </button>
                    <button onClick={() => handleExportOne(selectedUpdate)} disabled={exporting} className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium">
                      📄 Export
                    </button>
                  </div>
                </div>
                <textarea
                  value={editedUpdates[selectedUpdate] || ''}
                  onChange={(e) => {
                    const updated = [...editedUpdates]
                    updated[selectedUpdate] = e.target.value
                    setEditedUpdates(updated)
                  }}
                  rows={20}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Always verify accuracy before including in official IEP documents. Replace "[Student Name]" with actual name in your secure system.
                </p>
              </div>
            </div>

            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Student Data
            </button>
          </div>
        )}
      </main>
    </div>
  )
}