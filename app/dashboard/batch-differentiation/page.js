'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BatchDifferentiationPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // Settings
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [subject, setSubject] = useState('English Language Arts')
  const [assignmentType, setAssignmentType] = useState('worksheet')
  
  // Input
  const [originalAssignment, setOriginalAssignment] = useState('')
  const [learningObjective, setLearningObjective] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Tier options
  const [generateBelow, setGenerateBelow] = useState(true)
  const [generateOn, setGenerateOn] = useState(true)
  const [generateAbove, setGenerateAbove] = useState(true)
  
  // Output
  const [generatedTiers, setGeneratedTiers] = useState(null)
  const [editedTiers, setEditedTiers] = useState({ below: '', on: '', above: '' })
  const [activeTab, setActiveTab] = useState('input') // 'input' | 'output'
  const [selectedTier, setSelectedTier] = useState('on')
  
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

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('English Language Arts')
    setAssignmentType('worksheet')
    setOriginalAssignment(`Reading Comprehension: "The Water Cycle"

Read the passage about the water cycle and answer the following questions.

1. What are the four main stages of the water cycle? Explain each one in 2-3 sentences.

2. How does the sun contribute to the water cycle? Use evidence from the text.

3. Compare and contrast evaporation and condensation.

4. Write a paragraph explaining why the water cycle is important for life on Earth.

5. Create a diagram of the water cycle with labels and arrows showing the direction of water movement.`)
    setLearningObjective('Students will understand the stages of the water cycle and explain how they connect to each other.')
    setAdditionalNotes('Some students have reading IEPs. Advanced students are ready for extension activities.')
    setGenerateBelow(true)
    setGenerateOn(true)
    setGenerateAbove(true)
    setGeneratedTiers(null)
    setActiveTab('input')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('English Language Arts')
    setAssignmentType('worksheet')
    setOriginalAssignment('')
    setLearningObjective('')
    setAdditionalNotes('')
    setGenerateBelow(true)
    setGenerateOn(true)
    setGenerateAbove(true)
    setGeneratedTiers(null)
    setEditedTiers({ below: '', on: '', above: '' })
    setActiveTab('input')
    setShowDemo(false)
  }

  const handleGenerate = async () => {
    if (!originalAssignment.trim()) {
      alert('Please enter the original assignment')
      return
    }

    if (!generateBelow && !generateOn && !generateAbove) {
      alert('Please select at least one tier to generate')
      return
    }

    setGenerating(true)
    setGeneratedTiers(null)

    try {
      const response = await fetch('/api/batch-differentiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          subject,
          assignmentType,
          originalAssignment,
          learningObjective,
          additionalNotes,
          generateBelow,
          generateOn,
          generateAbove,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        setGeneratedTiers(data.tiers)
        setEditedTiers({
          below: data.tiers.below || '',
          on: data.tiers.on || '',
          above: data.tiers.above || '',
        })
        setActiveTab('output')
        // Set selected tier to first available
        if (generateBelow) setSelectedTier('below')
        else if (generateOn) setSelectedTier('on')
        else if (generateAbove) setSelectedTier('above')
      }
    } catch (error) {
      alert('Error generating differentiated assignments. Please try again.')
    }

    setGenerating(false)
  }

  const handleExportAll = async () => {
    if (!generatedTiers) return
    setExporting(true)

    try {
      let combinedContent = `DIFFERENTIATED ASSIGNMENT\n`
      combinedContent += `${subject} | ${gradeLevel}\n`
      combinedContent += `Type: ${assignmentType}\n`
      combinedContent += `Generated: ${new Date().toLocaleDateString()}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      if (learningObjective) {
        combinedContent += `LEARNING OBJECTIVE:\n${learningObjective}\n\n`
        combinedContent += `${'='.repeat(60)}\n\n`
      }

      if (editedTiers.below) {
        combinedContent += `--- TIER 1: APPROACHING GRADE LEVEL ---\n\n`
        combinedContent += editedTiers.below
        combinedContent += `\n\n${'='.repeat(60)}\n\n`
      }

      if (editedTiers.on) {
        combinedContent += `--- TIER 2: ON GRADE LEVEL ---\n\n`
        combinedContent += editedTiers.on
        combinedContent += `\n\n${'='.repeat(60)}\n\n`
      }

      if (editedTiers.above) {
        combinedContent += `--- TIER 3: ABOVE GRADE LEVEL ---\n\n`
        combinedContent += editedTiers.above
        combinedContent += `\n\n${'='.repeat(60)}\n\n`
      }

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Differentiated Assignment - ${subject}`,
          content: combinedContent,
          toolName: 'Batch Differentiation'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Differentiated_${assignmentType}_${new Date().toISOString().split('T')[0]}.docx`
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

  const handleCopyTier = (tier) => {
    navigator.clipboard.writeText(editedTiers[tier])
    alert(`${tier === 'below' ? 'Approaching' : tier === 'on' ? 'On Grade Level' : 'Above'} tier copied!`)
  }

  const handleCopyAll = () => {
    let content = ''
    if (editedTiers.below) content += `=== APPROACHING GRADE LEVEL ===\n\n${editedTiers.below}\n\n`
    if (editedTiers.on) content += `=== ON GRADE LEVEL ===\n\n${editedTiers.on}\n\n`
    if (editedTiers.above) content += `=== ABOVE GRADE LEVEL ===\n\n${editedTiers.above}\n\n`
    navigator.clipboard.writeText(content)
    alert('All tiers copied to clipboard!')
  }

  const tierInfo = {
    below: { label: 'Approaching', desc: 'Scaffolded support, simplified language', color: 'blue', icon: '📘' },
    on: { label: 'On Grade Level', desc: 'Standard expectations', color: 'green', icon: '📗' },
    above: { label: 'Above', desc: 'Extended challenge, deeper thinking', color: 'purple', icon: '📕' },
  }

  const subjects = [
    'English Language Arts',
    'Mathematics',
    'Science',
    'Social Studies',
    'Writing',
    'Reading',
  ]

  const assignmentTypes = [
    { id: 'worksheet', name: 'Worksheet/Questions' },
    { id: 'writing-prompt', name: 'Writing Prompt' },
    { id: 'project', name: 'Project/Task' },
    { id: 'assessment', name: 'Assessment/Quiz' },
    { id: 'activity', name: 'Activity/Game' },
    { id: 'homework', name: 'Homework' },
  ]

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
            <span className="text-gray-800 font-medium">Batch Differentiation</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📚</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch Differentiation</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Input ONE assignment → Get THREE tiered versions (approaching, on-level, above). Same learning objective, different access points.</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h3 className="text-blue-800 font-medium">How It Works</h3>
                <p className="text-blue-700 text-sm">All three tiers target the SAME learning objective. The difference is in scaffolding, complexity, and depth - not different content. Students work toward the same goal through different pathways.</p>
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
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'input'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            1. Original Assignment
          </button>
          <button
            onClick={() => setActiveTab('output')}
            disabled={!generatedTiers}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'output'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            2. Differentiated Tiers
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Assignment Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                  <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {assignmentTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Original Assignment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Original Assignment</h2>
              <textarea
                value={originalAssignment}
                onChange={(e) => setOriginalAssignment(e.target.value)}
                placeholder="Paste or type your original assignment here. Include all questions, instructions, and requirements..."
                rows={10}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            {/* Learning Objective */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Learning Objective</h2>
              <p className="text-sm text-gray-500 mb-4">What should ALL students be able to do after completing this assignment?</p>
              <textarea
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                placeholder="e.g., Students will be able to identify the main idea and supporting details in an informational text."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
            </div>

            {/* Tier Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Tiers</h2>
              <div className="grid grid-cols-3 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${generateBelow ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={generateBelow}
                    onChange={(e) => setGenerateBelow(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">📘 Approaching</span>
                    <p className="text-xs text-gray-500">Scaffolded support</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${generateOn ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={generateOn}
                    onChange={(e) => setGenerateOn(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">📗 On Grade Level</span>
                    <p className="text-xs text-gray-500">Standard expectations</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${generateAbove ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={generateAbove}
                    onChange={(e) => setGenerateAbove(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">📕 Above</span>
                    <p className="text-xs text-gray-500">Extended challenge</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes (Optional)</h2>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any specific needs? IEP accommodations, ELL support, gifted extensions..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
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
                  Generating differentiated tiers...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Differentiated Assignments
                </>
              )}
            </button>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedTiers && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Differentiated Tiers</h2>
                  <p className="text-gray-500 text-sm">Same objective, different pathways. Edit as needed.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                  >
                    📋 Copy All
                  </button>
                  <button
                    onClick={handleExportAll}
                    disabled={exporting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {exporting ? 'Exporting...' : '📄 Export All (.docx)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tier Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Tier List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Tiers</h3>
                <div className="space-y-2">
                  {generateBelow && (
                    <button
                      onClick={() => setSelectedTier('below')}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedTier === 'below'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📘</span>
                        <div>
                          <span className="font-medium block">Approaching</span>
                          <span className="text-xs opacity-75">Scaffolded</span>
                        </div>
                      </div>
                    </button>
                  )}
                  {generateOn && (
                    <button
                      onClick={() => setSelectedTier('on')}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedTier === 'on'
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📗</span>
                        <div>
                          <span className="font-medium block">On Grade Level</span>
                          <span className="text-xs opacity-75">Standard</span>
                        </div>
                      </div>
                    </button>
                  )}
                  {generateAbove && (
                    <button
                      onClick={() => setSelectedTier('above')}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedTier === 'above'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📕</span>
                        <div>
                          <span className="font-medium block">Above</span>
                          <span className="text-xs opacity-75">Extended</span>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Tier Content */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tierInfo[selectedTier].icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{tierInfo[selectedTier].label}</h3>
                      <p className="text-sm text-gray-500">{tierInfo[selectedTier].desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyTier(selectedTier)}
                    className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <textarea
                  value={editedTiers[selectedTier]}
                  onChange={(e) => setEditedTiers(prev => ({ ...prev, [selectedTier]: e.target.value }))}
                  rows={18}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('input')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Original Assignment
            </button>
          </div>
        )}
      </main>
    </div>
  )
}