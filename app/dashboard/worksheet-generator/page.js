'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import PrintableWorksheet from '../../../components/PrintableWorksheet'

export default function WorksheetGeneratorPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedWorksheets, setGeneratedWorksheets] = useState(null)
  const [editedWorksheets, setEditedWorksheets] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedText, setExtractedText] = useState('')
  const [processingFile, setProcessingFile] = useState(false)
  const fileInputRef = useRef(null)
  
  // Basic Info
  const [subject, setSubject] = useState('math')
  const [gradeLevel, setGradeLevel] = useState('4th Grade')
  const [topic, setTopic] = useState('')
  const [learningObjective, setLearningObjective] = useState('')
  const [standardCode, setStandardCode] = useState('')
  
  // Source Material
  const [sourceType, setSourceType] = useState('topic') // 'upload', 'paste', 'topic'
  const [pastedText, setPastedText] = useState('')
  
  // Worksheet Options
  const [questionTypes, setQuestionTypes] = useState(['multiple-choice', 'fill-blank'])
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [difficultyLevel, setDifficultyLevel] = useState('on-level')
  const [includeWordBank, setIncludeWordBank] = useState(true)
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [includeInstructions, setIncludeInstructions] = useState(true)
  const [extraSpacing, setExtraSpacing] = useState(false)
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(false)
  
  // Differentiation
  const [createTieredVersions, setCreateTieredVersions] = useState(false)
  
  // Batch Mode
  const [batchMode, setBatchMode] = useState(false)
  const [batchTopics, setBatchTopics] = useState([{ topic: '', objective: '' }])
  
  // Output view
  const [activeVersion, setActiveVersion] = useState('on-level')
  const [activeTab, setActiveTab] = useState('basics')
  
  const router = useRouter()

  const subjectOptions = [
    { id: 'math', label: 'Mathematics', icon: '🔢' },
    { id: 'ela', label: 'English Language Arts', icon: '📖' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'social-studies', label: 'Social Studies', icon: '🌍' },
    { id: 'foreign-language', label: 'Foreign Language', icon: '🗣️' },
    { id: 'health', label: 'Health/PE', icon: '💪' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'other', label: 'Other', icon: '📚' }
  ]

  const gradeOptions = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']

  const questionTypeOptions = [
    { id: 'multiple-choice', label: 'Multiple Choice', icon: '🔘' },
    { id: 'fill-blank', label: 'Fill in the Blank', icon: '📝' },
    { id: 'matching', label: 'Matching', icon: '🔗' },
    { id: 'true-false', label: 'True/False', icon: '✓✗' },
    { id: 'short-answer', label: 'Short Answer', icon: '✏️' },
    { id: 'ordering', label: 'Ordering/Sequencing', icon: '🔢' },
    { id: 'labeling', label: 'Diagram Labeling', icon: '🏷️' },
    { id: 'word-problems', label: 'Word Problems', icon: '📊' },
    { id: 'open-response', label: 'Open Response/Essay', icon: '📄' }
  ]

  const worksheetTypeBySubject = {
    'math': ['multiple-choice', 'fill-blank', 'word-problems', 'matching', 'ordering', 'short-answer'],
    'ela': ['multiple-choice', 'fill-blank', 'matching', 'short-answer', 'open-response', 'ordering'],
    'science': ['multiple-choice', 'fill-blank', 'matching', 'labeling', 'short-answer', 'true-false'],
    'social-studies': ['multiple-choice', 'fill-blank', 'matching', 'ordering', 'short-answer', 'true-false'],
    'foreign-language': ['multiple-choice', 'fill-blank', 'matching', 'short-answer', 'ordering'],
    'health': ['multiple-choice', 'fill-blank', 'matching', 'true-false', 'short-answer'],
    'art': ['short-answer', 'open-response', 'labeling', 'matching'],
    'music': ['multiple-choice', 'fill-blank', 'matching', 'labeling', 'true-false'],
    'other': ['multiple-choice', 'fill-blank', 'matching', 'short-answer', 'true-false']
  }

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

  const toggleQuestionType = (typeId) => {
    setQuestionTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    )
  }

  // Batch mode handlers
  const addBatchTopic = () => {
    setBatchTopics(prev => [...prev, { topic: '', objective: '' }])
  }

  const removeBatchTopic = (index) => {
    if (batchTopics.length > 1) {
      setBatchTopics(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateBatchTopic = (index, field, value) => {
    setBatchTopics(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleShowDemo = () => {
    setSubject('math')
    setGradeLevel('4th Grade')
    setTopic('Multiplication of Multi-Digit Numbers')
    setLearningObjective('Students will be able to multiply two 2-digit numbers using the standard algorithm')
    setStandardCode('CCSS.MATH.4.NBT.B.5')
    setSourceType('topic')
    setQuestionTypes(['multiple-choice', 'fill-blank', 'word-problems'])
    setNumberOfQuestions(10)
    setDifficultyLevel('on-level')
    setIncludeWordBank(false)
    setIncludeAnswerKey(true)
    setIncludeInstructions(true)
    setCreateTieredVersions(true)
    setBatchMode(false)
    setShowDemo(true)
    setGeneratedWorksheets(null)
  }

  const handleResetDemo = () => {
    setSubject('math')
    setGradeLevel('4th Grade')
    setTopic('')
    setLearningObjective('')
    setStandardCode('')
    setSourceType('topic')
    setPastedText('')
    setQuestionTypes(['multiple-choice', 'fill-blank'])
    setNumberOfQuestions(10)
    setDifficultyLevel('on-level')
    setIncludeWordBank(true)
    setIncludeAnswerKey(true)
    setIncludeInstructions(true)
    setExtraSpacing(false)
    setDyslexiaFriendly(false)
    setCreateTieredVersions(false)
    setBatchMode(false)
    setBatchTopics([{ topic: '', objective: '' }])
    setUploadedFiles([])
    setExtractedText('')
    setShowDemo(false)
    setGeneratedWorksheets(null)
    setEditedWorksheets(null)
    setActiveTab('basics')
  }

  const handleGenerate = async () => {
    if (!topic && !extractedText && !pastedText && !batchTopics[0]?.topic) {
      alert('Please enter a topic or upload source material')
      return
    }
    if (questionTypes.length === 0) {
      alert('Please select at least one question type')
      return
    }
    
    setGenerating(true)
    setGeneratedWorksheets(null)
    setSaved(false)

    try {
      const response = await fetch('/api/worksheet-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          gradeLevel,
          topic,
          learningObjective,
          standardCode,
          sourceType,
          pastedText,
          extractedText,
          questionTypes,
          numberOfQuestions,
          difficultyLevel,
          includeWordBank,
          includeAnswerKey,
          includeInstructions,
          extraSpacing,
          dyslexiaFriendly,
          createTieredVersions,
          batchMode,
          batchTopics
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedWorksheets(data.worksheets)
        setEditedWorksheets(data.worksheets)
        setActiveTab('output')
        if (createTieredVersions) {
          setActiveVersion('on-level')
        }
        await handleSave(data.worksheets)
      }
    } catch (error) {
      alert('Error generating worksheet. Please try again.')
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
          title: `Worksheet: ${topic || 'Custom'} - ${gradeLevel}`,
          toolType: 'worksheet-generator',
          toolName: 'Worksheet Generator',
          content: JSON.stringify(content),
          metadata: { subject, gradeLevel, topic, questionTypes, createTieredVersions },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleCopy = (version = null) => {
    const textToCopy = version && editedWorksheets[version] 
      ? editedWorksheets[version] 
      : (editedWorksheets.single || editedWorksheets['on-level'] || JSON.stringify(editedWorksheets))
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = async (format, version = null) => {
    const contentToExport = version && editedWorksheets[version]
      ? editedWorksheets[version]
      : (editedWorksheets.single || editedWorksheets['on-level'])
    
    if (!contentToExport) return
    
    setExporting(true)
    setExportType(format)
    
    try {
      const endpoint = format === 'pdf' ? '/api/export-pdf' : '/api/export-docx'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${topic || 'Worksheet'} - ${gradeLevel}${version ? ` (${version})` : ''}`,
          content: contentToExport,
          toolName: 'Worksheet Generator'
        }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const versionSuffix = version ? `_${version.replace('-', '_')}` : ''
        a.download = `Worksheet_${(topic || 'Custom').replace(/\s+/g, '_')}${versionSuffix}.${format === 'pdf' ? 'pdf' : 'docx'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert(`Failed to export as ${format.toUpperCase()}`)
    }
    
    setExporting(false)
    setExportType(null)
  }

  const handleExportAll = async (format) => {
    if (!createTieredVersions || !editedWorksheets) return
    
    for (const version of ['below-level', 'on-level', 'above-level']) {
      if (editedWorksheets[version]) {
        await handleExport(format, version)
        // Small delay between exports
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  const getCurrentWorksheetContent = () => {
    if (!editedWorksheets) return ''
    if (createTieredVersions) {
      return editedWorksheets[activeVersion] || ''
    }
    return editedWorksheets.single || editedWorksheets['on-level'] || ''
  }

  const updateCurrentWorksheet = (newContent) => {
    if (!editedWorksheets) return
    if (createTieredVersions) {
      setEditedWorksheets(prev => ({ ...prev, [activeVersion]: newContent }))
    } else {
      setEditedWorksheets(prev => ({ ...prev, single: newContent }))
    }
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
            <span className="text-gray-800 font-medium">Worksheet Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📄</span>
                <h1 className="text-2xl font-semibold text-gray-800">Worksheet Generator</h1>
              </div>
              <p className="text-gray-500">Create differentiated worksheets for any subject. Upload your materials or generate from a topic.</p>
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

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">🎯</span>
                <div>
                  <h3 className="text-purple-800 font-medium">3-Tier Differentiation</h3>
                  <p className="text-purple-700 text-sm">One click creates below, on, and above level versions</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">📚</span>
                <div>
                  <h3 className="text-blue-800 font-medium">Any Subject</h3>
                  <p className="text-blue-700 text-sm">Math, ELA, Science, Social Studies, and more</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">📤</span>
                <div>
                  <h3 className="text-green-800 font-medium">Export Ready</h3>
                  <p className="text-green-700 text-sm">Download as Word doc or PDF instantly</p>
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
                  <p className="text-purple-600 text-sm">We've set up a 4th grade multiplication worksheet with 3-tier differentiation. Click Generate to see the output!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['basics', 'source', 'options', 'output'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'output' && !generatedWorksheets}
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

        {/* Basics Tab */}
        {activeTab === 'basics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Worksheet Basics</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Subject *</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {subjectOptions.map(subj => (
                    <button
                      key={subj.id}
                      onClick={() => setSubject(subj.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        subject === subj.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{subj.icon}</span>
                      <span className="text-xs text-gray-700">{subj.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level *</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard Code (Optional)</label>
                  <input
                    type="text"
                    value={standardCode}
                    onChange={(e) => setStandardCode(e.target.value)}
                    placeholder="e.g., CCSS.MATH.4.NBT.B.5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic / Skill *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Multiplication of Multi-Digit Numbers, Cause and Effect, Photosynthesis"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objective (Optional)</label>
                <textarea
                  value={learningObjective}
                  onChange={(e) => setLearningObjective(e.target.value)}
                  placeholder="e.g., Students will be able to multiply two 2-digit numbers using the standard algorithm"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Batch Mode Toggle */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchMode}
                    onChange={(e) => setBatchMode(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">Batch Mode</span>
                    <p className="text-sm text-gray-500">Generate multiple worksheets at once (for a whole unit)</p>
                  </div>
                </label>

                {batchMode && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-600">Add topics for each worksheet:</p>
                    {batchTopics.map((bt, index) => (
                      <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-400 font-medium mt-2">{index + 1}.</span>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={bt.topic}
                            onChange={(e) => updateBatchTopic(index, 'topic', e.target.value)}
                            placeholder="Topic"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <input
                            type="text"
                            value={bt.objective}
                            onChange={(e) => updateBatchTopic(index, 'objective', e.target.value)}
                            placeholder="Learning objective (optional)"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        {batchTopics.length > 1 && (
                          <button onClick={() => removeBatchTopic(index)} className="text-red-500 hover:text-red-700 mt-2">✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addBatchTopic}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      + Add Another Topic
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActiveTab('source')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Source Material →
              </button>
            </div>
          </div>
        )}

        {/* Source Tab */}
        {activeTab === 'source' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📎 Source Material</h2>
              <p className="text-gray-500 text-sm mb-4">Choose how you want to provide content for your worksheet. You can upload materials, paste text, or let AI generate from your topic.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setSourceType('topic')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    sourceType === 'topic' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">✨</span>
                  <span className="font-medium text-gray-800 block">Generate from Topic</span>
                  <span className="text-sm text-gray-500">AI creates questions based on your topic</span>
                </button>
                <button
                  onClick={() => setSourceType('upload')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    sourceType === 'upload' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">📄</span>
                  <span className="font-medium text-gray-800 block">Upload Material</span>
                  <span className="text-sm text-gray-500">Use your textbook, notes, or readings</span>
                </button>
                <button
                  onClick={() => setSourceType('paste')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    sourceType === 'paste' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">📋</span>
                  <span className="font-medium text-gray-800 block">Paste Text</span>
                  <span className="text-sm text-gray-500">Copy/paste content from anywhere</span>
                </button>
              </div>

              {sourceType === 'upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    multiple
                    className="hidden"
                  />
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-600 mb-2">Drag & drop files or click to browse</p>
                  <p className="text-gray-400 text-sm mb-4">PDF, Word, text files, or images of textbook pages</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingFile}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                  >
                    {processingFile ? 'Processing...' : 'Choose Files'}
                  </button>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 text-left">
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
              )}

              {sourceType === 'paste' && (
                <div>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your text content here... (article, textbook excerpt, notes, etc.)"
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              )}

              {sourceType === 'topic' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✨</span>
                    <div>
                      <h3 className="text-green-800 font-medium">Ready to Generate!</h3>
                      <p className="text-green-700 text-sm">AI will create worksheet questions based on your topic: <strong>{topic || '(enter a topic on the previous tab)'}</strong></p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('basics')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button onClick={() => setActiveTab('options')} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                Next: Options →
              </button>
            </div>
          </div>
        )}

        {/* Options Tab */}
        {activeTab === 'options' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Worksheet Options</h2>

              {/* Question Types */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Question Types *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {questionTypeOptions.filter(qt => worksheetTypeBySubject[subject]?.includes(qt.id)).map(qt => (
                    <label key={qt.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      questionTypes.includes(qt.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={questionTypes.includes(qt.id)}
                        onChange={() => toggleQuestionType(qt.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-lg">{qt.icon}</span>
                      <span className="text-gray-700 text-sm">{qt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Number of Questions & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <select
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={5}>5 questions</option>
                    <option value={10}>10 questions</option>
                    <option value={15}>15 questions</option>
                    <option value={20}>20 questions</option>
                    <option value={25}>25 questions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Difficulty Level</label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="below-level">Below Grade Level</option>
                    <option value="on-level">On Grade Level</option>
                    <option value="above-level">Above Grade Level</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Include Answer Key</span>
                    <p className="text-sm text-gray-500">Generate teacher answer key with the worksheet</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWordBank}
                    onChange={(e) => setIncludeWordBank(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Include Word Bank</span>
                    <p className="text-sm text-gray-500">Add word bank for fill-in-the-blank questions</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInstructions}
                    onChange={(e) => setIncludeInstructions(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Include Student Instructions</span>
                    <p className="text-sm text-gray-500">Add clear directions for each section</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraSpacing}
                    onChange={(e) => setExtraSpacing(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Extra Spacing for Work</span>
                    <p className="text-sm text-gray-500">More room for students to show their work</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dyslexiaFriendly}
                    onChange={(e) => setDyslexiaFriendly(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700">Dyslexia-Friendly Format</span>
                    <p className="text-sm text-gray-500">Larger font, extra spacing, cleaner layout</p>
                  </div>
                </label>
              </div>

              {/* Differentiation */}
              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createTieredVersions}
                    onChange={(e) => setCreateTieredVersions(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">🎯 Create 3-Tier Differentiated Versions</span>
                    <p className="text-sm text-gray-500">Generate below-level, on-level, and above-level versions in one click</p>
                  </div>
                </label>

                {createTieredVersions && (
                  <div className="mt-4 bg-purple-50 rounded-xl p-4">
                    <h4 className="font-medium text-purple-800 mb-2">What you'll get:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-yellow-500 font-medium">Below Level</span>
                        <p className="text-xs text-gray-500 mt-1">Fewer questions, word bank, simplified language, visual supports</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-green-500 font-medium">On Level</span>
                        <p className="text-xs text-gray-500 mt-1">Standard grade-level content and expectations</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-blue-500 font-medium">Above Level</span>
                        <p className="text-xs text-gray-500 mt-1">Challenge questions, deeper thinking, extended responses</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('source')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || (!topic && !extractedText && !pastedText) || questionTypes.length === 0}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-purple-300 transition-colors font-medium flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⏳</span> Generating{createTieredVersions ? ' 3 Versions' : ''}...
                  </>
                ) : (
                  <>
                    <span>✨</span> Generate {createTieredVersions ? '3 Worksheets' : 'Worksheet'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-800">Generated Worksheet{createTieredVersions ? 's' : ''}</h2>
                  {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                </div>
                {generatedWorksheets && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(createTieredVersions ? activeVersion : null)} className="text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1">
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <div className="relative group">
                      <button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                        📤 Export
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleExport('docx', createTieredVersions ? activeVersion : null)}
                          disabled={exporting}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 rounded-t-lg"
                        >
                          📄 Download as Word
                        </button>
                        <button
                          onClick={() => handleExport('pdf', createTieredVersions ? activeVersion : null)}
                          disabled={exporting}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                        >
                          📑 Download as PDF
                        </button>
                        {createTieredVersions && (
                          <>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={() => handleExportAll('docx')}
                              disabled={exporting}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                            >
                              📦 All 3 as Word
                            </button>
                            <button
                              onClick={() => handleExportAll('pdf')}
                              disabled={exporting}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 rounded-b-lg"
                            >
                              📦 All 3 as PDF
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Version Tabs for Differentiated */}
              {createTieredVersions && generatedWorksheets && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveVersion('below-level')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeVersion === 'below-level'
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🟡 Below Level
                  </button>
                  <button
                    onClick={() => setActiveVersion('on-level')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeVersion === 'on-level'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🟢 On Level
                  </button>
                  <button
                    onClick={() => setActiveVersion('above-level')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      activeVersion === 'above-level'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🔵 Above Level
                  </button>
                </div>
              )}

              {generatedWorksheets ? (
                <div>
                  <textarea
                    value={getCurrentWorksheetContent()}
                    onChange={(e) => updateCurrentWorksheet(e.target.value)}
                    className="w-full h-[500px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">You can edit the worksheet above before exporting.</p>
                  <PrintableWorksheet 
                    title={`${topic || 'Worksheet'} - ${gradeLevel}`}
                    subtitle={standardCode}
                    gradeLevel={gradeLevel}
                    content={getCurrentWorksheetContent()}
                    includeAnswerKey={includeAnswerKey}
                    extraSpacing={extraSpacing}
                    dyslexiaFriendly={dyslexiaFriendly}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-400">Complete the form and click Generate to create your worksheet</p>
                </div>
              )}
            </div>

            <div className="flex justify-start">
              <button onClick={() => setActiveTab('options')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                ← Back to Options
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}