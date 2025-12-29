'use client'

import { useState, useEffect, useRef } from 'react'
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
  
  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedText, setExtractedText] = useState('')
  const [processingFile, setProcessingFile] = useState(false)
  const fileInputRef = useRef(null)
  
  // Student Context
  const [studentIdentifier, setStudentIdentifier] = useState('Student A')
  const [gradeLevel, setGradeLevel] = useState('Elementary (K-5)')
  const [setting, setSetting] = useState('General Education Classroom')
  const [disabilityCategory, setDisabilityCategory] = useState('')
  
  // NEW: Student Strengths
  const [studentStrengths, setStudentStrengths] = useState('')
  const [studentInterests, setStudentInterests] = useState('')
  const [whatWorks, setWhatWorks] = useState('')
  const [reinforcers, setReinforcers] = useState('')
  
  // Problem Behaviors - now as a table
  const [problemBehaviors, setProblemBehaviors] = useState([
    { behavior: '', definition: '', frequency: '', duration: '', intensity: 'moderate' }
  ])
  
  // Setting Conditions - Slow vs Fast Triggers
  const [slowTriggers, setSlowTriggers] = useState([])
  const [slowTriggersOther, setSlowTriggersOther] = useState('')
  const [fastTriggers, setFastTriggers] = useState('')
  
  // ABC Data
  const [abcObservations, setAbcObservations] = useState([
    { antecedent: '', behavior: '', consequence: '', date: '', time: '', setting: '' }
  ])
  
  // Function Hypothesis
  const [primaryFunction, setPrimaryFunction] = useState('')
  const [secondaryFunction, setSecondaryFunction] = useState('')
  const [functionNotes, setFunctionNotes] = useState('')
  
  // Additional Context
  const [additionalContext, setAdditionalContext] = useState('')
  
  // Output
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  
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

  const slowTriggerOptions = [
    { id: 'sleep', label: 'Poor sleep / Fatigue' },
    { id: 'medication', label: 'Medication changes / Missed medication' },
    { id: 'home', label: 'Home/family issues' },
    { id: 'hunger', label: 'Hunger / Missed meals' },
    { id: 'illness', label: 'Illness / Not feeling well' },
    { id: 'sensory', label: 'Sensory overload' },
    { id: 'peer-conflict', label: 'Peer conflicts earlier in day' },
    { id: 'schedule-change', label: 'Schedule changes' },
    { id: 'over-tired', label: 'Over-tired' },
    { id: 'anxiety', label: 'General anxiety' },
  ]

  const functionOptions = [
    { id: 'escape-task', label: 'Escape/Avoidance - Tasks or demands' },
    { id: 'escape-social', label: 'Escape/Avoidance - Social situations' },
    { id: 'escape-sensory', label: 'Escape/Avoidance - Sensory input' },
    { id: 'attention-adult', label: 'Attention - From adults' },
    { id: 'attention-peer', label: 'Attention - From peers' },
    { id: 'tangible', label: 'Access to Tangibles - Items/activities' },
    { id: 'control', label: 'Control/Power - Over situation' },
    { id: 'sensory', label: 'Sensory/Automatic - Self-stimulation' },
  ]

  const intensityOptions = [
    { id: 'mild', label: 'Mild' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'severe', label: 'Severe' },
  ]

  // File upload handlers
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setProcessingFile(true)
    
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          setUploadedFiles(prev => [...prev, { name: file.name, text: data.text }])
          setExtractedText(prev => prev + '\n\n--- From ' + file.name + ' ---\n' + data.text)
        } else {
          alert(`Failed to process ${file.name}`)
        }
      } catch (error) {
        console.error('Error processing file:', error)
        alert(`Failed to process ${file.name}`)
      }
    }
    
    setProcessingFile(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index) => {
    const file = uploadedFiles[index]
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setExtractedText(prev => prev.replace(`\n\n--- From ${file.name} ---\n${file.text}`, ''))
  }

  // Problem behavior handlers
  const addProblemBehavior = () => {
    setProblemBehaviors(prev => [...prev, { behavior: '', definition: '', frequency: '', duration: '', intensity: 'moderate' }])
  }

  const updateProblemBehavior = (index, field, value) => {
    setProblemBehaviors(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeProblemBehavior = (index) => {
    if (problemBehaviors.length > 1) {
      setProblemBehaviors(prev => prev.filter((_, i) => i !== index))
    }
  }

  // ABC observation handlers
  const addObservation = () => {
    setAbcObservations(prev => [...prev, { antecedent: '', behavior: '', consequence: '', date: '', time: '', setting: '' }])
  }

  const updateObservation = (index, field, value) => {
    setAbcObservations(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeObservation = (index) => {
    if (abcObservations.length > 1) {
      setAbcObservations(prev => prev.filter((_, i) => i !== index))
    }
  }

  const toggleSlowTrigger = (triggerId) => {
    setSlowTriggers(prev => 
      prev.includes(triggerId) ? prev.filter(id => id !== triggerId) : [...prev, triggerId]
    )
  }

  const handleShowDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('Emotional Disturbance')
    setStudentStrengths('Very good with younger children. Creative with Legos. Building understanding of controlling behaviors. Often invites others to play, offers to share and help peers.')
    setStudentInterests('Nintendo DS, Legos, riding bike outside, playing baseball and soccer. At school: phy ed, recess, free time, Art class, computer time, helping sell cookies.')
    setWhatWorks('Responds well to praise, stickers, and earning small rewards. Functions well when able to follow daily routine independently. Likes knowing the rules. Works best independently with assistance as needed.')
    setReinforcers('Sincere acknowledgement and praise. Small rewards. Computer time. Brain breaks. Being a helper.')
    setProblemBehaviors([
      { behavior: 'Shutting Down', definition: 'Refuses to communicate, will not follow directions, plugs ears, closes eyes, sometimes acts out aggressively', frequency: 'Twice per month', duration: '10 min to 1/2 day', intensity: 'severe' },
      { behavior: 'Oppositional Behavior', definition: 'Directly opposes instruction, refuses to listen, pushes work away, refuses to complete assignments', frequency: 'Twice per week', duration: '10-30 minutes', intensity: 'moderate' },
    ])
    setSlowTriggers(['peer-conflict', 'schedule-change', 'over-tired', 'hunger'])
    setSlowTriggersOther('Peers not meeting expectations. Commotion around him. Natural pace altered by teaching.')
    setFastTriggers(`- Written work, especially journaling without a model
- Not eating or being tired
- Looking at assignment and feeling like can't do it
- Performance anxiety / not understanding first time
- Multiplication
- Having an uncooperative partner
- Reading aloud
- Forcing cooperation or task completion
- Feeling embarrassed about behavior
- Transitions (new people, environments, teachers, material)
- Feeling like no-one cares`)
    setAbcObservations([
      { antecedent: 'Teacher asked student to start independent math work', behavior: 'Threw pencil, pushed desk, said "I can\'t do this"', consequence: 'Teacher removed math work, sent student to calm corner', date: '12/15', time: 'Morning', setting: 'Gen Ed' },
      { antecedent: 'Writing prompt given, class began working', behavior: 'Ripped paper, pushed materials off desk, put head down', consequence: 'Teacher offered break, reduced assignment length', date: '12/16', time: 'Morning', setting: 'Gen Ed' },
      { antecedent: 'Asked to read aloud during small group', behavior: 'Refused, pushed book away, left the group', consequence: 'Teacher allowed to skip turn, student returned after 5 min', date: '12/17', time: 'Morning', setting: 'Small Group' },
    ])
    setPrimaryFunction('escape-task')
    setSecondaryFunction('control')
    setFunctionNotes('Student engages in behaviors to avoid tasks he feels may be too difficult, that he does not find desirable, or that cause anxiety. Also shows desire for power/control. Fear of failure and being made fun of. Extremely sensitive to negative comments.')
    setAdditionalContext('Student is a complex child. Although demonstrates desire for power and control, has also shown desire to have "good" days and wants to please adults. Anxiety-related resistance especially with unknown situations. Thrives on praise and compliments.')
    setIncludeRecommendations(true)
    setGeneratedFBA('')
    setActiveTab('strengths')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('')
    setStudentStrengths('')
    setStudentInterests('')
    setWhatWorks('')
    setReinforcers('')
    setProblemBehaviors([{ behavior: '', definition: '', frequency: '', duration: '', intensity: 'moderate' }])
    setSlowTriggers([])
    setSlowTriggersOther('')
    setFastTriggers('')
    setAbcObservations([{ antecedent: '', behavior: '', consequence: '', date: '', time: '', setting: '' }])
    setPrimaryFunction('')
    setSecondaryFunction('')
    setFunctionNotes('')
    setAdditionalContext('')
    setUploadedFiles([])
    setExtractedText('')
    setGeneratedFBA('')
    setActiveTab('upload')
    setShowDemo(false)
  }

  const handleGenerate = async () => {
    const hasBehavior = problemBehaviors.some(b => b.behavior)
    if (!hasBehavior) {
      alert('Please enter at least one problem behavior')
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
          studentStrengths,
          studentInterests,
          whatWorks,
          reinforcers,
          problemBehaviors,
          slowTriggers: slowTriggers.map(id => slowTriggerOptions.find(o => o.id === id)?.label).filter(Boolean),
          slowTriggersOther,
          fastTriggers,
          abcObservations,
          primaryFunction: functionOptions.find(f => f.id === primaryFunction)?.label || primaryFunction,
          secondaryFunction: functionOptions.find(f => f.id === secondaryFunction)?.label || secondaryFunction,
          functionNotes,
          additionalContext,
          extractedDocumentText: extractedText,
          includeRecommendations,
        }),
      })

      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedFBA(data.fba)
        setEditedFBA(data.fba)
        await handleSave(data.fba)
        setActiveTab('output')
      }
    } catch (error) {
      alert('Error generating FBA. Please try again.')
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
          title: `FBA: ${studentIdentifier} - ${problemBehaviors[0]?.behavior || 'Behavior'}`,
          toolType: 'fba-writer',
          toolName: 'FBA Writer',
          content,
          metadata: { studentIdentifier, gradeLevel, setting, primaryFunction },
        }),
      })
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedFBA)
    alert('FBA copied to clipboard!')
  }

  const handleExport = async () => {
    if (!editedFBA) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `FBA - ${studentIdentifier}`,
          content: editedFBA,
          toolName: 'FBA Writer'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `FBA_${studentIdentifier.replace(/\s+/g, '_')}.docx`
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
                <h1 className="text-2xl font-semibold text-gray-800">Functional Behavior Assessment</h1>
              </div>
              <p className="text-gray-500">Generate comprehensive FBAs with function hypothesis from observation data.</p>
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

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First</h3>
                <p className="text-green-700 text-sm">Use identifiers like "Student A". Generated FBAs use "[Student Name]" placeholders for FERPA compliance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['upload', 'strengths', 'behavior', 'triggers', 'abc', 'function', 'output'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'output' && !generatedFBA}
              className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50'
              }`}
            >
              {index + 1}. {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📎 Upload Existing Documents</h2>
              <p className="text-gray-500 text-sm mb-4">Upload IEPs, previous FBAs, behavior data sheets, teacher notes, or any relevant documents. The AI will use this information to generate a more comprehensive FBA.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingFile}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  {processingFile ? (
                    <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Processing...</span>
                  ) : (
                    <span className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📄</span>
                      <span>Click to upload files</span>
                      <span className="text-xs text-gray-400">PDF, DOC, DOCX, TXT, CSV</span>
                    </span>
                  )}
                </button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium text-gray-700">Uploaded Documents:</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-green-700 text-sm">✓ {file.name}</span>
                      <button onClick={() => removeFile(index)} className="text-green-600 hover:text-red-600 text-sm">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Basic Info */}
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
                    <option value="Self-Contained">Self-Contained</option>
                    <option value="Inclusion Setting">Inclusion Setting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disability Category</label>
                  <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="">Not specified</option>
                    <option value="Specific Learning Disability">Specific Learning Disability</option>
                    <option value="Emotional Disturbance">Emotional Disturbance</option>
                    <option value="Autism">Autism</option>
                    <option value="Other Health Impairment">Other Health Impairment</option>
                    <option value="Intellectual Disability">Intellectual Disability</option>
                    <option value="Speech/Language Impairment">Speech/Language Impairment</option>
                    <option value="Multiple Disabilities">Multiple Disabilities</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveTab('strengths')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
              Next: Student Strengths →
            </button>
          </div>
        )}

        {/* Strengths Tab */}
        {activeTab === 'strengths' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">💪 Student Strengths</h2>
              <p className="text-gray-500 text-sm mb-4">What is the student good at? What positive qualities do they have?</p>
              <textarea
                value={studentStrengths}
                onChange={(e) => setStudentStrengths(e.target.value)}
                placeholder="e.g., Very good with younger children. Creative with building projects. Often helps peers. Building understanding of controlling behaviors..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">⭐ Student Interests</h2>
              <p className="text-gray-500 text-sm mb-4">What does the student enjoy? What activities, subjects, or topics interest them?</p>
              <textarea
                value={studentInterests}
                onChange={(e) => setStudentInterests(e.target.value)}
                placeholder="e.g., Video games, Legos, sports, art, computer time, helping in the classroom..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">✅ What Works</h2>
              <p className="text-gray-500 text-sm mb-4">What strategies, environments, or conditions help the student succeed?</p>
              <textarea
                value={whatWorks}
                onChange={(e) => setWhatWorks(e.target.value)}
                placeholder="e.g., Works best independently with assistance as needed. Functions well with routine. Responds to calm approach. Likes knowing the rules..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">🏆 Effective Reinforcers</h2>
              <p className="text-gray-500 text-sm mb-4">What motivates this student? What rewards or acknowledgments work?</p>
              <textarea
                value={reinforcers}
                onChange={(e) => setReinforcers(e.target.value)}
                placeholder="e.g., Sincere praise, stickers, small rewards, computer time, being a helper, earning privileges..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('upload')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('behavior')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: Problem Behaviors →
              </button>
            </div>
          </div>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">⚠️ Problem Behaviors</h2>
                  <p className="text-gray-500 text-sm">Define each target behavior with observable, measurable descriptions</p>
                </div>
                <button onClick={addProblemBehavior} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  + Add Behavior
                </button>
              </div>

              <div className="space-y-4">
                {problemBehaviors.map((pb, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-lg">Behavior {index + 1}</span>
                      {problemBehaviors.length > 1 && (
                        <button onClick={() => removeProblemBehavior(index)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Behavior Name</label>
                        <input
                          type="text"
                          value={pb.behavior}
                          onChange={(e) => updateProblemBehavior(index, 'behavior', e.target.value)}
                          placeholder="e.g., Shutting Down, Aggression"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Intensity</label>
                        <select
                          value={pb.intensity}
                          onChange={(e) => updateProblemBehavior(index, 'intensity', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {intensityOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Operational Definition</label>
                      <textarea
                        value={pb.definition}
                        onChange={(e) => updateProblemBehavior(index, 'definition', e.target.value)}
                        placeholder="What does the behavior look like? Observable, measurable description..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={pb.frequency}
                          onChange={(e) => updateProblemBehavior(index, 'frequency', e.target.value)}
                          placeholder="e.g., 2x per week"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={pb.duration}
                          onChange={(e) => updateProblemBehavior(index, 'duration', e.target.value)}
                          placeholder="e.g., 10-30 minutes"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('strengths')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('triggers')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: Triggers →
              </button>
            </div>
          </div>
        )}

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">🐢 Slow Triggers (Setting Events)</h2>
              <p className="text-gray-500 text-sm mb-4">Background conditions that make behavior more likely. These don't directly cause the behavior but set the stage.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                {slowTriggerOptions.map(trigger => (
                  <button
                    key={trigger.id}
                    onClick={() => toggleSlowTrigger(trigger.id)}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      slowTriggers.includes(trigger.id)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    {trigger.label}
                  </button>
                ))}
              </div>
              <textarea
                value={slowTriggersOther}
                onChange={(e) => setSlowTriggersOther(e.target.value)}
                placeholder="Other slow triggers specific to this student..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">⚡ Fast Triggers (Immediate Antecedents)</h2>
              <p className="text-gray-500 text-sm mb-4">Specific events that immediately precede and trigger the behavior.</p>
              <textarea
                value={fastTriggers}
                onChange={(e) => setFastTriggers(e.target.value)}
                placeholder={`List specific triggers, one per line:
