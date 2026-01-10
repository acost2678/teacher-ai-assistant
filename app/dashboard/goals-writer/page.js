'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function GoalsWriterPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedGoals, setGeneratedGoals] = useState('')
  const [editedGoals, setEditedGoals] = useState('')
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedText, setExtractedText] = useState('')
  const [processingFile, setProcessingFile] = useState(false)
  const fileInputRef = useRef(null)
  const outputRef = useRef(null)
  
  // Student Information
  const [studentIdentifier, setStudentIdentifier] = useState('')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [disabilityCategory, setDisabilityCategory] = useState('')
  
  // Goal Areas
  const [goals, setGoals] = useState([
    {
      area: 'reading',
      presentLevel: '',
      specificSkill: '',
      baselineData: '',
      targetCriteria: '',
      timeframe: '36 weeks',
      measurementMethod: '',
      includeObjectives: true
    }
  ])
  
  // Standards Alignment
  const [alignToStandards, setAlignToStandards] = useState(true)
  const [stateStandards, setStateStandards] = useState('Common Core')
  
  // Options
  const [goalFormat, setGoalFormat] = useState('condition-behavior-criterion')
  const [includeDataCollection, setIncludeDataCollection] = useState(true)
  
  const [activeTab, setActiveTab] = useState('upload')
  
  const router = useRouter()

  const areaOptions = [
    { id: 'reading', label: 'Reading/Literacy', icon: '📖' },
    { id: 'math', label: 'Mathematics', icon: '🔢' },
    { id: 'writing', label: 'Written Expression', icon: '✏️' },
    { id: 'communication', label: 'Communication/Speech', icon: '💬' },
    { id: 'social', label: 'Social/Emotional', icon: '👥' },
    { id: 'behavior', label: 'Behavioral', icon: '🎭' },
    { id: 'motor-fine', label: 'Fine Motor', icon: '✋' },
    { id: 'motor-gross', label: 'Gross Motor', icon: '🏃' },
    { id: 'selfcare', label: 'Self-Care/Adaptive', icon: '🏠' },
    { id: 'transition-education', label: 'Transition: Education', icon: '🎓' },
    { id: 'transition-employment', label: 'Transition: Employment', icon: '💼' },
    { id: 'transition-living', label: 'Transition: Independent Living', icon: '🏡' }
  ]

  const disabilityOptions = [
    'Autism Spectrum Disorder',
    'Deaf-Blindness',
    'Deafness',
    'Developmental Delay',
    'Emotional Disturbance',
    'Hearing Impairment',
    'Intellectual Disability',
    'Multiple Disabilities',
    'Orthopedic Impairment',
    'Other Health Impairment',
    'Specific Learning Disability',
    'Speech or Language Impairment',
    'Traumatic Brain Injury',
    'Visual Impairment'
  ]

  const gradeOptions = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']

  const measurementOptions = [
    'Teacher observation',
    'Work samples',
    'Curriculum-based measurement',
    'Running records',
    'Rubric scoring',
    'Frequency count',
    'Duration recording',
    'Interval recording',
    'Task analysis',
    'Portfolio assessment',
    'Standardized assessment',
    'Teacher-made tests',
    'Data collection sheets'
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

  // Goal management
  const addGoal = () => {
    setGoals(prev => [...prev, {
      area: 'reading',
      presentLevel: '',
      specificSkill: '',
      baselineData: '',
      targetCriteria: '',
      timeframe: '36 weeks',
      measurementMethod: '',
      includeObjectives: true
    }])
  }

  const removeGoal = (index) => {
    if (goals.length > 1) {
      setGoals(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateGoal = (index, field, value) => {
    setGoals(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleShowDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('4th Grade')
    setDisabilityCategory('Specific Learning Disability')
    setGoals([
      {
        area: 'reading',
        presentLevel: '[Student Name] currently reads at a 2.3 grade level (DRA 24) with 65 words correct per minute, compared to the 4th grade benchmark of 100 wcpm.',
        specificSkill: 'Reading fluency with accuracy and expression',
        baselineData: '65 wcpm with 92% accuracy on grade-level passages',
        targetCriteria: '85 wcpm with 95% accuracy',
        timeframe: '36 weeks',
        measurementMethod: 'Curriculum-based measurement (CBM) probes',
        includeObjectives: true
      },
      {
        area: 'writing',
        presentLevel: '[Student Name] writes 2-3 sentence paragraphs with phonetic spelling and limited use of punctuation. Writing samples show difficulty organizing ideas sequentially.',
        specificSkill: 'Paragraph writing with proper structure and conventions',
        baselineData: 'Writes 2-3 sentences per paragraph, scoring 1/4 on paragraph rubric',
        targetCriteria: 'Write 5-7 sentence paragraphs scoring 3/4 on rubric',
        timeframe: '36 weeks',
        measurementMethod: 'Writing samples scored with classroom rubric',
        includeObjectives: true
      },
      {
        area: 'math',
        presentLevel: '[Student Name] demonstrates difficulty with multi-step word problems, successfully completing 40% of grade-level word problems independently.',
        specificSkill: 'Solving multi-step word problems using a problem-solving strategy',
        baselineData: '40% accuracy on multi-step word problems',
        targetCriteria: '80% accuracy on multi-step word problems',
        timeframe: '36 weeks',
        measurementMethod: 'Weekly word problem assessments',
        includeObjectives: true
      }
    ])
    setAlignToStandards(true)
    setStateStandards('Common Core')
    setGoalFormat('condition-behavior-criterion')
    setIncludeDataCollection(true)
    setShowDemo(true)
    setGeneratedGoals('')
  }

  const handleResetDemo = () => {
    setStudentIdentifier('')
    setGradeLevel('3rd Grade')
    setDisabilityCategory('')
    setGoals([{
      area: 'reading',
      presentLevel: '',
      specificSkill: '',
      baselineData: '',
      targetCriteria: '',
      timeframe: '36 weeks',
      measurementMethod: '',
      includeObjectives: true
    }])
    setAlignToStandards(true)
    setStateStandards('Common Core')
    setGoalFormat('condition-behavior-criterion')
    setIncludeDataCollection(true)
    setUploadedFiles([])
    setExtractedText('')
    setShowDemo(false)
    setGeneratedGoals('')
    setEditedGoals('')
    setActiveTab('upload')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!studentIdentifier) {
      alert('Please enter a student identifier')
      return
    }
    if (goals.length === 0) {
      alert('Please add at least one goal')
      return
    }
    
    setGenerating(true)
    setGeneratedGoals('')
    setSaved(false)

    try {
      const response = await fetch('/api/goals-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIdentifier,
          gradeLevel,
          disabilityCategory,
          goals,
          alignToStandards,
          stateStandards,
          goalFormat,
          includeDataCollection,
          extractedText
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedGoals(data.goals)
        setEditedGoals(data.goals)
        setActiveTab('output')
        await handleSave(data.goals)
      }
    } catch (error) {
      alert('Error generating goals. Please try again.')
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
          title: `IEP Goals: ${studentIdentifier}`,
          toolType: 'goals-writer',
          toolName: 'Measurable Goals Writer',
          content,
          metadata: { studentIdentifier, gradeLevel, disabilityCategory, goalAreas: goals.map(g => g.area) },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedGoals)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = async () => {
    if (!editedGoals) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `IEP Measurable Goals - ${studentIdentifier}`,
          content: editedGoals,
          toolName: 'Measurable Goals Writer'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `IEP_Goals_${studentIdentifier.replace(/\s+/g, '_')}.docx`
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
            <span className="text-gray-800 font-medium">Measurable Goals Writer</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎯</span>
                <h1 className="text-2xl font-semibold text-gray-800">Measurable IEP Goals Writer</h1>
              </div>
              <p className="text-gray-500">Generate SMART goals with short-term objectives aligned to standards and present levels.</p>
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

          {/* Privacy and Compliance Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">🔒</span>
                <div>
                  <h3 className="text-green-800 font-medium">Privacy-First</h3>
                  <p className="text-green-700 text-sm">Use identifiers like "Student A". Goals use "[Student Name]" placeholders for FERPA compliance.</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">⚖️</span>
                <div>
                  <h3 className="text-blue-800 font-medium">IDEA Compliant</h3>
                  <p className="text-blue-700 text-sm">Goals include measurable criteria, conditions, timeframes, and short-term objectives as required by IDEA.</p>
                </div>
              </div>
            </div>
          </div>

          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in 3 example goals (reading, writing, math). Review them in the Goals tab, then Generate to see sample output.</p>
                </div>
                <button onClick={() => setActiveTab('goals')} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  View Goals →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['upload', 'student', 'goals', 'output'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'output' && !generatedGoals}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📎 Upload IEP Documents</h2>
              <p className="text-gray-500 text-sm mb-4">Upload current IEP, PLOP statements, evaluation reports, or progress monitoring data. The AI will use this information to create aligned, measurable goals.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  className="hidden"
                />
                <div className="text-4xl mb-3">📄</div>
                <p className="text-gray-600 mb-2">Drag & drop files or click to browse</p>
                <p className="text-gray-400 text-sm mb-4">Supports PDF, Word documents, and text files</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingFile}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                  {processingFile ? 'Processing...' : 'Choose Files'}
                </button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-700 text-sm">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActiveTab('student')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Student Info →
              </button>
            </div>
          </div>
        )}

        {/* Student Tab */}
        {activeTab === 'student' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">👤 Student Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Identifier *</label>
                  <input
                    type="text"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="e.g., Student A"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disability Category</label>
                  <select
                    value={disabilityCategory}
                    onChange={(e) => setDisabilityCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select category...</option>
                    {disabilityOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <h3 className="text-md font-medium text-gray-800 mb-3">Goal Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Format</label>
                  <select
                    value={goalFormat}
                    onChange={(e) => setGoalFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="condition-behavior-criterion">Condition → Behavior → Criterion</option>
                    <option value="smart">SMART Format (Specific, Measurable, Achievable, Relevant, Time-bound)</option>
                    <option value="simple">Simple Format (Student will...)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standards Alignment</label>
                  <select
                    value={stateStandards}
                    onChange={(e) => setStateStandards(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Common Core">Common Core State Standards</option>
                    <option value="Texas TEKS">Texas TEKS</option>
                    <option value="Florida BEST">Florida BEST</option>
                    <option value="Virginia SOL">Virginia SOL</option>
                    <option value="State Standards">State Standards (General)</option>
                    <option value="None">No Standards Alignment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alignToStandards}
                    onChange={(e) => setAlignToStandards(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Align goals to grade-level standards</span>
                    <p className="text-sm text-gray-500">Reference applicable standards in goal statements</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDataCollection}
                    onChange={(e) => setIncludeDataCollection(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Include data collection procedures</span>
                    <p className="text-sm text-gray-500">Add recommended data collection methods for each goal</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('upload')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button onClick={() => setActiveTab('goals')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Define Goals →
              </button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {goals.map((goal, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{areaOptions.find(a => a.id === goal.area)?.icon || '🎯'}</span>
                    <h2 className="text-lg font-semibold text-gray-800">Goal {index + 1}</h2>
                  </div>
                  {goals.length > 1 && (
                    <button onClick={() => removeGoal(index)} className="text-red-500 hover:text-red-700 text-sm">
                      Remove Goal
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal Area *</label>
                    <select
                      value={goal.area}
                      onChange={(e) => updateGoal(index, 'area', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {areaOptions.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                    <select
                      value={goal.timeframe}
                      onChange={(e) => updateGoal(index, 'timeframe', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="36 weeks">36 weeks (full year)</option>
                      <option value="18 weeks">18 weeks (semester)</option>
                      <option value="12 weeks">12 weeks (trimester)</option>
                      <option value="9 weeks">9 weeks (quarter)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Present Level for this Goal *</label>
                  <textarea
                    value={goal.presentLevel}
                    onChange={(e) => updateGoal(index, 'presentLevel', e.target.value)}
                    placeholder="Describe current performance in this area (from PLOP)..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Skill to Target *</label>
                  <input
                    type="text"
                    value={goal.specificSkill}
                    onChange={(e) => updateGoal(index, 'specificSkill', e.target.value)}
                    placeholder="e.g., Reading fluency, Multi-step word problems, Paragraph writing"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Baseline Data *</label>
                    <input
                      type="text"
                      value={goal.baselineData}
                      onChange={(e) => updateGoal(index, 'baselineData', e.target.value)}
                      placeholder="e.g., 65 wcpm, 40% accuracy, 2/10 trials"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Criteria *</label>
                    <input
                      type="text"
                      value={goal.targetCriteria}
                      onChange={(e) => updateGoal(index, 'targetCriteria', e.target.value)}
                      placeholder="e.g., 90 wcpm, 80% accuracy, 8/10 trials"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Method</label>
                  <select
                    value={goal.measurementMethod}
                    onChange={(e) => updateGoal(index, 'measurementMethod', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select measurement method...</option>
                    {measurementOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={goal.includeObjectives}
                    onChange={(e) => updateGoal(index, 'includeObjectives', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Include short-term objectives/benchmarks</span>
                    <p className="text-sm text-gray-500">Break goal into 3-4 measurable checkpoints</p>
                  </div>
                </label>
              </div>
            ))}

            <button
              onClick={addGoal}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors font-medium"
            >
              + Add Another Goal
            </button>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('student')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !studentIdentifier || goals.some(g => !g.specificSkill || !g.baselineData || !g.targetCriteria)}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-purple-300 transition-colors font-medium flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⏳</span> Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span> Generate Goals
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && (
          <div ref={outputRef} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-800">Generated IEP Goals</h2>
                  {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                </div>
                {generatedGoals && (
                  <div className="flex items-center gap-3">
                    <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <button onClick={handleExport} disabled={exporting} className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:bg-purple-300">
                      {exporting ? 'Exporting...' : '📄 Export .docx'}
                    </button>
                  </div>
                )}
              </div>

              {generatedGoals ? (
                <div>
                  <textarea
                    value={editedGoals}
                    onChange={(e) => setEditedGoals(e.target.value)}
                    className="w-full h-[500px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">You can edit the goals above before copying or exporting.</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-gray-400">Complete the form and click Generate to create IEP goals</p>
                </div>
              )}
            </div>

            <div className="flex justify-start">
              <button onClick={() => setActiveTab('goals')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back to Edit
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}