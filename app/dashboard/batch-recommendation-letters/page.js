'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BatchRecommendationLettersPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(0)
  const [exporting, setExporting] = useState(false)
  
  // Settings
  const [writerName, setWriterName] = useState('')
  const [writerTitle, setWriterTitle] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [letterType, setLetterType] = useState('college')
  
  // Students data - privacy-first
  const [numberOfStudents, setNumberOfStudents] = useState(3)
  const [studentInfo, setStudentInfo] = useState([])
  const [generatedLetters, setGeneratedLetters] = useState([])
  
  const [activeTab, setActiveTab] = useState('input') // 'input' | 'review'
  const [selectedLetter, setSelectedLetter] = useState(0)
  const [editedLetters, setEditedLetters] = useState([])
  const [showDemo, setShowDemo] = useState(false)
  
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

  // Initialize student info array when number changes
  useEffect(() => {
    if (!showDemo) {
      setStudentInfo(prev => {
        const newInfo = [...prev]
        while (newInfo.length < numberOfStudents) {
          newInfo.push({ 
            identifier: `Student ${newInfo.length + 1}`, 
            relationship: '',
            duration: '',
            academicStrengths: '',
            personalQualities: '',
            achievements: '',
            anecdote: '',
            goals: '',
            destination: '',
          })
        }
        return newInfo.slice(0, numberOfStudents)
      })
    }
  }, [numberOfStudents, showDemo])

  const handleShowDemo = () => {
    setWriterName('Dr. Sarah Mitchell')
    setWriterTitle('AP English Literature Teacher')
    setSchoolName('Lincoln High School')
    setLetterType('college')
    setNumberOfStudents(2)
    setStudentInfo([
      { 
        identifier: 'Student A', 
        relationship: 'AP English Literature teacher for 2 years, also advisor for Literary Magazine',
        duration: '2 years',
        academicStrengths: 'Exceptional analytical writing, deep literary analysis, consistently engages with complex texts, top 5% of class',
        personalQualities: 'Intellectual curiosity, leadership, empathy, brings quiet confidence to discussions',
        achievements: 'Editor-in-Chief of Literary Magazine, National Merit Semifinalist, published short story in regional contest',
        anecdote: 'During our unit on Beloved, she led a discussion on generational trauma that moved several students to tears and sparked ongoing conversations.',
        goals: 'Plans to major in English/Creative Writing',
        destination: 'Applying to Northwestern, University of Chicago, Kenyon College',
      },
      { 
        identifier: 'Student B', 
        relationship: 'English 11 Honors teacher, coach for Debate Team',
        duration: '1.5 years',
        academicStrengths: 'Strong argumentative writing, excellent research skills, improved dramatically over the year',
        personalQualities: 'Resilient, hardworking, overcame significant challenges, always seeks feedback',
        achievements: 'Varsity Debate captain, improved from C+ to A student, works part-time to support family',
        anecdote: 'After struggling with our first essay, he came to every office hour for two months. His growth has been the highlight of my year.',
        goals: 'Pre-law, interested in public defense',
        destination: 'Applying to state schools, hoping for scholarships',
      },
    ])
    setGeneratedLetters([])
    setActiveTab('input')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setWriterName('')
    setWriterTitle('')
    setSchoolName('')
    setLetterType('college')
    setNumberOfStudents(3)
    setStudentInfo([])
    setGeneratedLetters([])
    setEditedLetters([])
    setActiveTab('input')
    setShowDemo(false)
  }

  const updateStudentInfo = (index, field, value) => {
    setStudentInfo(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleGenerate = async () => {
    if (!writerName) {
      alert('Please enter your name')
      return
    }
    const hasInfo = studentInfo.some(s => s.academicStrengths || s.personalQualities)
    if (!hasInfo) {
      alert('Please add information for at least one student')
      return
    }

    setGenerating(true)
    setGeneratedLetters([])
    setCurrentStudent(0)

    try {
      const letters = []
      
      for (let i = 0; i < studentInfo.length; i++) {
        setCurrentStudent(i + 1)
        
        const student = studentInfo[i]
        if (!student.academicStrengths && !student.personalQualities) {
          letters.push({
            identifier: student.identifier,
            letter: '[No information provided - skipped]',
            skipped: true
          })
          continue
        }

        const response = await fetch('/api/batch-recommendation-letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            writerName,
            writerTitle,
            schoolName,
            letterType,
            studentIdentifier: student.identifier,
            relationship: student.relationship,
            duration: student.duration,
            academicStrengths: student.academicStrengths,
            personalQualities: student.personalQualities,
            achievements: student.achievements,
            anecdote: student.anecdote,
            goals: student.goals,
            destination: student.destination,
          }),
        })

        const data = await response.json()
        
        if (data.error) {
          letters.push({
            identifier: student.identifier,
            letter: `[Error: ${data.error}]`,
            error: true
          })
        } else {
          letters.push({
            identifier: student.identifier,
            destination: student.destination,
            letter: data.letter,
            skipped: false,
            error: false
          })
        }
      }

      setGeneratedLetters(letters)
      setEditedLetters(letters.map(l => l.letter))
      setActiveTab('review')
      setSelectedLetter(0)
      
    } catch (error) {
      alert('Error generating letters. Please try again.')
    }

    setGenerating(false)
    setCurrentStudent(0)
  }

  const handleExportAll = async () => {
    if (generatedLetters.length === 0) return
    setExporting(true)

    try {
      let combinedContent = `RECOMMENDATION LETTERS\n`
      combinedContent += `Written by: ${writerName}, ${writerTitle}\n`
      combinedContent += `${schoolName}\n`
      combinedContent += `Generated: ${new Date().toLocaleDateString()}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      generatedLetters.forEach((item, index) => {
        if (!item.skipped && !item.error) {
          combinedContent += `--- Letter for ${item.identifier} ---\n`
          if (item.destination) combinedContent += `(${item.destination})\n`
          combinedContent += `\n`
          combinedContent += editedLetters[index] || item.letter
          combinedContent += `\n\n${'='.repeat(60)}\n\n`
        }
      })

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Recommendation Letters - ${writerName}`,
          content: combinedContent,
          toolName: 'Batch Recommendation Letters'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Recommendation_Letters_${new Date().toISOString().split('T')[0]}.docx`
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

  const handleCopyOne = (index) => {
    navigator.clipboard.writeText(editedLetters[index] || generatedLetters[index]?.letter)
    alert('Letter copied to clipboard!')
  }

  const handleCopyAll = () => {
    let combinedContent = ''
    generatedLetters.forEach((item, index) => {
      if (!item.skipped && !item.error) {
        combinedContent += `=== ${item.identifier} ===\n\n`
        combinedContent += editedLetters[index] || item.letter
        combinedContent += `\n\n---\n\n`
      }
    })
    navigator.clipboard.writeText(combinedContent)
    alert('All letters copied to clipboard!')
  }

  const completedLetters = generatedLetters.filter(l => !l.skipped && !l.error).length

  const letterTypes = [
    { id: 'college', name: 'College Application' },
    { id: 'scholarship', name: 'Scholarship' },
    { id: 'job', name: 'Job/Internship' },
    { id: 'award', name: 'Award Nomination' },
    { id: 'program', name: 'Special Program' },
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
            <span className="text-gray-800 font-medium">Batch Recommendation Letters</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">✉️</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch Recommendation Letters</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Generate personalized recommendation letters for multiple students. Input key details, get polished letters ready for review.</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Student names are never stored. Use identifiers like "Student A". Letters use "[Student Name]" placeholders - add real names after downloading.</p>
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
            1. Enter Information
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedLetters.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            2. Review & Export {completedLetters > 0 && `(${completedLetters})`}
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Writer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={writerName}
                    onChange={(e) => setWriterName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Title</label>
                  <input
                    type="text"
                    value={writerTitle}
                    onChange={(e) => setWriterTitle(e.target.value)}
                    placeholder="AP English Teacher"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Lincoln High School"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Letter Type</label>
                  <select value={letterType} onChange={(e) => setLetterType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {letterTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(parseInt(e.target.value))}
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n} student{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Student Information</h2>
                <span className="text-sm text-gray-500">The more detail, the better the letter</span>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {studentInfo.map((student, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={student.identifier}
                        onChange={(e) => updateStudentInfo(index, 'identifier', e.target.value)}
                        placeholder="Student identifier"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={student.destination}
                        onChange={(e) => updateStudentInfo(index, 'destination', e.target.value)}
                        placeholder="Destination (e.g., Harvard, State U)"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Your Relationship / How You Know Them</label>
                        <textarea
                          value={student.relationship}
                          onChange={(e) => updateStudentInfo(index, 'relationship', e.target.value)}
                          placeholder="e.g., AP English teacher for 2 years, Debate coach..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Academic Strengths</label>
                        <textarea
                          value={student.academicStrengths}
                          onChange={(e) => updateStudentInfo(index, 'academicStrengths', e.target.value)}
                          placeholder="Writing ability, analytical skills, class rank, grades..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Personal Qualities</label>
                        <textarea
                          value={student.personalQualities}
                          onChange={(e) => updateStudentInfo(index, 'personalQualities', e.target.value)}
                          placeholder="Character traits, work ethic, leadership, kindness..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Key Achievements</label>
                        <textarea
                          value={student.achievements}
                          onChange={(e) => updateStudentInfo(index, 'achievements', e.target.value)}
                          placeholder="Awards, activities, leadership roles, projects..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Specific Anecdote or Story (makes the letter memorable)</label>
                        <textarea
                          value={student.anecdote}
                          onChange={(e) => updateStudentInfo(index, 'anecdote', e.target.value)}
                          placeholder="A specific moment that captures who they are - a project, a conversation, how they helped someone..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Goals / Intended Major</label>
                        <input
                          type="text"
                          value={student.goals}
                          onChange={(e) => updateStudentInfo(index, 'goals', e.target.value)}
                          placeholder="e.g., Pre-med, Engineering, Undecided..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  Generating letter {currentStudent} of {numberOfStudents}...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate All Letters ({numberOfStudents} students)
                </>
              )}
            </button>

            {generating && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-purple-600">{currentStudent} / {numberOfStudents}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStudent / numberOfStudents) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && generatedLetters.length > 0 && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Letters</h2>
                  <p className="text-gray-500 text-sm">{completedLetters} letters ready • Always review and personalize before sending</p>
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

            {/* Letter Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Letter List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Students</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {generatedLetters.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedLetter(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedLetter === index
                          ? 'bg-purple-100 text-purple-700'
                          : item.skipped || item.error
                          ? 'bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium block">{item.identifier}</span>
                      {item.destination && <span className="text-xs opacity-75">{item.destination}</span>}
                      {item.skipped && <span className="text-xs block">(skipped)</span>}
                      {item.error && <span className="text-xs text-red-500 block">(error)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Preview/Edit */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Letter for {generatedLetters[selectedLetter]?.identifier}
                    </h3>
                    {generatedLetters[selectedLetter]?.destination && (
                      <p className="text-sm text-gray-500">{generatedLetters[selectedLetter]?.destination}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyOne(selectedLetter)}
                    className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                <textarea
                  value={editedLetters[selectedLetter] || ''}
                  onChange={(e) => {
                    const updated = [...editedLetters]
                    updated[selectedLetter] = e.target.value
                    setEditedLetters(updated)
                  }}
                  rows={18}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Replace "[Student Name]" with actual name. Always personalize and review before sending.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('input')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Edit Information
            </button>
          </div>
        )}
      </main>
    </div>
  )
}