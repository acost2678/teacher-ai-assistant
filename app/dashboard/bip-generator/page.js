'use client'

import { useState, useEffect } from 'react'
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
  
  // Student Context
  const [studentIdentifier, setStudentIdentifier] = useState('Student A')
  const [gradeLevel, setGradeLevel] = useState('Elementary (K-5)')
  const [setting, setSetting] = useState('General Education Classroom')
  const [disabilityCategory, setDisabilityCategory] = useState('')
  
  // From FBA - Target Behavior
  const [targetBehavior, setTargetBehavior] = useState('')
  const [behaviorDefinition, setBehaviorDefinition] = useState('')
  const [baselineData, setBaselineData] = useState('')
  
  // From FBA - Function
  const [primaryFunction, setPrimaryFunction] = useState('escape')
  const [functionExplanation, setFunctionExplanation] = useState('')
  
  // BIP Specifics
  const [replacementBehavior, setReplacementBehavior] = useState('')
  const [studentStrengths, setStudentStrengths] = useState('')
  const [studentInterests, setStudentInterests] = useState('')
  const [previousInterventions, setPreviousInterventions] = useState('')
  const [staffInvolved, setStaffInvolved] = useState('')
  
  // Output options
  const [includeDataSheet, setIncludeDataSheet] = useState(true)
  const [includeCrisisPlan, setIncludeCrisisPlan] = useState(false)
  
  const [activeTab, setActiveTab] = useState('fba-data') // 'fba-data' | 'bip-details' | 'output'
  
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
    { id: 'escape', label: 'Escape/Avoidance', desc: 'Student engages in behavior to get away from or avoid tasks, demands, people, or situations' },
    { id: 'attention', label: 'Attention', desc: 'Student engages in behavior to get attention from adults or peers (positive or negative)' },
    { id: 'access', label: 'Access to Tangibles', desc: 'Student engages in behavior to obtain items, activities, or preferred events' },
    { id: 'sensory', label: 'Sensory/Automatic', desc: 'Student engages in behavior because it feels good or provides internal stimulation' },
    { id: 'multiple', label: 'Multiple Functions', desc: 'Behavior serves more than one function depending on context' },
  ]

  const handleShowDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('Emotional Disturbance')
    setTargetBehavior('Physical Aggression')
    setBehaviorDefinition('Hitting, kicking, or pushing peers and adults. Includes throwing objects at others. Does not include verbal aggression or property destruction without intent to harm.')
    setBaselineData('Average 4 incidents per day, typically lasting 2-5 minutes each. Most frequent during morning academic blocks and transitions. Intensity: moderate to high.')
    setPrimaryFunction('escape')
    setFunctionExplanation('When presented with academic demands, particularly reading and writing tasks, Student A engages in physical aggression to escape or avoid the task. This is supported by data showing 85% of incidents occur during academic instruction, and behavior typically results in task removal or reduced demands.')
    setReplacementBehavior('Request a break using a break card, ask for help, or request an alternative assignment')
    setStudentStrengths('Strong verbal skills, good relationship with para-educator, responds well to humor, enjoys helping others, interested in hands-on activities')
    setStudentInterests('Minecraft, dinosaurs, building with LEGOs, being a helper, earning time on iPad')
    setPreviousInterventions('Verbal reminders (ineffective), loss of recess (escalated behavior), sensory breaks (somewhat helpful), preferential seating (no change)')
    setStaffInvolved('General education teacher, special education teacher, para-educator, school counselor')
    setIncludeDataSheet(true)
    setIncludeCrisisPlan(true)
    setGeneratedBIP('')
    setActiveTab('fba-data')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setStudentIdentifier('Student A')
    setGradeLevel('Elementary (K-5)')
    setSetting('General Education Classroom')
    setDisabilityCategory('')
    setTargetBehavior('')
    setBehaviorDefinition('')
    setBaselineData('')
    setPrimaryFunction('escape')
    setFunctionExplanation('')
    setReplacementBehavior('')
    setStudentStrengths('')
    setStudentInterests('')
    setPreviousInterventions('')
    setStaffInvolved('')
    setIncludeDataSheet(true)
    setIncludeCrisisPlan(false)
    setGeneratedBIP('')
    setEditedBIP('')
    setActiveTab('fba-data')
    setShowDemo(false)
  }

  const handleGenerate = async () => {
    if (!targetBehavior) {
      alert('Please enter the target behavior')
      return
    }
    if (!primaryFunction) {
      alert('Please select the behavior function')
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
          targetBehavior,
          behaviorDefinition,
          baselineData,
          primaryFunction,
          functionExplanation,
          replacementBehavior,
          studentStrengths,
          studentInterests,
          previousInterventions,
          staffInvolved,
          includeDataSheet,
          includeCrisisPlan,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        setGeneratedBIP(data.bip)
        setEditedBIP(data.bip)
        setActiveTab('output')
      }
    } catch (error) {
      alert('Error generating BIP. Please try again.')
    }

    setGenerating(false)
  }

  const handleExport = async () => {
    if (!generatedBIP) return
    setExporting(true)

    try {
      const content = editedBIP || generatedBIP

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Behavior Intervention Plan - ${studentIdentifier}`,
          content: content,
          toolName: 'BIP Generator'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `BIP_${studentIdentifier.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
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
    navigator.clipboard.writeText(editedBIP || generatedBIP)
    alert('BIP copied to clipboard!')
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
                <h1 className="text-2xl font-semibold text-gray-800">BIP Generator</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">COMPLIANCE</span>
              </div>
              <p className="text-gray-500">Generate a comprehensive Behavior Intervention Plan from your FBA data. Function-based strategies, replacement behaviors, and implementation guidance.</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Student names and data are never stored. Use identifiers like "Student A". The BIP uses "[Student Name]" placeholders - add real names after downloading to your secure system.</p>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-xl">⚠️</span>
              <div>
                <h3 className="text-amber-800 font-medium">Professional Review Required</h3>
                <p className="text-amber-700 text-sm">This tool assists with documentation but does not replace professional judgment. All BIPs should be reviewed by qualified personnel and the IEP team before implementation.</p>
              </div>
            </div>
          </div>

          {/* Workflow Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h3 className="text-blue-800 font-medium">FBA → BIP Workflow</h3>
                <p className="text-blue-700 text-sm">This tool works best when you have completed an FBA first. Enter your FBA findings (behavior definition, function hypothesis) to generate a function-based BIP.</p>
              </div>
            </div>
          </div>

          {/* See Demo Button */}
          <div className="flex gap-3">
            {!showDemo ? (
              <button
                onClick={handleShowDemo}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                <span>✨</span> See Demo
              </button>
            ) : (
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <span>↺</span> Reset Demo
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('fba-data')}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'fba-data'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. FBA Data
          </button>
          <button
            onClick={() => setActiveTab('bip-details')}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'bip-details'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            2. BIP Details
          </button>
          <button
            onClick={() => setActiveTab('output')}
            disabled={!generatedBIP}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'output'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            3. Generated BIP
          </button>
        </div>

        {/* FBA Data Tab */}
        {activeTab === 'fba-data' && (
          <div className="space-y-6">
            {/* Student Info */}
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
                    <option value="Transition (18-22)">Transition (18-22)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Setting</label>
                  <select value={setting} onChange={(e) => setSetting(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="General Education Classroom">General Education Classroom</option>
                    <option value="Special Education Classroom">Special Education Classroom</option>
                    <option value="Resource Room">Resource Room</option>
                    <option value="Self-Contained Classroom">Self-Contained Classroom</option>
                    <option value="Inclusion Setting">Inclusion Setting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disability Category (optional)</label>
                  <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="">Not specified</option>
                    <option value="Autism">Autism</option>
                    <option value="Emotional Disturbance">Emotional Disturbance</option>
                    <option value="Specific Learning Disability">Specific Learning Disability</option>
                    <option value="ADHD/Other Health Impairment">ADHD/Other Health Impairment</option>
                    <option value="Intellectual Disability">Intellectual Disability</option>
                    <option value="Multiple Disabilities">Multiple Disabilities</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target Behavior from FBA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Target Behavior (from FBA)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Behavior Name</label>
                  <input
                    type="text"
                    value={targetBehavior}
                    onChange={(e) => setTargetBehavior(e.target.value)}
                    placeholder="e.g., Physical Aggression, Task Refusal, Elopement"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operational Definition (from FBA)</label>
                  <textarea
                    value={behaviorDefinition}
                    onChange={(e) => setBehaviorDefinition(e.target.value)}
                    placeholder="Copy your operational definition from the FBA. Include what the behavior looks like, examples, and non-examples."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baseline Data (from FBA)</label>
                  <textarea
                    value={baselineData}
                    onChange={(e) => setBaselineData(e.target.value)}
                    placeholder="Frequency, duration, intensity from your FBA. e.g., 'Average 4 incidents per day, lasting 2-5 minutes each'"
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Function from FBA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Behavior Function (from FBA)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Primary Function</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {functionOptions.map(func => (
                      <button
                        key={func.id}
                        onClick={() => setPrimaryFunction(func.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          primaryFunction === func.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <span className="font-medium text-gray-800 block">{func.label}</span>
                        <span className="text-xs text-gray-500">{func.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Function Hypothesis Statement (from FBA)</label>
                  <textarea
                    value={functionExplanation}
                    onChange={(e) => setFunctionExplanation(e.target.value)}
                    placeholder="Paste your hypothesis statement. e.g., 'When presented with academic demands, [Student] engages in [behavior] in order to escape/avoid the task.'"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setActiveTab('bip-details')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl transition-colors"
            >
              Next: BIP Details →
            </button>
          </div>
        )}

        {/* BIP Details Tab */}
        {activeTab === 'bip-details' && (
          <div className="space-y-6">
            {/* Replacement Behavior */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Replacement Behavior</h2>
              <p className="text-sm text-gray-500 mb-4">What should the student do INSTEAD? This should serve the same function as the problem behavior.</p>
              <textarea
                value={replacementBehavior}
                onChange={(e) => setReplacementBehavior(e.target.value)}
                placeholder="e.g., Request a break using a break card, ask for help, use a calm-down strategy"
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            {/* Student Strengths & Interests */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Strengths & Interests</h2>
              <p className="text-sm text-gray-500 mb-4">Used to personalize reinforcement and build on what works</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                  <textarea
                    value={studentStrengths}
                    onChange={(e) => setStudentStrengths(e.target.value)}
                    placeholder="What is the student good at? Relationships, skills, positive traits..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests & Preferred Activities</label>
                  <textarea
                    value={studentInterests}
                    onChange={(e) => setStudentInterests(e.target.value)}
                    placeholder="What motivates the student? Favorite activities, items, topics..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Previous Interventions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Previous Interventions Tried</h2>
              <p className="text-sm text-gray-500 mb-4">What has been tried before? What worked or didn't work?</p>
              <textarea
                value={previousInterventions}
                onChange={(e) => setPreviousInterventions(e.target.value)}
                placeholder="List interventions tried and outcomes. e.g., 'Verbal reminders - ineffective, Sensory breaks - somewhat helpful'"
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            {/* Staff Involved */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Staff Involved in Implementation</h2>
              <textarea
                value={staffInvolved}
                onChange={(e) => setStaffInvolved(e.target.value)}
                placeholder="Who will implement this BIP? e.g., General ed teacher, special ed teacher, para-educator, counselor"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            {/* Output Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Include in BIP</h2>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDataSheet}
                    onChange={(e) => setIncludeDataSheet(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Data Collection Sheet Template</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCrisisPlan}
                    onChange={(e) => setIncludeCrisisPlan(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Crisis/Safety Plan (if behavior is high-intensity)</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating BIP...
                </>
              ) : (
                <>
                  <span>📋</span>
                  Generate BIP
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('fba-data')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to FBA Data
            </button>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedBIP && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated BIP</h2>
                  <p className="text-gray-500 text-sm">Review and edit before finalizing. Replace "[Student Name]" with actual name in your secure system.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {exporting ? 'Exporting...' : '📄 Export (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            {/* BIP Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <textarea
                value={editedBIP}
                onChange={(e) => setEditedBIP(e.target.value)}
                rows={35}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
              />
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">⚠️</span>
                <div>
                  <h3 className="text-amber-800 font-medium">Before Implementation</h3>
                  <ul className="text-amber-700 text-sm mt-1 list-disc list-inside">
                    <li>Review with the IEP team and obtain necessary approvals</li>
                    <li>Train all staff on implementation procedures</li>
                    <li>Replace "[Student Name]" with actual name in your secure system</li>
                    <li>Set up data collection systems before starting</li>
                    <li>Schedule a review date to assess effectiveness</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('bip-details')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Edit Details
            </button>
          </div>
        )}
      </main>
    </div>
  )
}