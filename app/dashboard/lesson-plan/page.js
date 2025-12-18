'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function LessonPlanPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Form state
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('45 minutes')
  const [standardsFramework, setStandardsFramework] = useState('common-core')
  const [includeStandardCodes, setIncludeStandardCodes] = useState(true)
  const [customStandards, setCustomStandards] = useState('')
  const [learningObjectives, setLearningObjectives] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [materials, setMaterials] = useState('')
  const [includeSEL, setIncludeSEL] = useState(false)
  const [selCompetencies, setSelCompetencies] = useState([])
  const [differentiationNeeds, setDifferentiationNeeds] = useState('')
  const [assessmentType, setAssessmentType] = useState('formative')
  const [uploadedContent, setUploadedContent] = useState('')
  
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [verification, setVerification] = useState({
    standardsCorrect: false,
    objectivesMatch: false,
    gradeAppropriate: false,
    reviewedContent: false,
  })
  const [feedback, setFeedback] = useState({
    standards: '',
    objectives: '',
    gradeLevel: '',
    content: '',
  })
  const [showFeedback, setShowFeedback] = useState({
    standards: false,
    objectives: false,
    gradeLevel: false,
    content: false,
  })
  const [regenerating, setRegenerating] = useState(false)
  const router = useRouter()

  const selOptions = [
    { id: 'self-awareness', label: 'Self-Awareness', description: 'Recognizing emotions, goals, values' },
    { id: 'self-management', label: 'Self-Management', description: 'Regulating emotions & behaviors' },
    { id: 'social-awareness', label: 'Social Awareness', description: 'Empathy & perspective-taking' },
    { id: 'relationship-skills', label: 'Relationship Skills', description: 'Communication & cooperation' },
    { id: 'responsible-decision-making', label: 'Responsible Decision-Making', description: 'Ethical choices' },
  ]

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleSelToggle = (competencyId) => {
    if (selCompetencies.includes(competencyId)) {
      setSelCompetencies(selCompetencies.filter(c => c !== competencyId))
    } else {
      setSelCompetencies([...selCompetencies, competencyId])
    }
  }

  const handleGenerate = async () => {
    if (!topic) {
      alert('Please enter a topic for the lesson')
      return
    }
    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)
    setVerification({ standardsCorrect: false, objectivesMatch: false, gradeAppropriate: false, reviewedContent: false })

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, duration, standardsFramework,
          includeStandardCodes, customStandards, learningObjectives, priorKnowledge, materials,
          includeSEL, selCompetencies: includeSEL ? selCompetencies : [],
          differentiationNeeds, assessmentType, uploadedContent,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedPlan(data.lessonPlan); await handleSave(data.lessonPlan) }
    } catch (error) { alert('Error generating lesson plan. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      const selLabel = includeSEL && selCompetencies.length > 0 ? ' (SEL)' : ''
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Lesson: ${topic}${selLabel}`,
          toolType: 'lesson-plan',
          toolName: 'Lesson Plan',
          content,
          metadata: { gradeLevel, subject, topic, standardsFramework, includeSEL, selCompetencies },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedPlan) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Lesson Plan - ${topic}`, content: generatedPlan, toolName: 'Lesson Plan' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Lesson_Plan_${topic.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedPlan); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const handleRegenerate = async () => {
    // Collect all feedback
    const feedbackItems = []
    if (feedback.standards) feedbackItems.push(`Standards issue: ${feedback.standards}`)
    if (feedback.objectives) feedbackItems.push(`Objectives issue: ${feedback.objectives}`)
    if (feedback.gradeLevel) feedbackItems.push(`Grade-level issue: ${feedback.gradeLevel}`)
    if (feedback.content) feedbackItems.push(`Content issue: ${feedback.content}`)

    if (feedbackItems.length === 0) {
      alert('Please describe what needs to be fixed')
      return
    }

    setRegenerating(true)
    setSaved(false)
    setVerification({ standardsCorrect: false, objectivesMatch: false, gradeAppropriate: false, reviewedContent: false })

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, subject, topic, duration, standardsFramework,
          includeStandardCodes, customStandards, learningObjectives, priorKnowledge, materials,
          includeSEL, selCompetencies: includeSEL ? selCompetencies : [],
          differentiationNeeds, assessmentType,
          previousPlan: generatedPlan,
          feedbackToFix: feedbackItems.join('\n'),
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { 
        setGeneratedPlan(data.lessonPlan)
        await handleSave(data.lessonPlan)
        // Clear feedback after successful regeneration
        setFeedback({ standards: '', objectives: '', gradeLevel: '', content: '' })
        setShowFeedback({ standards: false, objectives: false, gradeLevel: false, content: false })
      }
    } catch (error) { alert('Error regenerating lesson plan. Please try again.') }
    setRegenerating(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Lesson Plan Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Lesson Details</h2>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level *</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 
                    'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => 
                    <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Topic/Unit *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                placeholder="e.g., Introduction to Fractions, The Water Cycle, Persuasive Writing" />
            </div>

            {/* File Upload */}
            <FileUpload
              onContentExtracted={setUploadedContent}
              label="Upload Reference Materials (Optional)"
              helpText="Upload curriculum guides, previous lessons, or standards documents to improve accuracy"
              placeholder="Paste content from your curriculum guide, textbook chapter, or previous lesson plan..."
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  {['30 minutes', '45 minutes', '60 minutes', '90 minutes', '2 hours', 'Multi-day'].map(d => 
                    <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Assessment Type</label>
                <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  <option value="formative">Formative (ongoing)</option>
                  <option value="summative">Summative (end of unit)</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Standards */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Standards Framework</label>
              <select value={standardsFramework} onChange={(e) => setStandardsFramework(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                <option value="common-core">Common Core State Standards (CCSS)</option>
                <option value="ngss">Next Generation Science Standards (NGSS)</option>
                <option value="texas-teks">Texas TEKS</option>
                <option value="virginia-sol">Virginia SOLs</option>
                <option value="california">California State Standards</option>
                <option value="florida-best">Florida B.E.S.T. Standards</option>
                <option value="new-york">New York State Standards</option>
              </select>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input type="checkbox" id="includeStandardCodes" checked={includeStandardCodes}
                onChange={(e) => setIncludeStandardCodes(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
              <label htmlFor="includeStandardCodes" className="text-gray-700">Include standard codes in lesson plan</label>
            </div>

            {/* Paste Your Standards */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-gray-800 font-medium mb-2">📋 Paste Your Standards (Recommended)</label>
              <p className="text-sm text-gray-600 mb-2">
                For best accuracy, paste the exact standards you want this lesson to address. 
                The AI will use these instead of generating from memory.
              </p>
              <textarea value={customStandards} onChange={(e) => setCustomStandards(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 h-24"
                placeholder="Example:
CCSS.ELA-LITERACY.RL.3.1: Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.

CCSS.ELA-LITERACY.RL.3.3: Describe characters in a story and explain how their actions contribute to the sequence of events." />
            </div>

            {/* SEL Integration */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" id="includeSEL" checked={includeSEL}
                  onChange={(e) => setIncludeSEL(e.target.checked)} className="w-5 h-5 text-green-600 rounded" />
                <label htmlFor="includeSEL" className="text-gray-800 font-medium">Include CASEL SEL Integration</label>
              </div>
              
              {includeSEL && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600 mb-2">Select competencies to integrate:</p>
                  {selOptions.map(sel => (
                    <div key={sel.id} className="flex items-start gap-2">
                      <input type="checkbox" id={sel.id} checked={selCompetencies.includes(sel.id)}
                        onChange={() => handleSelToggle(sel.id)} className="w-4 h-4 mt-1 text-green-600 rounded" />
                      <label htmlFor={sel.id} className="text-sm">
                        <span className="font-medium text-gray-800">{sel.label}</span>
                        <span className="text-gray-500"> - {sel.description}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Learning Objectives (optional)</label>
              <textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 h-16"
                placeholder="What should students know/do by the end?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Prior Knowledge (optional)</label>
              <textarea value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 h-16"
                placeholder="What do students already know?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Materials Available (optional)</label>
              <textarea value={materials} onChange={(e) => setMaterials(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 h-16"
                placeholder="What materials/technology do you have?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Differentiation Needs (optional)</label>
              <textarea value={differentiationNeeds} onChange={(e) => setDifferentiationNeeds(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 h-16"
                placeholder="Any specific student needs? (ELL, IEP, gifted, etc.)" />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Lesson Plan'}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Standards-aligned {includeSEL ? '• CASEL SEL Integrated' : ''}
            </p>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Lesson Plan</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedPlan && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedPlan ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[50vh]">
                {generatedPlan}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="mb-2">Your lesson plan will appear here</p>
                  <p className="text-xs">Standards-aligned with optional SEL integration</p>
                </div>
              </div>
            )}

            {/* Verification Checklist */}
            {generatedPlan && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-bold text-gray-800 mb-3">✅ Teacher Verification Checklist</h3>
                <p className="text-sm text-gray-600 mb-3">
                  AI-generated content should always be reviewed. Please verify before using:
                </p>
                <div className="space-y-3">
                  {/* Standards Verification */}
                  <div className="border-b border-amber-200 pb-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={verification.standardsCorrect}
                        onChange={(e) => { setVerification({...verification, standardsCorrect: e.target.checked}); if(e.target.checked) setShowFeedback({...showFeedback, standards: false}) }}
                        className="w-4 h-4 mt-1 text-amber-600 rounded" />
                      <span className="text-sm text-gray-700">
                        <strong>Standards are accurate</strong> - I've verified the standard codes exist and match my curriculum
                      </span>
                    </label>
                    {!verification.standardsCorrect && (
                      <div className="ml-6 mt-2">
                        {!showFeedback.standards ? (
                          <button onClick={() => setShowFeedback({...showFeedback, standards: true})}
                            className="text-xs text-amber-700 hover:text-amber-900 underline">
                            ⚠️ Can't verify? Tell AI what's wrong
                          </button>
                        ) : (
                          <input type="text" value={feedback.standards} onChange={(e) => setFeedback({...feedback, standards: e.target.value})}
                            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                            placeholder="e.g., Standard code CCSS.ELA.3.1 doesn't exist, use RL.3.1 instead" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Objectives Verification */}
                  <div className="border-b border-amber-200 pb-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={verification.objectivesMatch}
                        onChange={(e) => { setVerification({...verification, objectivesMatch: e.target.checked}); if(e.target.checked) setShowFeedback({...showFeedback, objectives: false}) }}
                        className="w-4 h-4 mt-1 text-amber-600 rounded" />
                      <span className="text-sm text-gray-700">
                        <strong>Objectives align</strong> - Learning objectives match what I want students to achieve
                      </span>
                    </label>
                    {!verification.objectivesMatch && (
                      <div className="ml-6 mt-2">
                        {!showFeedback.objectives ? (
                          <button onClick={() => setShowFeedback({...showFeedback, objectives: true})}
                            className="text-xs text-amber-700 hover:text-amber-900 underline">
                            ⚠️ Can't verify? Tell AI what's wrong
                          </button>
                        ) : (
                          <input type="text" value={feedback.objectives} onChange={(e) => setFeedback({...feedback, objectives: e.target.value})}
                            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                            placeholder="e.g., Need objective about comparing fractions, not just identifying them" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grade Level Verification */}
                  <div className="border-b border-amber-200 pb-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={verification.gradeAppropriate}
                        onChange={(e) => { setVerification({...verification, gradeAppropriate: e.target.checked}); if(e.target.checked) setShowFeedback({...showFeedback, gradeLevel: false}) }}
                        className="w-4 h-4 mt-1 text-amber-600 rounded" />
                      <span className="text-sm text-gray-700">
                        <strong>Grade-level appropriate</strong> - Content and activities are suitable for my students
                      </span>
                    </label>
                    {!verification.gradeAppropriate && (
                      <div className="ml-6 mt-2">
                        {!showFeedback.gradeLevel ? (
                          <button onClick={() => setShowFeedback({...showFeedback, gradeLevel: true})}
                            className="text-xs text-amber-700 hover:text-amber-900 underline">
                            ⚠️ Can't verify? Tell AI what's wrong
                          </button>
                        ) : (
                          <input type="text" value={feedback.gradeLevel} onChange={(e) => setFeedback({...feedback, gradeLevel: e.target.value})}
                            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                            placeholder="e.g., Activities are too advanced, simplify for 3rd graders" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Review Verification */}
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={verification.reviewedContent}
                        onChange={(e) => { setVerification({...verification, reviewedContent: e.target.checked}); if(e.target.checked) setShowFeedback({...showFeedback, content: false}) }}
                        className="w-4 h-4 mt-1 text-amber-600 rounded" />
                      <span className="text-sm text-gray-700">
                        <strong>Reviewed full content</strong> - I've read through the entire lesson plan
                      </span>
                    </label>
                    {!verification.reviewedContent && (
                      <div className="ml-6 mt-2">
                        {!showFeedback.content ? (
                          <button onClick={() => setShowFeedback({...showFeedback, content: true})}
                            className="text-xs text-amber-700 hover:text-amber-900 underline">
                            ⚠️ Found issues? Tell AI what's wrong
                          </button>
                        ) : (
                          <input type="text" value={feedback.content} onChange={(e) => setFeedback({...feedback, content: e.target.value})}
                            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                            placeholder="e.g., Need more hands-on activities, less lecture time" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Regenerate Button */}
                {(feedback.standards || feedback.objectives || feedback.gradeLevel || feedback.content) && (
                  <div className="mt-4">
                    <button onClick={handleRegenerate} disabled={regenerating}
                      className="w-full bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm">
                      {regenerating ? 'Regenerating...' : '🔄 Regenerate with Fixes'}
                    </button>
                  </div>
                )}

                {Object.values(verification).every(v => v) && (
                  <div className="mt-3 p-2 bg-green-100 rounded text-green-800 text-sm text-center">
                    ✅ All items verified - Lesson plan ready to use!
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}