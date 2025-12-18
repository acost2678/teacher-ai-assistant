'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function IEPUpdatePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [studentName, setStudentName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [disabilityCategory, setDisabilityCategory] = useState('Specific Learning Disability')
  const [goalArea, setGoalArea] = useState('Reading')
  const [currentGoal, setCurrentGoal] = useState('')
  const [baselineData, setBaselineData] = useState('')
  const [currentProgress, setCurrentProgress] = useState('')
  const [supportProvided, setSupportProvided] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  
  const [generatedUpdate, setGeneratedUpdate] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showExemplar, setShowExemplar] = useState(false)
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

  const handleShowExemplar = () => {
    setStudentName('Michael Chen')
    setGradeLevel('5th Grade')
    setDisabilityCategory('Specific Learning Disability')
    setGoalArea('Reading')
    setCurrentGoal('Michael will read grade-level passages with 90% accuracy and answer comprehension questions with 80% accuracy by the end of the IEP period.')
    setBaselineData('At the start of the IEP period, Michael read at a 3rd grade level with 75% accuracy and answered comprehension questions with 55% accuracy.')
    setCurrentProgress('Michael now reads 4th grade passages with 85% accuracy. His comprehension has improved to 70% accuracy on literal questions and 60% on inferential questions.')
    setSupportProvided('Daily small group reading instruction, graphic organizers, audiobook access, extended time on reading assignments, preferential seating.')
    setNextSteps('Continue with current supports, introduce visualization strategies for comprehension, increase complexity of texts gradually.')
    setShowExemplar(true)
    setGeneratedUpdate('')
  }

  const handleResetExemplar = () => {
    setStudentName('')
    setGradeLevel('3rd Grade')
    setDisabilityCategory('Specific Learning Disability')
    setGoalArea('Reading')
    setCurrentGoal('')
    setBaselineData('')
    setCurrentProgress('')
    setSupportProvided('')
    setNextSteps('')
    setShowExemplar(false)
    setGeneratedUpdate('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!studentName || !currentGoal || !currentProgress) {
      alert('Please enter student name, current goal, and progress notes')
      return
    }
    
    setGenerating(true)
    setGeneratedUpdate('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-iep-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          gradeLevel,
          disabilityCategory,
          goalArea,
          currentGoal,
          baselineData,
          currentProgress,
          supportProvided,
          nextSteps,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedUpdate(data.update)
        await handleSave(data.update)
      }
    } catch (error) {
      alert('Error generating IEP update. Please try again.')
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
          title: `IEP Update: ${studentName}`,
          toolType: 'iep-update',
          toolName: 'IEP Update',
          content,
          metadata: { studentName, gradeLevel, disabilityCategory, goalArea },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedUpdate) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `IEP Update - ${studentName}`,
          content: generatedUpdate,
          toolName: 'IEP Update'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `IEP_Update_${studentName.replace(/\s+/g, '_')}.docx`
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
    navigator.clipboard.writeText(generatedUpdate)
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
            <span className="text-gray-800 font-medium">IEP Update</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">IEP Update</h1>
              <p className="text-gray-500">Create IDEA-compliant IEP goal progress updates.</p>
            </div>
            <div className="flex items-center gap-3">
              {showExemplar && (
                <button onClick={handleResetExemplar} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowExemplar} className={`text-sm font-medium transition-colors ${showExemplar ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                Show exemplar
              </button>
            </div>
          </div>

          {showExemplar && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Exemplar is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in example inputs and generated an example output.</p>
                </div>
                <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  Scroll to view output
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name: *</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student's name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level:</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disability Category:</label>
              <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Specific Learning Disability', 'Speech/Language Impairment', 'Other Health Impairment', 'Autism', 'Emotional Disturbance', 'Intellectual Disability', 'Multiple Disabilities', 'Hearing Impairment', 'Visual Impairment', 'Orthopedic Impairment', 'Traumatic Brain Injury', 'Developmental Delay'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal Area:</label>
              <select value={goalArea} onChange={(e) => setGoalArea(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Reading', 'Writing', 'Math', 'Communication', 'Social/Emotional', 'Behavior', 'Fine Motor', 'Gross Motor', 'Daily Living Skills', 'Transition'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current IEP Goal: *</label>
            <textarea value={currentGoal} onChange={(e) => setCurrentGoal(e.target.value)} placeholder="Paste or type the current IEP goal..."
              rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Baseline Data:</label>
            <textarea value={baselineData} onChange={(e) => setBaselineData(e.target.value)} placeholder="Where was the student at the start of the IEP period?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Progress: *</label>
            <textarea value={currentProgress} onChange={(e) => setCurrentProgress(e.target.value)} placeholder="Describe current performance data, observations, and progress toward the goal..."
              rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Supports & Services Provided:</label>
            <textarea value={supportProvided} onChange={(e) => setSupportProvided(e.target.value)} placeholder="What accommodations, modifications, and services are being provided?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps/Recommendations:</label>
            <textarea value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} placeholder="What changes or continued supports are recommended?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <button onClick={handleGenerate} disabled={generating || !studentName || !currentGoal || !currentProgress}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated IEP Update</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedUpdate && (
              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export .docx'}
                </button>
              </div>
            )}
          </div>

          {generatedUpdate ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedUpdate}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-gray-400">Your generated IEP update will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}