- Written work without a model
- Being asked to read aloud
- Transitions between activities
- Demands placed when already frustrated
- Not understanding instructions...`}
                rows={8}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('behavior')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('abc')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: ABC Data →
              </button>
            </div>
          </div>
        )}

        {/* ABC Tab */}
        {activeTab === 'abc' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">📋 ABC Observations</h2>
                  <p className="text-gray-500 text-sm">Record specific incidents: Antecedent → Behavior → Consequence</p>
                </div>
                <button onClick={addObservation} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  + Add Observation
                </button>
              </div>

              <div className="space-y-4">
                {abcObservations.map((obs, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-lg">Observation {index + 1}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={obs.date}
                          onChange={(e) => updateObservation(index, 'date', e.target.value)}
                          placeholder="Date"
                          className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={obs.time}
                          onChange={(e) => updateObservation(index, 'time', e.target.value)}
                          placeholder="Time"
                          className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={obs.setting}
                          onChange={(e) => updateObservation(index, 'setting', e.target.value)}
                          placeholder="Setting"
                          className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                        {abcObservations.length > 1 && (
                          <button onClick={() => removeObservation(index)} className="text-red-500 hover:text-red-600 text-sm">✕</button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">A - Antecedent</label>
                        <textarea
                          value={obs.antecedent}
                          onChange={(e) => updateObservation(index, 'antecedent', e.target.value)}
                          placeholder="What happened right before?"
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">B - Behavior</label>
                        <textarea
                          value={obs.behavior}
                          onChange={(e) => updateObservation(index, 'behavior', e.target.value)}
                          placeholder="What did the student do?"
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">C - Consequence</label>
                        <textarea
                          value={obs.consequence}
                          onChange={(e) => updateObservation(index, 'consequence', e.target.value)}
                          placeholder="What happened after?"
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('triggers')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('function')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: Function →
              </button>
            </div>
          </div>
        )}

        {/* Function Tab */}
        {activeTab === 'function' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">🎯 Hypothesized Function</h2>
              <p className="text-gray-500 text-sm mb-4">Based on the data, what does the student get or avoid through this behavior?</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Function</label>
                  <select value={primaryFunction} onChange={(e) => setPrimaryFunction(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="">Select primary function...</option>
                    {functionOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Function (if applicable)</label>
                  <select value={secondaryFunction} onChange={(e) => setSecondaryFunction(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="">None / Not applicable</option>
                    {functionOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Function Notes</label>
                <textarea
                  value={functionNotes}
                  onChange={(e) => setFunctionNotes(e.target.value)}
                  placeholder="Additional observations about why the student engages in this behavior..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📝 Additional Context</h2>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any other relevant information about this student, their history, or circumstances..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Output Options</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">Include Replacement Behavior Strategies (Setting Event, Predictor, Teaching, Consequence)</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('abc')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                {generating ? (
                  <><span className="animate-spin">⏳</span>Generating FBA...</>
                ) : (
                  <><span>🔍</span>Generate FBA</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedFBA && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated FBA</h2>
                  <p className="text-gray-500 text-sm">Review and edit. Replace "[Student Name]" in your secure system.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors">
                    📋 Copy
                  </button>
                  <button onClick={handleExport} disabled={exporting} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors">
                    {exporting ? 'Exporting...' : '📄 Export (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <textarea
                value={editedFBA}
                onChange={(e) => setEditedFBA(e.target.value)}
                rows={35}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">⚠️</span>
                <div>
                  <h3 className="text-amber-800 font-medium">Before Finalizing</h3>
                  <ul className="text-amber-700 text-sm mt-1 list-disc list-inside">
                    <li>Verify all data is accurate</li>
                    <li>Have a qualified professional (BCBA, School Psychologist) review</li>
                    <li>Replace "[Student Name]" with actual name in your secure system</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveTab('function')} className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Edit Data
            </button>
          </div>
        )}
      </main>
    </div>
  )
}