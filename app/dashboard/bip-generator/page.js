'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BIPGeneratorPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedBIP, setGeneratedBIP] = useState('')
  const [editedBIP, setEditedBIP] = useState('')
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
  const [bipDate, setBipDate] = useState(new Date().toISOString().split('T')[0])
  const [reviewDate, setReviewDate] = useState('')
  
  // Problem Behavior(s)
  const [problemBehaviors, setProblemBehaviors] = useState([
    { behavior: '', definition: '', frequency: '', duration: '', intensity: '', latency: '', settings: '' }
  ])
  
  // FBA Summary / Function
  const [primaryFunction, setPrimaryFunction] = useState('')
  const [secondaryFunction, setSecondaryFunction] = useState('')
  const [functionHypothesis, setFunctionHypothesis] = useState('')
  const [antecedents, setAntecedents] = useState('')
  const [consequences, setConsequences] = useState('')
  
  // Replacement Behavior
  const [replacementBehaviors, setReplacementBehaviors] = useState([
    { behavior: '', howItMeetsFunction: '', teachingPlan: '' }
  ])
  
  // Intervention Strategies
  const [antecedentStrategies, setAntecedentStrategies] = useState('')
  const [teachingStrategies, setTeachingStrategies] = useState('')
  const [consequenceStrategies, setConsequenceStrategies] = useState('')
  const [reinforcementPlan, setReinforcementPlan] = useState('')
  
  // Student Info
  const [studentStrengths, setStudentStrengths] = useState('')
  const [studentInterests, setStudentInterests] = useState('')
  const [previousInterventions, setPreviousInterventions] = useState('')
  
  // Progress Monitoring
  const [dataCollectionMethod, setDataCollectionMethod] = useState('')
  const [monitoringFrequency, setMonitoringFrequency] = useState('daily')
  const [goalCriteria, setGoalCriteria] = useState('')
  
  // Implementation
  const [staffResponsible, setStaffResponsible] = useState('')
  const [trainingNeeded, setTrainingNeeded] = useState('')
  const [communicationPlan, setCommunicationPlan] = useState('')
  
  // Options
  const [includeDataSheet, setIncludeDataSheet] = useState(true)
  const [includeCrisisPlan, setIncludeCrisisPlan] = useState(false)
  
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
    setProblemBehaviors(prev => [...prev, { behavior: '', definition: '', frequency: '', duration: '', intensity: '', latency: '', settings: '' }])
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

  // Replacement behavior handlers
  const addReplacementBehavior = () => {
    setReplacementBehaviors(prev => [...prev, { behavior: '', howItMeetsFunction: '', teachingPlan: '' }])
  }

  const updateReplacementBehavior = (index, field, value) => {
    setReplacementBehaviors(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeReplacementBehavior = (index) => {
    if (replacementBehaviors.length > 1) {
      setReplacementBehaviors(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleShowDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('Emotional Disturbance')
    setBipDate(new Date().toISOString().split('T')[0])
    setReviewDate('2025-03-15')
    setProblemBehaviors([
      { 
        behavior: 'Physical Aggression', 
        definition: 'Hitting, kicking, or pushing peers and adults. Includes throwing objects at others. Does not include verbal aggression or property destruction.',
        frequency: '4 incidents per day',
        duration: '2-5 minutes per episode',
        intensity: 'Moderate to High',
        latency: 'Within 30 seconds of demand',
        settings: 'Most frequent during morning academics and transitions'
      }
    ])
    setPrimaryFunction('escape-task')
    setSecondaryFunction('control')
    setFunctionHypothesis('When presented with academic demands (particularly reading/writing), Student A engages in physical aggression to escape or avoid the task. 85% of incidents occur during academic instruction. Behavior typically results in task removal or reduced demands.')
    setAntecedents('Academic demands, transitions, reading tasks, writing tasks, tasks perceived as difficult')
    setConsequences('Task removed, sent to calm corner, reduced assignment length, adult attention')
    setReplacementBehaviors([
      { 
        behavior: 'Request a break using break card', 
        howItMeetsFunction: 'Allows appropriate escape from task while maintaining dignity',
        teachingPlan: 'Direct instruction, role play, prompted practice during low-stress times'
      },
      { 
        behavior: 'Ask for help', 
        howItMeetsFunction: 'Gets support before frustration escalates',
        teachingPlan: 'Script practice, visual cue card, immediate reinforcement'
      }
    ])
    setAntecedentStrategies(`- Pre-teach expectations before difficult tasks
- Provide choice in task order or materials
- Break tasks into smaller chunks
- Offer sensory break before anticipated triggers
- Use visual schedule for transitions
- Reduce task length when frustration signs appear`)
    setTeachingStrategies(`- Daily practice of break request during calm times
- Social stories about asking for help
- Role play frustration scenarios
- Teach self-monitoring using rating scale
- Practice "I need help" script`)
    setConsequenceStrategies(`When replacement behavior occurs:
- Immediately honor break request (1-2 min)
- Provide specific praise
- Give preferred task/activity after returning

When problem behavior occurs:
- Remain calm, minimize attention
- Block/redirect without verbal engagement
- Do not remove task (escape extinction)
- Prompt replacement behavior when calm`)
    setReinforcementPlan('Token system earning iPad time. 1 token per successful break request or help-seeking. 5 tokens = 5 min iPad. Daily behavior chart sent home.')
    setStudentStrengths('Strong verbal skills, good relationship with para-educator, responds to humor, enjoys helping others, interested in hands-on activities')
    setStudentInterests('Minecraft, dinosaurs, LEGOs, being a helper, iPad time')
    setPreviousInterventions('Verbal reminders (ineffective), loss of recess (escalated behavior), sensory breaks (somewhat helpful), preferential seating (no change)')
    setDataCollectionMethod('Frequency count of aggression incidents and break card usage. ABC data for first week.')
    setMonitoringFrequency('daily')
    setGoalCriteria('Reduce aggression to 1 or fewer incidents per day within 6 weeks. Increase appropriate break requests to 3+ per day.')
    setStaffResponsible('General ed teacher (classroom), Special ed teacher (data review), Para-educator (prompting/reinforcement)')
    setTrainingNeeded('Crisis prevention refresher, break card system training, escape extinction procedures')
    setCommunicationPlan('Daily behavior chart to parents. Weekly check-in email. Emergency contact if crisis occurs.')
    setIncludeDataSheet(true)
    setIncludeCrisisPlan(true)
    setGeneratedBIP('')
    setActiveTab('behavior')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('')
    setBipDate(new Date().toISOString().split('T')[0])
    setReviewDate('')
    setProblemBehaviors([{ behavior: '', definition: '', frequency: '', duration: '', intensity: '', latency: '', settings: '' }])
    setPrimaryFunction('')
    setSecondaryFunction('')
    setFunctionHypothesis('')
    setAntecedents('')
    setConsequences('')
    setReplacementBehaviors([{ behavior: '', howItMeetsFunction: '', teachingPlan: '' }])
    setAntecedentStrategies('')
    setTeachingStrategies('')
    setConsequenceStrategies('')
    setReinforcementPlan('')
    setStudentStrengths('')
    setStudentInterests('')
    setPreviousInterventions('')
    setDataCollectionMethod('')
    setMonitoringFrequency('daily')
    setGoalCriteria('')
    setStaffResponsible('')
    setTrainingNeeded('')
    setCommunicationPlan('')
    setUploadedFiles([])
    setExtractedText('')
    setGeneratedBIP('')
    setEditedBIP('')
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
    setGeneratedBIP('')

    try {
      const response = await fetch('/api/bip-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIdentifier,
          gradeLevel,
          setting,
          disabilityCategory,
          bipDate,
          reviewDate,
          problemBehaviors,
          primaryFunction: functionOptions.find(f => f.id === primaryFunction)?.label || primaryFunction,
          secondaryFunction: functionOptions.find(f => f.id === secondaryFunction)?.label || secondaryFunction,
          functionHypothesis,
          antecedents,
          consequences,
          replacementBehaviors,
          antecedentStrategies,
          teachingStrategies,
          consequenceStrategies,
          reinforcementPlan,
          studentStrengths,
          studentInterests,
          previousInterventions,
          dataCollectionMethod,
          monitoringFrequency,
          goalCriteria,
          staffResponsible,
          trainingNeeded,
          communicationPlan,
          extractedDocumentText: extractedText,
          includeDataSheet,
          includeCrisisPlan,
        }),
      })

      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedBIP(data.bip)
        setEditedBIP(data.bip)
        await handleSave(data.bip)
        setActiveTab('output')
      }
    } catch (error) {
      alert('Error generating BIP. Please try again.')
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
          title: `BIP: ${studentIdentifier} - ${problemBehaviors[0]?.behavior || 'Behavior'}`,
          toolType: 'bip-generator',
          toolName: 'BIP Generator',
          content,
          metadata: { studentIdentifier, gradeLevel, primaryFunction },
        }),
      })
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedBIP)
    alert('BIP copied to clipboard!')
  }

  const handleExport = async () => {
    if (!editedBIP) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Behavior Intervention Plan - ${studentIdentifier}`,
          content: editedBIP,
          toolName: 'BIP Generator'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `BIP_${studentIdentifier.replace(/\s+/g, '_')}.docx`
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
            <span className="text-gray-800 font-medium">BIP Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📋</span>
                <h1 className="text-2xl font-semibold text-gray-800">Behavior Intervention Plan Generator</h1>
              </div>
              <p className="text-gray-500">Generate comprehensive BIPs based on FBA data. Includes baseline measures, intervention strategies, and progress monitoring.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">🔒</span>
                <div>
                  <h3 className="text-green-800 font-medium">Privacy-First</h3>
                  <p className="text-green-700 text-sm">Use identifiers like "Student A". BIPs use "[Student Name]" placeholders for FERPA compliance.</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">⚖️</span>
                <div>
                  <h3 className="text-blue-800 font-medium">IDEA Compliant</h3>
                  <p className="text-blue-700 text-sm">Includes baseline measures, intervention strategies, and progress monitoring schedule as required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['upload', 'behavior', 'function', 'replacement', 'strategies', 'monitoring', 'output'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'output' && !generatedBIP}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📎 Upload FBA & Related Documents</h2>
              <p className="text-gray-500 text-sm mb-4">Upload the FBA, IEP, previous BIPs, or behavior data sheets. The AI will use this information to create a more comprehensive BIP.</p>
              
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Identifier</label>
                  <input type="text" value={studentIdentifier} onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="Student A"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
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
                    <option value="Emotional Disturbance">Emotional Disturbance</option>
                    <option value="Autism">Autism</option>
                    <option value="Other Health Impairment">Other Health Impairment</option>
                    <option value="Specific Learning Disability">Specific Learning Disability</option>
                    <option value="Intellectual Disability">Intellectual Disability</option>
                    <option value="Multiple Disabilities">Multiple Disabilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BIP Date</label>
                  <input type="date" value={bipDate} onChange={(e) => setBipDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
                  <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Student Strengths & Interests */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Strengths & Interests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                  <textarea value={studentStrengths} onChange={(e) => setStudentStrengths(e.target.value)}
                    placeholder="What is the student good at? Skills, relationships, positive traits..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests & Reinforcers</label>
                  <textarea value={studentInterests} onChange={(e) => setStudentInterests(e.target.value)}
                    placeholder="What motivates the student? Favorite activities, items, topics..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
              </div>
            </div>

            <button onClick={() => setActiveTab('behavior')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
              Next: Problem Behavior →
            </button>
          </div>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">⚠️ Target Behavior(s) & Baseline Data</h2>
                  <p className="text-gray-500 text-sm">Define each problem behavior with baseline measures</p>
                </div>
                <button onClick={addProblemBehavior} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  + Add Behavior
                </button>
              </div>

              <div className="space-y-6">
                {problemBehaviors.map((pb, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-lg">Behavior {index + 1}</span>
                      {problemBehaviors.length > 1 && (
                        <button onClick={() => removeProblemBehavior(index)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Behavior Name *</label>
                        <input type="text" value={pb.behavior} onChange={(e) => updateProblemBehavior(index, 'behavior', e.target.value)}
                          placeholder="e.g., Physical Aggression"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Settings Where It Occurs</label>
                        <input type="text" value={pb.settings} onChange={(e) => updateProblemBehavior(index, 'settings', e.target.value)}
                          placeholder="e.g., Morning academics, transitions"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Operational Definition *</label>
                      <textarea value={pb.definition} onChange={(e) => updateProblemBehavior(index, 'definition', e.target.value)}
                        placeholder="Observable, measurable description of what the behavior looks like..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                        <input type="text" value={pb.frequency} onChange={(e) => updateProblemBehavior(index, 'frequency', e.target.value)}
                          placeholder="e.g., 4x per day"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                        <input type="text" value={pb.duration} onChange={(e) => updateProblemBehavior(index, 'duration', e.target.value)}
                          placeholder="e.g., 2-5 minutes"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Intensity</label>
                        <input type="text" value={pb.intensity} onChange={(e) => updateProblemBehavior(index, 'intensity', e.target.value)}
                          placeholder="e.g., Moderate-High"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Latency</label>
                        <input type="text" value={pb.latency} onChange={(e) => updateProblemBehavior(index, 'latency', e.target.value)}
                          placeholder="e.g., Within 30 sec"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('upload')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 Function of Behavior (From FBA)</h2>
              
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Function</label>
                  <select value={secondaryFunction} onChange={(e) => setSecondaryFunction(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="">None</option>
                    {functionOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Function Hypothesis Statement</label>
                <textarea value={functionHypothesis} onChange={(e) => setFunctionHypothesis(e.target.value)}
                  placeholder="When [antecedent], [Student] engages in [behavior] in order to [function]. This is supported by [evidence]..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antecedents/Triggers</label>
                  <textarea value={antecedents} onChange={(e) => setAntecedents(e.target.value)}
                    placeholder="What typically happens before the behavior?"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consequences/What Happens After</label>
                  <textarea value={consequences} onChange={(e) => setConsequences(e.target.value)}
                    placeholder="What typically happens after the behavior? What does the student get or avoid?"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Previous Interventions</h2>
              <p className="text-gray-500 text-sm mb-4">What has been tried before? What worked or didn't?</p>
              <textarea value={previousInterventions} onChange={(e) => setPreviousInterventions(e.target.value)}
                placeholder="List interventions tried and results. e.g., 'Verbal reminders - ineffective, Sensory breaks - somewhat helpful'"
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('behavior')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('replacement')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: Replacement Behavior →
              </button>
            </div>
          </div>
        )}

        {/* Replacement Tab */}
        {activeTab === 'replacement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">✅ Replacement Behaviors</h2>
                  <p className="text-gray-500 text-sm">Functionally equivalent behaviors that serve the same purpose</p>
                </div>
                <button onClick={addReplacementBehavior} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  + Add Replacement
                </button>
              </div>

              <div className="space-y-4">
                {replacementBehaviors.map((rb, index) => (
                  <div key={index} className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded-lg">Replacement {index + 1}</span>
                      {replacementBehaviors.length > 1 && (
                        <button onClick={() => removeReplacementBehavior(index)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Replacement Behavior</label>
                        <input type="text" value={rb.behavior} onChange={(e) => updateReplacementBehavior(index, 'behavior', e.target.value)}
                          placeholder="e.g., Request a break using break card"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">How It Meets the Same Function</label>
                        <input type="text" value={rb.howItMeetsFunction} onChange={(e) => updateReplacementBehavior(index, 'howItMeetsFunction', e.target.value)}
                          placeholder="e.g., Allows appropriate escape from task while maintaining dignity"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">How It Will Be Taught</label>
                        <input type="text" value={rb.teachingPlan} onChange={(e) => updateReplacementBehavior(index, 'teachingPlan', e.target.value)}
                          placeholder="e.g., Direct instruction, role play, prompted practice"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('function')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('strategies')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: Intervention Strategies →
              </button>
            </div>
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">🛡️ Antecedent Strategies</h2>
              <p className="text-gray-500 text-sm mb-4">Strategies to prevent the behavior from occurring</p>
              <textarea value={antecedentStrategies} onChange={(e) => setAntecedentStrategies(e.target.value)}
                placeholder={`List strategies to modify antecedents:
- Pre-teach expectations
- Provide choices
- Break tasks into smaller chunks
- Use visual schedules...`}
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">📚 Teaching Strategies</h2>
              <p className="text-gray-500 text-sm mb-4">How replacement behaviors will be taught</p>
              <textarea value={teachingStrategies} onChange={(e) => setTeachingStrategies(e.target.value)}
                placeholder={`List teaching strategies:
- Direct instruction during calm times
- Social stories
- Role play scenarios
- Visual cue cards...`}
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">⚖️ Consequence Strategies</h2>
              <p className="text-gray-500 text-sm mb-4">How to respond when behaviors occur</p>
              <textarea value={consequenceStrategies} onChange={(e) => setConsequenceStrategies(e.target.value)}
                placeholder={`When replacement behavior occurs:
- Immediately honor the request
- Provide specific praise
- Give reinforcement

When problem behavior occurs:
- Remain calm
- Minimize attention
- Prompt replacement behavior...`}
                rows={8}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">🏆 Reinforcement Plan</h2>
              <textarea value={reinforcementPlan} onChange={(e) => setReinforcementPlan(e.target.value)}
                placeholder="Describe the reinforcement system: token economy, behavior chart, specific rewards, frequency of reinforcement..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('replacement')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={() => setActiveTab('monitoring')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors">
                Next: Progress Monitoring →
              </button>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Progress Monitoring</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Collection Method</label>
                  <textarea value={dataCollectionMethod} onChange={(e) => setDataCollectionMethod(e.target.value)}
                    placeholder="How will data be collected? e.g., Frequency count, ABC data, interval recording..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal/Success Criteria</label>
                  <textarea value={goalCriteria} onChange={(e) => setGoalCriteria(e.target.value)}
                    placeholder="What does success look like? e.g., Reduce aggression to 1 or fewer per day within 6 weeks..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monitoring Frequency</label>
                <select value={monitoringFrequency} onChange={(e) => setMonitoringFrequency(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  <option value="daily">Daily</option>
                  <option value="twice-weekly">Twice Weekly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">👥 Implementation Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Responsible</label>
                  <textarea value={staffResponsible} onChange={(e) => setStaffResponsible(e.target.value)}
                    placeholder="Who will implement? Include roles. e.g., General ed teacher (classroom), Special ed (data review)..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Needed</label>
                  <textarea value={trainingNeeded} onChange={(e) => setTrainingNeeded(e.target.value)}
                    placeholder="What training do staff need? e.g., Crisis prevention, break card system, reinforcement procedures..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Communication Plan</label>
                  <textarea value={communicationPlan} onChange={(e) => setCommunicationPlan(e.target.value)}
                    placeholder="How will progress be communicated? e.g., Daily chart to parents, weekly team check-in..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Include in BIP</h2>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeDataSheet} onChange={(e) => setIncludeDataSheet(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-700">Data Collection Sheet Template</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeCrisisPlan} onChange={(e) => setIncludeCrisisPlan(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-700">Crisis/Safety Plan</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setActiveTab('strategies')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={handleGenerate} disabled={generating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3">
                {generating ? (
                  <><span className="animate-spin">⏳</span>Generating BIP...</>
                ) : (
                  <><span>📋</span>Generate BIP</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedBIP && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated BIP</h2>
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
              <textarea value={editedBIP} onChange={(e) => setEditedBIP(e.target.value)}
                rows={40}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">⚠️</span>
                <div>
                  <h3 className="text-amber-800 font-medium">Before Implementation</h3>
                  <ul className="text-amber-700 text-sm mt-1 list-disc list-inside">
                    <li>Review with IEP team and obtain approvals</li>
                    <li>Train all staff on procedures</li>
                    <li>Set up data collection systems</li>
                    <li>Schedule review date</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveTab('monitoring')} className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Edit
            </button>
          </div>
        )}
      </main>
    </div>
  )
}