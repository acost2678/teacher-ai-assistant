'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PLOPWriterPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedPLOP, setGeneratedPLOP] = useState('')
  const [editedPLOP, setEditedPLOP] = useState('')
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
  const [evaluationDate, setEvaluationDate] = useState('')
  
  // Academic Performance
  const [readingLevel, setReadingLevel] = useState('')
  const [readingStrengths, setReadingStrengths] = useState('')
  const [readingChallenges, setReadingChallenges] = useState('')
  const [mathLevel, setMathLevel] = useState('')
  const [mathStrengths, setMathStrengths] = useState('')
  const [mathChallenges, setMathChallenges] = useState('')
  const [writingLevel, setWritingLevel] = useState('')
  const [writingStrengths, setWritingStrengths] = useState('')
  const [writingChallenges, setWritingChallenges] = useState('')
  
  // Functional Performance
  const [communicationSkills, setCommunicationSkills] = useState('')
  const [socialSkills, setSocialSkills] = useState('')
  const [behaviorSkills, setBehaviorSkills] = useState('')
  const [selfCareSkills, setSelfCareSkills] = useState('')
  const [motorSkills, setMotorSkills] = useState('')
  
  // Assessment Data
  const [standardizedAssessments, setStandardizedAssessments] = useState('')
  const [classroomAssessments, setClassroomAssessments] = useState('')
  const [teacherObservations, setTeacherObservations] = useState('')
  const [parentInput, setParentInput] = useState('')
  
  // Impact & Needs
  const [impactOnEducation, setImpactOnEducation] = useState('')
  const [accommodationsUsed, setAccommodationsUsed] = useState('')
  const [areasOfNeed, setAreasOfNeed] = useState([])
  
  // Options
  const [includeTransition, setIncludeTransition] = useState(false)
  const [plopAreas, setPlopAreas] = useState(['reading', 'math', 'writing'])
  
  const [activeTab, setActiveTab] = useState('upload')
  
  const router = useRouter()

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

  const areaOptions = [
    { id: 'reading', label: 'Reading/Literacy' },
    { id: 'math', label: 'Mathematics' },
    { id: 'writing', label: 'Written Expression' },
    { id: 'communication', label: 'Communication' },
    { id: 'social', label: 'Social/Emotional' },
    { id: 'behavior', label: 'Behavioral' },
    { id: 'motor', label: 'Motor Skills' },
    { id: 'selfcare', label: 'Self-Care/Daily Living' },
    { id: 'transition', label: 'Transition (for 14+)' }
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

  const toggleArea = (areaId) => {
    setPlopAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const handleShowDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('4th Grade')
    setDisabilityCategory('Specific Learning Disability')
    setEvaluationDate('2024-01-15')
    setReadingLevel('2.3 grade level (DRA Level 24)')
    setReadingStrengths('Strong phonemic awareness, enjoys being read to, good comprehension when listening')
    setReadingChallenges('Decoding multisyllabic words, reading fluency (65 wcpm vs. 100 wcpm benchmark), inconsistent use of reading strategies')
    setMathLevel('3.8 grade level')
    setMathStrengths('Strong number sense, understands place value, good mental math with basic facts')
    setMathChallenges('Multi-step word problems, showing work in writing, math vocabulary')
    setWritingLevel('Below grade level')
    setWritingStrengths('Creative ideas, willing to share orally, improving handwriting')
    setWritingChallenges('Spelling (phonetic spelling), sentence structure, organizing paragraphs, writing stamina')
    setStandardizedAssessments('WISC-V: Full Scale IQ 98 (Average). Processing Speed Index: 82 (Low Average). Woodcock-Johnson IV: Broad Reading 85, Reading Fluency 78, Written Expression 80')
    setClassroomAssessments('Running records show instructional level at DRA 24. Math unit tests averaging 75%. Writing samples show 2-3 sentence paragraphs with limited detail.')
    setTeacherObservations('Works well in small groups, requires frequent redirection during independent reading, benefits from visual supports and graphic organizers, demonstrates effort and positive attitude toward learning')
    setParentInput('Parents report student enjoys school but gets frustrated with homework. Reads at home with support. Responds well to encouragement and breaks.')
    setImpactOnEducation('Reading difficulties impact ability to access grade-level texts independently in all subjects. Writing challenges affect ability to demonstrate knowledge on assessments. Processing speed affects completion of timed assignments.')
    setAccommodationsUsed('Extended time (1.5x), preferential seating, audiobooks for content areas, graphic organizers, reduced written output options')
    setPlopAreas(['reading', 'math', 'writing'])
    setIncludeTransition(false)
    setShowDemo(true)
    setGeneratedPLOP('')
  }

  const handleResetDemo = () => {
    setStudentIdentifier('')
    setGradeLevel('3rd Grade')
    setDisabilityCategory('')
    setEvaluationDate('')
    setReadingLevel('')
    setReadingStrengths('')
    setReadingChallenges('')
    setMathLevel('')
    setMathStrengths('')
    setMathChallenges('')
    setWritingLevel('')
    setWritingStrengths('')
    setWritingChallenges('')
    setCommunicationSkills('')
    setSocialSkills('')
    setBehaviorSkills('')
    setSelfCareSkills('')
    setMotorSkills('')
    setStandardizedAssessments('')
    setClassroomAssessments('')
    setTeacherObservations('')
    setParentInput('')
    setImpactOnEducation('')
    setAccommodationsUsed('')
    setAreasOfNeed([])
    setPlopAreas(['reading', 'math', 'writing'])
    setIncludeTransition(false)
    setUploadedFiles([])
    setExtractedText('')
    setShowDemo(false)
    setGeneratedPLOP('')
    setEditedPLOP('')
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
    if (plopAreas.length === 0) {
      alert('Please select at least one PLOP area')
      return
    }
    
    setGenerating(true)
    setGeneratedPLOP('')
    setSaved(false)

    try {
      const response = await fetch('/api/plop-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIdentifier,
          gradeLevel,
          disabilityCategory,
          evaluationDate,
          readingLevel, readingStrengths, readingChallenges,
          mathLevel, mathStrengths, mathChallenges,
          writingLevel, writingStrengths, writingChallenges,
          communicationSkills, socialSkills, behaviorSkills, selfCareSkills, motorSkills,
          standardizedAssessments, classroomAssessments, teacherObservations, parentInput,
          impactOnEducation, accommodationsUsed,
          plopAreas, includeTransition,
          extractedText
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedPLOP(data.plop)
        setEditedPLOP(data.plop)
        setActiveTab('output')
        await handleSave(data.plop)
      }
    } catch (error) {
      alert('Error generating PLOP. Please try again.')
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
          title: `PLOP: ${studentIdentifier}`,
          toolType: 'plop-writer',
          toolName: 'PLOP Writer',
          content,
          metadata: { studentIdentifier, gradeLevel, disabilityCategory, plopAreas },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedPLOP)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = async () => {
    if (!editedPLOP) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Present Levels of Performance - ${studentIdentifier}`,
          content: editedPLOP,
          toolName: 'PLOP Writer'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `PLOP_${studentIdentifier.replace(/\s+/g, '_')}.docx`
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
            <span className="text-gray-800 font-medium">PLOP Writer</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📊</span>
                <h1 className="text-2xl font-semibold text-gray-800">Present Levels of Performance Writer</h1>
              </div>
              <p className="text-gray-500">Generate comprehensive PLOP statements based on assessment data, observations, and student performance.</p>
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
                  <p className="text-green-700 text-sm">Use identifiers like "Student A". PLOPs use "[Student Name]" placeholders for FERPA compliance.</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">⚖️</span>
                <div>
                  <h3 className="text-blue-800 font-medium">IDEA Compliant</h3>
                  <p className="text-blue-700 text-sm">Includes academic achievement, functional performance, and impact on education as required by IDEA.</p>
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
                  <p className="text-purple-600 text-sm">We've filled in example student data. Click through the tabs to review, then Generate to see a sample output.</p>
                </div>
                <button onClick={() => setActiveTab('output')} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  Skip to Output →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['upload', 'student', 'academic', 'functional', 'assessment', 'output'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'output' && !generatedPLOP}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📎 Upload Evaluation Documents</h2>
              <p className="text-gray-500 text-sm mb-4">Upload IEP evaluations, progress reports, assessment results, or previous IEPs. The AI will extract relevant information to create comprehensive PLOP statements.</p>
              
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Identifier *</label>
                  <input
                    type="text"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="e.g., Student A, J.S., Case #123"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Most Recent Evaluation Date</label>
                  <input
                    type="date"
                    value={evaluationDate}
                    onChange={(e) => setEvaluationDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">PLOP Areas to Include *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {areaOptions.map(area => (
                    <label key={area.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plopAreas.includes(area.id)}
                        onChange={() => toggleArea(area.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700 text-sm">{area.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('upload')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button onClick={() => setActiveTab('academic')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Academic →
              </button>
            </div>
          </div>
        )}

        {/* Academic Tab */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Academic Performance</h2>
              <p className="text-gray-500 text-sm mb-6">Document current levels, strengths, and areas of need in academic subjects.</p>

              {plopAreas.includes('reading') && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-medium text-gray-800 mb-3">📖 Reading/Literacy</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Reading Level</label>
                      <input
                        type="text"
                        value={readingLevel}
                        onChange={(e) => setReadingLevel(e.target.value)}
                        placeholder="e.g., 2.5 grade level, DRA 28, Lexile 650"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Reading Strengths</label>
                      <textarea
                        value={readingStrengths}
                        onChange={(e) => setReadingStrengths(e.target.value)}
                        placeholder="e.g., Strong phonemic awareness, enjoys reading, good comprehension when read to"
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Reading Challenges</label>
                      <textarea
                        value={readingChallenges}
                        onChange={(e) => setReadingChallenges(e.target.value)}
                        placeholder="e.g., Decoding multisyllabic words, fluency (current wcpm vs benchmark), comprehension of informational text"
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {plopAreas.includes('math') && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl">
                  <h3 className="font-medium text-gray-800 mb-3">🔢 Mathematics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Math Level</label>
                      <input
                        type="text"
                        value={mathLevel}
                        onChange={(e) => setMathLevel(e.target.value)}
                        placeholder="e.g., 3.0 grade level, performing at 2nd grade standards"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Math Strengths</label>
                      <textarea
                        value={mathStrengths}
                        onChange={(e) => setMathStrengths(e.target.value)}
                        placeholder="e.g., Strong number sense, understands place value, good with manipulatives"
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Math Challenges</label>
                      <textarea
                        value={mathChallenges}
                        onChange={(e) => setMathChallenges(e.target.value)}
                        placeholder="e.g., Word problems, multi-step operations, math facts fluency"
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {plopAreas.includes('writing') && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <h3 className="font-medium text-gray-800 mb-3">✏️ Written Expression</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Writing Level</label>
                      <input
                        type="text"
                        value={writingLevel}
                        onChange={(e) => setWritingLevel(e.target.value)}
                        placeholder="e.g., Below grade level, approaching grade level standards"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Writing Strengths</label>
                      <textarea
                        value={writingStrengths}
                        onChange={(e) => setWritingStrengths(e.target.value)}
                        placeholder="e.g., Creative ideas, willing to share orally, improving handwriting"
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Writing Challenges</label>
                      <textarea
                        value={writingChallenges}
                        onChange={(e) => setWritingChallenges(e.target.value)}
                        placeholder="e.g., Spelling, sentence structure, organizing ideas, writing stamina"
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('student')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button onClick={() => setActiveTab('functional')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Functional →
              </button>
            </div>
          </div>
        )}

        {/* Functional Tab */}
        {activeTab === 'functional' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 Functional Performance</h2>
              <p className="text-gray-500 text-sm mb-6">Document functional skills and performance in non-academic areas.</p>

              {plopAreas.includes('communication') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">💬 Communication Skills</label>
                  <textarea
                    value={communicationSkills}
                    onChange={(e) => setCommunicationSkills(e.target.value)}
                    placeholder="Describe receptive and expressive language abilities, articulation, pragmatic language..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              )}

              {plopAreas.includes('social') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">👥 Social/Emotional Skills</label>
                  <textarea
                    value={socialSkills}
                    onChange={(e) => setSocialSkills(e.target.value)}
                    placeholder="Describe peer interactions, emotional regulation, social awareness, relationship skills..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              )}

              {plopAreas.includes('behavior') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Behavioral Skills</label>
                  <textarea
                    value={behaviorSkills}
                    onChange={(e) => setBehaviorSkills(e.target.value)}
                    placeholder="Describe classroom behavior, attention, self-regulation, following directions..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              )}

              {plopAreas.includes('selfcare') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏠 Self-Care/Daily Living Skills</label>
                  <textarea
                    value={selfCareSkills}
                    onChange={(e) => setSelfCareSkills(e.target.value)}
                    placeholder="Describe independence with daily tasks, organization, time management, personal care..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              )}

              {plopAreas.includes('motor') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏃 Motor Skills</label>
                  <textarea
                    value={motorSkills}
                    onChange={(e) => setMotorSkills(e.target.value)}
                    placeholder="Describe fine motor (handwriting, cutting) and gross motor (PE, mobility) abilities..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              )}

              {(!plopAreas.includes('communication') && !plopAreas.includes('social') && !plopAreas.includes('behavior') && !plopAreas.includes('selfcare') && !plopAreas.includes('motor')) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No functional areas selected. Go back to Student Info to add functional areas.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('academic')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button onClick={() => setActiveTab('assessment')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Assessment Data →
              </button>
            </div>
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Assessment Data & Impact</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Standardized Assessment Results</label>
                <textarea
                  value={standardizedAssessments}
                  onChange={(e) => setStandardizedAssessments(e.target.value)}
                  placeholder="e.g., WISC-V scores, Woodcock-Johnson results, state assessment scores..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Classroom-Based Assessments</label>
                <textarea
                  value={classroomAssessments}
                  onChange={(e) => setClassroomAssessments(e.target.value)}
                  placeholder="e.g., Running records, curriculum-based measures, unit tests, benchmark assessments..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Observations</label>
                <textarea
                  value={teacherObservations}
                  onChange={(e) => setTeacherObservations(e.target.value)}
                  placeholder="e.g., Classroom behavior, learning preferences, what strategies work, peer interactions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Input</label>
                <textarea
                  value={parentInput}
                  onChange={(e) => setParentInput(e.target.value)}
                  placeholder="e.g., Parent concerns, strengths observed at home, what works at home..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Impact on Access to General Education *</label>
                <textarea
                  value={impactOnEducation}
                  onChange={(e) => setImpactOnEducation(e.target.value)}
                  placeholder="How does the disability affect the student's ability to access and make progress in the general education curriculum?"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Accommodations/Modifications Used</label>
                <textarea
                  value={accommodationsUsed}
                  onChange={(e) => setAccommodationsUsed(e.target.value)}
                  placeholder="e.g., Extended time, preferential seating, graphic organizers, read-aloud, reduced assignments..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={includeTransition}
                  onChange={(e) => setIncludeTransition(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700">Include Transition Planning Section</span>
                  <p className="text-sm text-gray-500">For students 14+ (or younger if appropriate)</p>
                </div>
              </label>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('functional')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !studentIdentifier || plopAreas.length === 0}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-purple-300 transition-colors font-medium flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⏳</span> Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span> Generate PLOP
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
                  <h2 className="text-lg font-semibold text-gray-800">Generated Present Levels</h2>
                  {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                </div>
                {generatedPLOP && (
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

              {generatedPLOP ? (
                <div>
                  <textarea
                    value={editedPLOP}
                    onChange={(e) => setEditedPLOP(e.target.value)}
                    className="w-full h-[500px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">You can edit the text above before copying or exporting.</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-400">Complete the form and click Generate to create PLOP statements</p>
                </div>
              )}
            </div>

            <div className="flex justify-start">
              <button onClick={() => setActiveTab('assessment')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back to Edit
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}