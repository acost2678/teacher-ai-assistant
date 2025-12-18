'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SELWorksheetPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [caselCompetency, setCaselCompetency] = useState('self-awareness')
  const [subCompetency, setSubCompetency] = useState('all')
  const [worksheetType, setWorksheetType] = useState('mixed')
  const [numberOfWorksheets, setNumberOfWorksheets] = useState('1')
  const [theme, setTheme] = useState('')
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true)
  const [includeParentVersion, setIncludeParentVersion] = useState(false)
  
  const [generatedWorksheet, setGeneratedWorksheet] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // CASEL Competencies with Sub-Competencies
  const competencies = {
    'self-awareness': {
      name: 'Self-Awareness',
      icon: '💡',
      color: 'yellow',
      description: 'Understanding emotions, thoughts, and values',
      subCompetencies: [
        { id: 'all', label: 'All Sub-Competencies' },
        { id: 'identifying-emotions', label: 'Identifying Emotions' },
        { id: 'accurate-self-perception', label: 'Accurate Self-Perception' },
        { id: 'recognizing-strengths', label: 'Recognizing Strengths' },
        { id: 'self-confidence', label: 'Self-Confidence' },
        { id: 'self-efficacy', label: 'Self-Efficacy' },
        { id: 'growth-mindset', label: 'Growth Mindset' },
      ]
    },
    'self-management': {
      name: 'Self-Management',
      icon: '🎯',
      color: 'orange',
      description: 'Managing emotions and behaviors effectively',
      subCompetencies: [
        { id: 'all', label: 'All Sub-Competencies' },
        { id: 'impulse-control', label: 'Impulse Control' },
        { id: 'stress-management', label: 'Stress Management' },
        { id: 'self-discipline', label: 'Self-Discipline' },
        { id: 'self-motivation', label: 'Self-Motivation' },
        { id: 'goal-setting', label: 'Goal-Setting' },
        { id: 'organizational-skills', label: 'Organizational Skills' },
      ]
    },
    'social-awareness': {
      name: 'Social Awareness',
      icon: '👥',
      color: 'blue',
      description: 'Understanding and empathizing with others',
      subCompetencies: [
        { id: 'all', label: 'All Sub-Competencies' },
        { id: 'perspective-taking', label: 'Perspective-Taking' },
        { id: 'empathy', label: 'Empathy' },
        { id: 'appreciating-diversity', label: 'Appreciating Diversity' },
        { id: 'respect-for-others', label: 'Respect for Others' },
        { id: 'gratitude', label: 'Gratitude' },
        { id: 'identifying-resources', label: 'Identifying Resources' },
      ]
    },
    'relationship-skills': {
      name: 'Relationship Skills',
      icon: '🤝',
      color: 'green',
      description: 'Building and maintaining healthy relationships',
      subCompetencies: [
        { id: 'all', label: 'All Sub-Competencies' },
        { id: 'communication', label: 'Communication' },
        { id: 'social-engagement', label: 'Social Engagement' },
        { id: 'relationship-building', label: 'Relationship Building' },
        { id: 'teamwork', label: 'Teamwork' },
        { id: 'conflict-resolution', label: 'Conflict Resolution' },
        { id: 'seeking-help', label: 'Seeking/Offering Help' },
      ]
    },
    'responsible-decision-making': {
      name: 'Decision-Making',
      icon: '⚖️',
      color: 'purple',
      description: 'Making ethical and constructive choices',
      subCompetencies: [
        { id: 'all', label: 'All Sub-Competencies' },
        { id: 'identifying-problems', label: 'Identifying Problems' },
        { id: 'analyzing-situations', label: 'Analyzing Situations' },
        { id: 'solving-problems', label: 'Solving Problems' },
        { id: 'evaluating-consequences', label: 'Evaluating Consequences' },
        { id: 'reflecting', label: 'Reflecting' },
        { id: 'ethical-responsibility', label: 'Ethical Responsibility' },
      ]
    },
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  // Reset sub-competency when competency changes
  useEffect(() => {
    setSubCompetency('all')
  }, [caselCompetency])

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedWorksheet('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-sel-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, caselCompetency, subCompetency, worksheetType,
          numberOfWorksheets, theme, includeAnswerKey, includeParentVersion,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedWorksheet(data.worksheet); await handleSave(data.worksheet) }
    } catch (error) { alert('Error generating worksheet. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      const subLabel = subCompetency !== 'all' 
        ? competencies[caselCompetency].subCompetencies.find(s => s.id === subCompetency)?.label 
        : 'All'
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `SEL Worksheet: ${competencies[caselCompetency].name} - ${subLabel}`,
          toolType: 'sel-worksheet',
          toolName: 'SEL Worksheet',
          content,
          metadata: { gradeLevel, caselCompetency, subCompetency, worksheetType },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedWorksheet) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `SEL Worksheet - ${competencies[caselCompetency].name}`, 
          content: generatedWorksheet, 
          toolName: 'SEL Worksheet' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `SEL_Worksheet_${caselCompetency}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { 
    navigator.clipboard.writeText(generatedWorksheet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) 
  }

  const getColorClasses = (color, isSelected) => {
    const colors = {
      yellow: isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300',
      orange: isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300',
      blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
      green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
      purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
    }
    return colors[color] || colors.blue
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">📝 SEL Worksheet Creator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow overflow-y-auto max-h-[85vh]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Worksheet Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => 
                    <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2"># of Worksheets</label>
                <select value={numberOfWorksheets} onChange={(e) => setNumberOfWorksheets(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                  <option value="1">1 worksheet</option>
                  <option value="2">2 worksheets</option>
                  <option value="3">3 worksheets</option>
                  <option value="5">5 worksheets</option>
                </select>
              </div>
            </div>

            {/* CASEL Competency Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">🎯 CASEL Competency</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(competencies).map(([id, comp]) => (
                  <button key={id} type="button" onClick={() => setCaselCompetency(id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${getColorClasses(comp.color, caselCompetency === id)}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{comp.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{comp.name}</div>
                        <div className="text-xs text-gray-500">{comp.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Competency Selection */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <label className="block text-gray-800 font-medium mb-2">
                📋 Sub-Competency Focus
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({competencies[caselCompetency].name})
                </span>
              </label>
              <select value={subCompetency} onChange={(e) => setSubCompetency(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800">
                {competencies[caselCompetency].subCompetencies.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.label}</option>
                ))}
              </select>
            </div>

            {/* Worksheet Type */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Worksheet Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'reflection', label: '✏️ Reflection', desc: 'Writing prompts' },
                  { id: 'scenarios', label: '📖 Scenarios', desc: 'Situational' },
                  { id: 'drawing', label: '🎨 Drawing', desc: 'Creative' },
                  { id: 'self-assessment', label: '📊 Self-Assessment', desc: 'Rate skills' },
                  { id: 'goal-setting', label: '🎯 Goal-Setting', desc: 'Plan growth' },
                  { id: 'comic-strip', label: '📚 Comic Strip', desc: 'Story creation' },
                  { id: 'matching', label: '🔗 Matching', desc: 'Connect ideas' },
                  { id: 'mixed', label: '🔄 Mixed', desc: 'Variety' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setWorksheetType(t.id)}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${worksheetType === t.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                    <div className="font-medium text-gray-800 text-sm">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Theme (optional)</label>
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                placeholder="e.g., Friendship, Back to School, Kindness Week" />
            </div>

            {/* Options */}
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <label className="block text-gray-800 font-medium mb-3">Include</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="text-gray-700">📋 Teacher Guide / Answer Key</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeParentVersion}
                    onChange={(e) => setIncludeParentVersion(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="text-gray-700">🏠 Parent/Home Version</span>
                </label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {generating ? '📝 Creating Worksheet...' : '📝 Generate Worksheet'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Worksheet</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedWorksheet && (
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

            {generatedWorksheet ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[70vh]">
                {generatedWorksheet}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">📝</p>
                  <p className="mb-2">Your SEL worksheet will appear here</p>
                  <p className="text-xs">CASEL-aligned, ready to print!</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}