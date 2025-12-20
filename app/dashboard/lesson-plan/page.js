'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function LessonPlanPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('45 minutes')
  const [standardsFramework, setStandardsFramework] = useState('Common Core')
  const [specificStandards, setSpecificStandards] = useState('')
  const [learningObjectives, setLearningObjectives] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [materials, setMaterials] = useState('')
  const [differentiationNeeds, setDifferentiationNeeds] = useState('')
  const [assessmentType, setAssessmentType] = useState('Exit Ticket')
  
  const [generatedPlan, setGeneratedPlan] = useState('')
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
    setGradeLevel('4th Grade')
    setSubject('Mathematics')
    setTopic('Introduction to Fractions - Understanding Parts of a Whole')
    setDuration('60 minutes')
    setStandardsFramework('Common Core')
    setSpecificStandards('4.NF.A.1 - Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b)')
    setLearningObjectives('Students will be able to identify fractions as parts of a whole and represent fractions using visual models with 80% accuracy.')
    setPriorKnowledge('Students can divide shapes into equal parts, understand basic division concepts.')
    setMaterials('Fraction circles, paper plates, markers, worksheet, interactive whiteboard')
    setDifferentiationNeeds('3 ELL students need visual supports, 2 students have IEPs for extended time, 4 advanced students ready for equivalent fractions')
    setAssessmentType('Exit Ticket')
    setShowDemo(true)
    setGeneratedPlan('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setTopic('')
    setDuration('45 minutes')
    setStandardsFramework('Common Core')
    setSpecificStandards('')
    setLearningObjectives('')
    setPriorKnowledge('')
    setMaterials('')
    setDifferentiationNeeds('')
    setAssessmentType('Exit Ticket')
    setShowDemo(false)
    setGeneratedPlan('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!topic) {
      alert('Please enter a topic')
      return
    }
    
    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          subject,
          topic,
          duration,
          standardsFramework,
          specificStandards,
          learningObjectives,
          priorKnowledge,
          materials,
          differentiationNeeds,
          assessmentType,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedPlan(data.lessonPlan)
        await handleSave(data.lessonPlan)
      }
    } catch (error) {
      alert('Error generating lesson plan. Please try again.')
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
          title: `Lesson Plan: ${topic}`,
          toolType: 'lesson-plan',
          toolName: 'Lesson Plan',
          content,
          metadata: { gradeLevel, subject, topic, duration },
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
          title: `Lesson Plan - ${topic}`,
          content: generatedPlan,
          toolName: 'Lesson Plan'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Lesson_Plan_${topic.replace(/\s+/g, '_')}.docx`
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
            <span className="text-gray-800 font-medium">Lesson Plan</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Lesson Plan</h1>
              <p className="text-gray-500">Create standards-aligned lesson plans with differentiation built in.</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Title: *</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Introduction to Fractions, Persuasive Writing, The Water Cycle"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration:</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['30 minutes', '45 minutes', '60 minutes', '90 minutes', '2 hours', 'Multi-day'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standards Framework:</label>
              <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Common Core', 'NGSS', 'State Standards', 'IB', 'AP', 'Custom'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Specific Standards (optional):</label>
            <textarea value={specificStandards} onChange={(e) => setSpecificStandards(e.target.value)} placeholder="Paste specific standard codes and descriptions..."
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives:</label>
            <textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} placeholder="What should students know or be able to do by the end?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prior Knowledge:</label>
            <textarea value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)} placeholder="What should students already know before this lesson?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Materials Needed:</label>
            <textarea value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="List materials, technology, handouts, etc."
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Differentiation Needs:</label>
            <textarea value={differentiationNeeds} onChange={(e) => setDifferentiationNeeds(e.target.value)} placeholder="ELL students, IEP accommodations, gifted learners, etc."
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type:</label>
            <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
              {['Exit Ticket', 'Quiz', 'Discussion', 'Project', 'Observation', 'Peer Assessment', 'Self-Assessment', 'Performance Task'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={generating || !topic}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Lesson Plan</h2>
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
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-400">Your generated lesson plan will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}