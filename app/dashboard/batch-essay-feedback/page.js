'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BatchEssayFeedbackPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(0)
  const [exporting, setExporting] = useState(false)
  
  // Settings
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [assignmentType, setAssignmentType] = useState('persuasive')
  const [feedbackTemplate, setFeedbackTemplate] = useState('glow-grow')
  const [tone, setTone] = useState('encouraging')
  const [rubric, setRubric] = useState('')
  const [focusAreas, setFocusAreas] = useState([])
  
  // Students data - privacy-first
  const [numberOfStudents, setNumberOfStudents] = useState(5)
  const [studentEssays, setStudentEssays] = useState([])
  const [generatedFeedback, setGeneratedFeedback] = useState([])
  
  const [activeTab, setActiveTab] = useState('setup') // 'setup' | 'essays' | 'review'
  const [selectedFeedback, setSelectedFeedback] = useState(0)
  const [editedFeedback, setEditedFeedback] = useState([])
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

  // Initialize student essays array when number changes
  useEffect(() => {
    if (!showDemo) {
      setStudentEssays(prev => {
        const newEssays = [...prev]
        while (newEssays.length < numberOfStudents) {
          newEssays.push({ identifier: `Student ${newEssays.length + 1}`, essay: '' })
        }
        return newEssays.slice(0, numberOfStudents)
      })
    }
  }, [numberOfStudents, showDemo])

  const feedbackTemplates = [
    { id: 'glow-grow', name: 'Glow & Grow', desc: '2 strengths + 2 areas for improvement', icon: '✨' },
    { id: 'rubric-aligned', name: 'Rubric-Aligned', desc: 'Feedback organized by your rubric criteria', icon: '📊' },
    { id: 'paragraph-by-paragraph', name: 'Paragraph-by-Paragraph', desc: 'Detailed comments on each section', icon: '📝' },
    { id: 'revision-roadmap', name: 'Revision Roadmap', desc: '3 specific next steps with examples', icon: '🗺️' },
    { id: 'conference-notes', name: 'Conference Notes', desc: 'Talking points for 1:1 student meetings', icon: '💬' },
    { id: 'socratic', name: 'Socratic Questions', desc: 'Questions to guide student self-reflection', icon: '❓' },
  ]

  const assignmentTypes = [
    { id: 'persuasive', name: 'Persuasive/Argumentative' },
    { id: 'narrative', name: 'Narrative/Personal' },
    { id: 'expository', name: 'Expository/Informational' },
    { id: 'literary-analysis', name: 'Literary Analysis' },
    { id: 'research', name: 'Research Paper' },
    { id: 'compare-contrast', name: 'Compare & Contrast' },
    { id: 'descriptive', name: 'Descriptive' },
    { id: 'response', name: 'Reading Response' },
  ]

  const allFocusAreas = [
    { id: 'ideas', name: 'Ideas & Content', desc: 'Main idea, details, focus' },
    { id: 'organization', name: 'Organization', desc: 'Structure, transitions, flow' },
    { id: 'voice', name: 'Voice', desc: 'Tone, personality, audience awareness' },
    { id: 'word-choice', name: 'Word Choice', desc: 'Vocabulary, precision, variety' },
    { id: 'sentence-fluency', name: 'Sentence Fluency', desc: 'Rhythm, variety, flow' },
    { id: 'conventions', name: 'Conventions', desc: 'Grammar, spelling, punctuation' },
    { id: 'evidence', name: 'Evidence & Support', desc: 'Facts, quotes, examples' },
    { id: 'thesis', name: 'Thesis & Argument', desc: 'Claim, reasoning, logic' },
  ]

  const toggleFocusArea = (areaId) => {
    setFocusAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setAssignmentType('persuasive')
    setFeedbackTemplate('glow-grow')
    setTone('encouraging')
    setRubric(`4 - Excellent: Clear thesis, strong evidence, well-organized, few errors
3 - Proficient: Clear thesis, adequate evidence, organized, some errors
2 - Developing: Unclear thesis, limited evidence, some organization issues, multiple errors
1 - Beginning: Missing thesis, little/no evidence, disorganized, many errors`)
    setFocusAreas(['ideas', 'organization', 'evidence'])
    setNumberOfStudents(2)
    setStudentEssays([
      { 
        identifier: 'Student A', 
        essay: `I think school uniforms should be required at our school. There are many reasons why.

First, uniforms make things more equal. Some kids have nice clothes and some don't. With uniforms everyone looks the same and no one gets made fun of for what they wear.

Second, uniforms help students focus on learning. When you don't have to worry about what to wear, you can think about school more. My cousin goes to a uniform school and she says mornings are easier.

Some people say uniforms are too expensive. But regular clothes cost money too. And you can wear uniforms for a whole year.

In conclusion, school uniforms are good because they make things equal and help students focus. Our school should have them.`
      },
      { 
        identifier: 'Student B', 
        essay: `School uniforms are bad. I hate them. Nobody should have to wear them.

Uniforms are boring. You cant show your personality. Everyone looks like clones. Its dumb.

Also they cost alot of money. My mom said there expensive. We already have clothes at home why buy more.

Some teachers say uniforms help learning but thats not true. I can learn fine in my regular clothes. 

Uniforms are the worst idea ever. Schools should not have them because there boring and expensive. Let kids be kids.`
      },
    ])
    setGeneratedFeedback([])
    setActiveTab('setup')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setAssignmentType('persuasive')
    setFeedbackTemplate('glow-grow')
    setTone('encouraging')
    setRubric('')
    setFocusAreas([])
    setNumberOfStudents(5)
    setStudentEssays([])
    setGeneratedFeedback([])
    setActiveTab('setup')
    setShowDemo(false)
  }

  const updateStudentEssay = (index, field, value) => {
    setStudentEssays(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleGenerate = async () => {
    // Validate
    const hasEssays = studentEssays.some(s => s.essay.trim().length > 50)
    if (!hasEssays) {
      alert('Please enter at least one essay (minimum 50 characters)')
      return
    }

    setGenerating(true)
    setGeneratedFeedback([])
    setCurrentStudent(0)

    try {
      const feedback = []
      
      for (let i = 0; i < studentEssays.length; i++) {
        setCurrentStudent(i + 1)
        
        const student = studentEssays[i]
        // Skip students with no essay
        if (!student.essay || student.essay.trim().length < 50) {
          feedback.push({
            identifier: student.identifier,
            feedback: '[No essay provided or too short - skipped]',
            skipped: true
          })
          continue
        }

        const response = await fetch('/api/batch-essay-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gradeLevel,
            assignmentType,
            feedbackTemplate,
            tone,
            rubric,
            focusAreas,
            studentIdentifier: student.identifier,
            essay: student.essay,
          }),
        })

        const data = await response.json()
        
        if (data.error) {
          feedback.push({
            identifier: student.identifier,
            feedback: `[Error generating feedback: ${data.error}]`,
            error: true
          })
        } else {
          feedback.push({
            identifier: student.identifier,
            feedback: data.feedback,
            skipped: false,
            error: false
          })
        }
      }

      setGeneratedFeedback(feedback)
      setEditedFeedback(feedback.map(f => f.feedback))
      setActiveTab('review')
      setSelectedFeedback(0)
      
    } catch (error) {
      alert('Error generating feedback. Please try again.')
    }

    setGenerating(false)
    setCurrentStudent(0)
  }

  const handleExportAll = async () => {
    if (generatedFeedback.length === 0) return
    setExporting(true)

    try {
      let combinedContent = `ESSAY FEEDBACK - ${assignmentTypes.find(a => a.id === assignmentType)?.name || assignmentType}\n`
      combinedContent += `Template: ${feedbackTemplates.find(t => t.id === feedbackTemplate)?.name || feedbackTemplate}\n`
      combinedContent += `Grade Level: ${gradeLevel}\n`
      combinedContent += `Generated: ${new Date().toLocaleDateString()}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      generatedFeedback.forEach((item, index) => {
        if (!item.skipped && !item.error) {
          combinedContent += `--- ${item.identifier} ---\n\n`
          combinedContent += editedFeedback[index] || item.feedback
          combinedContent += `\n\n${'='.repeat(60)}\n\n`
        }
      })

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Essay Feedback - ${assignmentType}`,
          content: combinedContent,
          toolName: 'Batch Essay Feedback'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Essay_Feedback_${assignmentType}_${new Date().toISOString().split('T')[0]}.docx`
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
    navigator.clipboard.writeText(editedFeedback[index] || generatedFeedback[index]?.feedback)
    alert('Feedback copied to clipboard!')
  }

  const handleCopyAll = () => {
    let combinedContent = ''
    generatedFeedback.forEach((item, index) => {
      if (!item.skipped && !item.error) {
        combinedContent += `--- ${item.identifier} ---\n\n`
        combinedContent += editedFeedback[index] || item.feedback
        combinedContent += `\n\n---\n\n`
      }
    })
    navigator.clipboard.writeText(combinedContent)
    alert('All feedback copied to clipboard!')
  }

  const completedFeedback = generatedFeedback.filter(f => !f.skipped && !f.error).length

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
            <span className="text-gray-800 font-medium">Batch Essay Feedback</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">✍️</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch Essay Feedback</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Generate specific, rubric-aligned feedback for your entire class. Uses YOUR rubric and feedback style.</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Essays are processed for feedback only - never stored. Use identifiers like "Student 1". Add real names after downloading.</p>
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
            onClick={() => setActiveTab('setup')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'setup'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. Setup
          </button>
          <button
            onClick={() => setActiveTab('essays')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'essays'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            2. Enter Essays
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedFeedback.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            3. Review {completedFeedback > 0 && `(${completedFeedback})`}
          </button>
        </div>

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            {/* Feedback Template Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Feedback Template</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {feedbackTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setFeedbackTemplate(template.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      feedbackTemplate === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{template.icon}</span>
                      <span className="font-medium text-gray-800">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{template.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Assignment Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                  <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {assignmentTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="encouraging">Encouraging & Supportive</option>
                    <option value="direct">Direct & Clear</option>
                    <option value="coaching">Coaching & Guiding</option>
                    <option value="strength-based">Strength-Based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                  <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {[5, 10, 15, 20, 25, 30].map(n => (
                      <option key={n} value={n}>{n} students</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Rubric */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Your Rubric (Optional but Recommended)</h2>
                  <p className="text-sm text-gray-500">Paste your rubric criteria for more specific, aligned feedback</p>
                </div>
              </div>
              <textarea
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder={`Example:
4 - Excellent: Clear thesis, strong evidence, well-organized, few errors
3 - Proficient: Clear thesis, adequate evidence, organized, some errors
2 - Developing: Unclear thesis, limited evidence, some organization issues
1 - Beginning: Missing thesis, little evidence, disorganized, many errors`}
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
              />
            </div>

            {/* Focus Areas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Focus Areas (Optional)</h2>
                <p className="text-sm text-gray-500">Select specific areas to emphasize in feedback</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allFocusAreas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => toggleFocusArea(area.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      focusAreas.includes(area.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="font-medium text-gray-800 text-sm">{area.name}</span>
                    <p className="text-xs text-gray-500">{area.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setActiveTab('essays')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors"
            >
              Next: Enter Essays →
            </button>
          </div>
        )}

        {/* Essays Tab */}
        {activeTab === 'essays' && (
          <div className="space-y-6">
            {/* Settings Summary */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-700"><strong>Template:</strong> {feedbackTemplates.find(t => t.id === feedbackTemplate)?.name}</span>
                  <span className="text-purple-700"><strong>Type:</strong> {assignmentTypes.find(a => a.id === assignmentType)?.name}</span>
                  <span className="text-purple-700"><strong>Grade:</strong> {gradeLevel}</span>
                </div>
                <button onClick={() => setActiveTab('setup')} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Edit Settings
                </button>
              </div>
            </div>

            {/* Essay Entries */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Paste Student Essays</h2>
                <span className="text-sm text-gray-500">Paste essay text for each student</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {studentEssays.map((student, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={student.identifier}
                        onChange={(e) => updateStudentEssay(index, 'identifier', e.target.value)}
                        placeholder="Student identifier"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-400">
                        {student.essay.length} characters
                      </span>
                    </div>
                    <textarea
                      value={student.essay}
                      onChange={(e) => updateStudentEssay(index, 'essay', e.target.value)}
                      placeholder="Paste the student's essay here..."
                      rows={6}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
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
                  Generating feedback {currentStudent} of {numberOfStudents}...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate All Feedback
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

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('setup')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Setup
            </button>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && generatedFeedback.length > 0 && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Feedback</h2>
                  <p className="text-gray-500 text-sm">{completedFeedback} essays reviewed • Edit as needed before exporting</p>
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

            {/* Feedback Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Feedback List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Students</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {generatedFeedback.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFeedback(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFeedback === index
                          ? 'bg-purple-100 text-purple-700'
                          : item.skipped || item.error
                          ? 'bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{item.identifier}</span>
                      {item.skipped && <span className="text-xs ml-2">(skipped)</span>}
                      {item.error && <span className="text-xs ml-2 text-red-500">(error)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Preview/Edit */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">
                    Feedback for {generatedFeedback[selectedFeedback]?.identifier}
                  </h3>
                  <button
                    onClick={() => handleCopyOne(selectedFeedback)}
                    className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <textarea
                  value={editedFeedback[selectedFeedback] || ''}
                  onChange={(e) => {
                    const updated = [...editedFeedback]
                    updated[selectedFeedback] = e.target.value
                    setEditedFeedback(updated)
                  }}
                  rows={16}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Review and personalize feedback before returning to students
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('essays')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Essays
            </button>
          </div>
        )}
      </main>
    </div>
  )
}