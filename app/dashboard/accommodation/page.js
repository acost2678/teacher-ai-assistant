'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AccommodationPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [studentNeeds, setStudentNeeds] = useState([])
  const [contentArea, setContentArea] = useState('General')
  const [activityType, setActivityType] = useState('instruction')
  const [specificChallenges, setSpecificChallenges] = useState('')
  const [existingAccommodations, setExistingAccommodations] = useState('')
  const [includeImplementation, setIncludeImplementation] = useState(true)
  const [includeMonitoring, setIncludeMonitoring] = useState(true)
  const [includeParentCommunication, setIncludeParentCommunication] = useState(false)
  
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const outputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleShowDemo = () => {
    setGradeLevel('4th Grade')
    setStudentNeeds(['iep-adhd', 'iep-learning-disability'])
    setContentArea('Math')
    setActivityType('independent')
    setSpecificChallenges('Difficulty staying on task during multi-step math problems, struggles with showing work and organizing calculations on paper')
    setExistingAccommodations('Extended time (1.5x), preferential seating near teacher')
    setIncludeImplementation(true)
    setIncludeMonitoring(true)
    setIncludeParentCommunication(true)
    setShowDemo(true)
    setGeneratedPlan('')
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setStudentNeeds([])
    setContentArea('General')
    setActivityType('instruction')
    setSpecificChallenges('')
    setExistingAccommodations('')
    setIncludeImplementation(true)
    setIncludeMonitoring(true)
    setIncludeParentCommunication(false)
    setShowDemo(false)
    setGeneratedPlan('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleNeed = (need) => {
    if (studentNeeds.includes(need)) {
      setStudentNeeds(studentNeeds.filter(n => n !== need))
    } else {
      setStudentNeeds([...studentNeeds, need])
    }
  }

  const handleGenerate = async () => {
    if (studentNeeds.length === 0) {
      alert('Please select at least one student need')
      return
    }
    
    setGenerating(true)
    setGeneratedPlan('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-accommodation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, studentNeeds, contentArea, activityType,
          specificChallenges, existingAccommodations, includeImplementation,
          includeMonitoring, includeParentCommunication,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedPlan(data.accommodationPlan); await handleSave(data.accommodationPlan) }
    } catch (error) { alert('Error generating plan. Please try again.') }
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
          title: `Accommodations: ${studentNeeds.join(', ')} (${gradeLevel})`,
          toolType: 'accommodation',
          toolName: 'Accommodation Planner',
          content,
          metadata: { gradeLevel, studentNeeds, contentArea, activityType },
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
        body: JSON.stringify({ 
          title: `Accommodation Plan`, 
          content: generatedPlan, 
          toolName: 'Accommodation Planner' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Accommodation_Plan.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedPlan); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">♿ Accommodation Planner</h1>
          </div>
          <div className="flex items-center gap-3">
            {showDemo && (
              <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors text-xl" title="Reset Demo">↺</button>
            )}
            <button onClick={handleShowDemo} className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${showDemo ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
              See Demo
            </button>
          </div>
        </div>
      </nav>

      {showDemo && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-xl">✨</span>
              <div className="flex-1">
                <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                <p className="text-purple-600 text-sm">We've filled in a student profile with ADHD and Learning Disability needs. Click Generate to see accommodations.</p>
              </div>
              <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                Scroll to output ↓
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Student Profile</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Content Area</label>
                <select value={contentArea} onChange={(e) => setContentArea(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <option value="General">General/All Subjects</option>
                  <option value="ELA">ELA/Reading</option>
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Writing">Writing</option>
                </select>
              </div>
            </div>

            {/* Student Needs */}
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-gray-800 font-medium mb-2">
                Student Needs <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Select all that apply</p>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">IEP Categories:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'iep-learning-disability', label: '📚 Learning Disability' },
                    { id: 'iep-adhd', label: '🎯 ADHD/Executive Function' },
                    { id: 'iep-autism', label: '🧩 Autism Spectrum' },
                    { id: 'iep-speech', label: '💬 Speech/Language' },
                    { id: 'iep-emotional', label: '💚 Emotional/Behavioral' },
                    { id: 'iep-intellectual', label: '🧠 Intellectual Disability' },
                    { id: 'iep-physical', label: '♿ Physical/Motor' },
                  ].map(n => (
                    <button key={n.id} type="button" onClick={() => toggleNeed(n.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${studentNeeds.includes(n.id) ? 'border-purple-500 bg-purple-100' : 'border-gray-200 hover:border-purple-300'}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">504 / ELL:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '504-medical', label: '🏥 504 - Medical' },
                    { id: '504-anxiety', label: '💭 504 - Anxiety' },
                    { id: 'ell-beginning', label: '🌍 ELL Beginning (1-2)' },
                    { id: 'ell-intermediate', label: '🌍 ELL Intermediate (3-4)' },
                    { id: 'ell-advanced', label: '🌍 ELL Advanced (5-6)' },
                  ].map(n => (
                    <button key={n.id} type="button" onClick={() => toggleNeed(n.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${studentNeeds.includes(n.id) ? 'border-purple-500 bg-purple-100' : 'border-gray-200 hover:border-purple-300'}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Other:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gifted', label: '⭐ Gifted/2E' },
                    { id: 'trauma', label: '💚 Trauma-Informed' },
                    { id: 'sensory', label: '🎧 Sensory Processing' },
                  ].map(n => (
                    <button key={n.id} type="button" onClick={() => toggleNeed(n.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${studentNeeds.includes(n.id) ? 'border-purple-500 bg-purple-100' : 'border-gray-200 hover:border-purple-300'}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Activity Type</label>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                <option value="instruction">📚 Direct Instruction</option>
                <option value="independent">🧑 Independent Work</option>
                <option value="group">👥 Group Work</option>
                <option value="assessment">📝 Assessment/Testing</option>
                <option value="reading">📖 Reading Activities</option>
                <option value="writing">✏️ Writing Activities</option>
                <option value="math">🔢 Math Activities</option>
                <option value="discussion">💬 Class Discussion</option>
                <option value="project">🎨 Project-Based</option>
                <option value="transition">🔄 Transitions</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Specific Challenges (optional)</label>
              <textarea value={specificChallenges} onChange={(e) => setSpecificChallenges(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Difficulty staying on task during long assignments, struggles with written output..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Existing Accommodations (optional)</label>
              <textarea value={existingAccommodations} onChange={(e) => setExistingAccommodations(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-16 text-sm"
                placeholder="e.g., Extended time, preferential seating, text-to-speech..." />
            </div>

            {/* Include Options */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeImplementation}
                    onChange={(e) => setIncludeImplementation(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">📋 Implementation Checklists</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeMonitoring}
                    onChange={(e) => setIncludeMonitoring(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">📊 Monitoring & Progress Tracking</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeParentCommunication}
                    onChange={(e) => setIncludeParentCommunication(e.target.checked)} className="w-5 h-5 text-purple-600 rounded" />
                  <span className="text-gray-700">👨‍👩‍👧 Parent Communication Template</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || studentNeeds.length === 0}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? '♿ Creating Accommodation Plan...' : '♿ Generate Accommodation Plan'}
            </button>
          </div>

          {/* Output */}
          <div ref={outputRef} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Accommodation Plan</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedPlan && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-purple-600 hover:text-purple-800 text-sm">
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
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedPlan}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">♿</p>
                  <p className="mb-2">Your accommodation plan will appear here</p>
                  <p className="text-xs">Evidence-based, practical accommodations</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}