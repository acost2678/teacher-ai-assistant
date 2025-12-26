'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function LessonPlanPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Basic Info
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('45 minutes')
  
  // Standards
  const [standardsFramework, setStandardsFramework] = useState('common-core')
  const [includeStandardCodes, setIncludeStandardCodes] = useState(true)
  const [customStandards, setCustomStandards] = useState('')
  
  // Lesson Details
  const [learningObjectives, setLearningObjectives] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [materials, setMaterials] = useState('')
  const [differentiationNeeds, setDifferentiationNeeds] = useState('')
  const [assessmentType, setAssessmentType] = useState('Exit Ticket')
  
  // SEL Integration
  const [includeSEL, setIncludeSEL] = useState(false)
  const [selCompetencies, setSelCompetencies] = useState([])
  
  // Upload & Regenerate
  const [uploadedContent, setUploadedContent] = useState('')
  const [previousPlan, setPreviousPlan] = useState('')
  const [feedbackToFix, setFeedbackToFix] = useState('')
  const [showRegenerateSection, setShowRegenerateSection] = useState(false)
  
  // Output
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  const outputRef = useRef(null)
  const router = useRouter()

  const selCompetencyOptions = [
    { id: 'self-awareness', label: 'Self-Awareness', description: 'Recognizing emotions, personal goals, and values' },
    { id: 'self-management', label: 'Self-Management', description: 'Regulating emotions, thoughts, and behaviors' },
    { id: 'social-awareness', label: 'Social Awareness', description: 'Understanding diverse perspectives and empathy' },
    { id: 'relationship-skills', label: 'Relationship Skills', description: 'Communication, cooperation, and conflict resolution' },
    { id: 'responsible-decision-making', label: 'Responsible Decision-Making', description: 'Making ethical, constructive choices' },
  ]

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

  const handleSelCompetencyToggle = (competencyId) => {
    setSelCompetencies(prev => 
      prev.includes(competencyId)
        ? prev.filter(c => c !== competencyId)
        : [...prev, competencyId]
    )
  }

  const handleShowDemo = () => {
    setGradeLevel('4th Grade')
    setSubject('Mathematics')
    setTopic('Introduction to Fractions - Understanding Parts of a Whole')
    setDuration('60 minutes')
    setStandardsFramework('common-core')
    setIncludeStandardCodes(true)
    setCustomStandards('4.NF.A.1 - Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b)')
    setLearningObjectives('Students will be able to identify fractions as parts of a whole and represent fractions using visual models with 80% accuracy.')
    setPriorKnowledge('Students can divide shapes into equal parts, understand basic division concepts.')
    setMaterials('Fraction circles, paper plates, markers, worksheet, interactive whiteboard')
    setDifferentiationNeeds('3 ELL students need visual supports, 2 students have IEPs for extended time, 4 advanced students ready for equivalent fractions')
    setAssessmentType('Exit Ticket')
    setIncludeSEL(true)
    setSelCompetencies(['self-awareness', 'self-management'])
    setShowDemo(true)
    setGeneratedPlan('')
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setSubject('English Language Arts')
    setTopic('')
    setDuration('45 minutes')
    setStandardsFramework('common-core')
    setIncludeStandardCodes(true)
    setCustomStandards('')
    setLearningObjectives('')
    setPriorKnowledge('')
    setMaterials('')
    setDifferentiationNeeds('')
    setAssessmentType('Exit Ticket')
    setIncludeSEL(false)
    setSelCompetencies([])
    setUploadedContent('')
    setPreviousPlan('')
    setFeedbackToFix('')
    setShowRegenerateSection(false)
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
          includeStandardCodes,
          customStandards,
          learningObjectives,
          priorKnowledge,
          materials,
          includeSEL,
          selCompetencies,
          differentiationNeeds,
          assessmentType,
          previousPlan: showRegenerateSection ? previousPlan : null,
          feedbackToFix: showRegenerateSection ? feedbackToFix : null,
          uploadedContent,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedPlan(data.lessonPlan)
        setPreviousPlan(data.lessonPlan)
        await handleSave(data.lessonPlan)
        scrollToOutput()
      }
    } catch (error) {
      alert('Error generating lesson plan. Please try again.')
    }
    
    setGenerating(false)
  }

  const handleRegenerate = () => {
    setShowRegenerateSection(true)
    setPreviousPlan(generatedPlan)
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
          metadata: { gradeLevel, subject, topic, duration, includeSEL, selCompetencies },
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
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📖</span>
                <h1 className="text-2xl font-semibold text-gray-800">Lesson Plan</h1>
              </div>
              <p className="text-gray-500">Create standards-aligned lesson plans with SEL integration and differentiation.</p>
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
                  <p className="text-purple-600 text-sm">Example: 4th Grade Math with SEL integration (Self-Awareness & Self-Management).</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          {/* Basic Info */}
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level *</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic/Title *</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} 
              placeholder="e.g., Introduction to Fractions, Persuasive Writing, The Water Cycle"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                {['30 minutes', '45 minutes', '60 minutes', '90 minutes', '2 hours', 'Multi-day'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
              <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                {['Exit Ticket', 'Quiz', 'Discussion', 'Project', 'Observation', 'Peer Assessment', 'Self-Assessment', 'Performance Task'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Standards Section */}
          <div className="border-t border-gray-100 pt-5 mt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Standards</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standards Framework</label>
                <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  <option value="common-core">Common Core (CCSS)</option>
                  <option value="ngss">NGSS</option>
                  <option value="texas-teks">Texas TEKS</option>
                  <option value="virginia-sol">Virginia SOLs</option>
                  <option value="california">California Standards</option>
                  <option value="florida-best">Florida B.E.S.T.</option>
                  <option value="new-york">New York Standards</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeStandardCodes} onChange={(e) => setIncludeStandardCodes(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                  <span className="text-sm text-gray-700">Include standard codes in plan</span>
                </label>
              </div>
            </div>

            <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">📋 Paste Your Specific Standards (Optional)</label>
              <textarea value={customStandards} onChange={(e) => setCustomStandards(e.target.value)} 
                placeholder="Paste specific standard codes and descriptions here for exact alignment..."
                rows={3} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 resize-none" />
              <p className="text-xs text-blue-600 mt-2">When provided, these exact standards will be used instead of auto-generated ones.</p>
            </div>
          </div>

          {/* Lesson Details */}
          <div className="border-t border-gray-100 pt-5 mt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Lesson Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
              <textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} 
                placeholder="What should students know or be able to do by the end?"
                rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prior Knowledge</label>
              <textarea value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)} 
                placeholder="What should students already know before this lesson?"
                rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Materials Needed</label>
              <textarea value={materials} onChange={(e) => setMaterials(e.target.value)} 
                placeholder="List materials, technology, handouts, etc."
                rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Differentiation Needs</label>
              <textarea value={differentiationNeeds} onChange={(e) => setDifferentiationNeeds(e.target.value)} 
                placeholder="ELL students, IEP accommodations, gifted learners, specific student needs..."
                rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
            </div>
          </div>

          {/* SEL Integration Section */}
          <div className="border-t border-gray-100 pt-5 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">💚 SEL Integration</h2>
                <p className="text-sm text-gray-500">Add CASEL-aligned Social-Emotional Learning to your lesson</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={includeSEL} onChange={(e) => setIncludeSEL(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {includeSEL && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-3">Select the CASEL competencies to integrate:</p>
                <div className="space-y-3">
                  {selCompetencyOptions.map(comp => (
                    <label key={comp.id} className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selCompetencies.includes(comp.id)}
                        onChange={() => handleSelCompetencyToggle(comp.id)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mt-0.5" 
                      />
                      <div>
                        <span className="font-medium text-gray-800">{comp.label}</span>
                        <p className="text-sm text-gray-500">{comp.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {selCompetencies.length > 0 && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">✓ {selCompetencies.length} competencies selected.</span> Your lesson plan will include specific activities, discussion prompts, and reflection questions for each.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reference Materials */}
          <div className="border-t border-gray-100 pt-5 mt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Reference Materials (Optional)</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Paste Content for Reference</label>
              <textarea value={uploadedContent} onChange={(e) => setUploadedContent(e.target.value)} 
                placeholder="Paste textbook content, curriculum guides, or other reference materials here..."
                rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              <p className="text-xs text-gray-500 mt-2">The AI will use this content to ensure accuracy and alignment.</p>
            </div>
          </div>

          {/* Regenerate Section */}
          {showRegenerateSection && (
            <div className="border-t border-gray-100 pt-5 mt-5">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h3 className="text-amber-800 font-medium mb-2">🔄 Regenerate with Feedback</h3>
                <p className="text-sm text-amber-700 mb-3">Tell us what to fix in the previous plan:</p>
                <textarea value={feedbackToFix} onChange={(e) => setFeedbackToFix(e.target.value)} 
                  placeholder="e.g., Make the hook more engaging, add more scaffolding for ELL students, include a hands-on activity..."
                  rows={3} className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={generating || !topic}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (
              <><span className="animate-spin">⏳</span>Generating...</>
            ) : showRegenerateSection ? (
              <><span>🔄</span>Regenerate with Feedback</>
            ) : (
              <><span>✨</span>Generate Lesson Plan</>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Lesson Plan</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedPlan && (
              <div className="flex items-center gap-3">
                <button onClick={handleRegenerate} className="text-sm text-amber-600 hover:text-amber-700 font-medium">🔄 Regenerate</button>
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export .docx'}
                </button>
              </div>
            )}
          </div>

          {generatedPlan ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedPlan}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📖</div>
                <p className="text-gray-400">Your generated lesson plan will appear here</p>
                {includeSEL && selCompetencies.length > 0 && (
                  <p className="text-green-500 text-sm mt-2">💚 SEL integration enabled ({selCompetencies.length} competencies)</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}