'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function BatchParentEmailsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(0)
  const [exporting, setExporting] = useState(false)
  
  // Settings
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [emailType, setEmailType] = useState('progress-update')
  const [tone, setTone] = useState('warm')
  const [teacherName, setTeacherName] = useState('')
  const [baseMessage, setBaseMessage] = useState('')
  
  // Students data - privacy-first: no names stored
  const [numberOfStudents, setNumberOfStudents] = useState(5)
  const [studentNotes, setStudentNotes] = useState([])
  const [generatedEmails, setGeneratedEmails] = useState([])
  
  const [activeTab, setActiveTab] = useState('input') // 'input' | 'review'
  const [selectedEmail, setSelectedEmail] = useState(0)
  const [editedEmails, setEditedEmails] = useState([])
  const [showDemo, setShowDemo] = useState(false)
  
  const outputRef = useRef(null)
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

  // Initialize student notes array when number changes
  useEffect(() => {
    // Always update student notes when numberOfStudents changes
    // If in demo mode and user changes count, exit demo mode
    setStudentNotes(prev => {
      const newNotes = [...prev]
      while (newNotes.length < numberOfStudents) {
        newNotes.push({ identifier: `Student ${newNotes.length + 1}`, positives: '', concerns: '', action: '' })
      }
      return newNotes.slice(0, numberOfStudents)
    })
  }, [numberOfStudents])

  const handleShowDemo = () => {
    setGradeLevel('4th Grade')
    setEmailType('progress-update')
    setTone('warm')
    setTeacherName('Ms. Johnson')
    setBaseMessage('I wanted to reach out with a quick update on your child\'s progress in class this quarter.')
    setNumberOfStudents(3)
    setStudentNotes([
      { 
        identifier: 'Student A', 
        positives: 'Excellent participation, turning in homework consistently, being a great helper', 
        concerns: 'Sometimes rushes through tests', 
        action: 'Encourage double-checking work' 
      },
      { 
        identifier: 'Student B', 
        positives: 'Great improvement in reading, loves to share during discussions', 
        concerns: 'Missing a few assignments from last week', 
        action: 'Please check backpack for missing work' 
      },
      { 
        identifier: 'Student C', 
        positives: 'Strong math skills, kind to classmates', 
        concerns: 'Has been distracted lately, talking during instruction', 
        action: 'Would love to schedule a quick call to discuss' 
      },
    ])
    setGeneratedEmails([])
    setActiveTab('input')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setGradeLevel('3rd Grade')
    setEmailType('progress-update')
    setTone('warm')
    setTeacherName('')
    setBaseMessage('')
    setNumberOfStudents(5)
    setStudentNotes([])
    setGeneratedEmails([])
    setActiveTab('input')
    setShowDemo(false)
  }

  const updateStudentNote = (index, field, value) => {
    setStudentNotes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleGenerate = async () => {
    // Validate
    const hasNotes = studentNotes.some(s => s.positives || s.concerns || s.action)
    if (!hasNotes) {
      alert('Please add notes for at least one student')
      return
    }
    if (!teacherName.trim()) {
      alert('Please enter your name')
      return
    }

    setGenerating(true)
    setGeneratedEmails([])
    setCurrentStudent(0)

    try {
      const emails = []
      
      for (let i = 0; i < studentNotes.length; i++) {
        setCurrentStudent(i + 1)
        
        const student = studentNotes[i]
        // Skip students with no notes
        if (!student.positives && !student.concerns && !student.action) {
          emails.push({
            identifier: student.identifier,
            email: '[No notes provided - skipped]',
            skipped: true
          })
          continue
        }

        const response = await fetch('/api/batch-parent-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gradeLevel,
            emailType,
            tone,
            teacherName,
            baseMessage,
            studentIdentifier: student.identifier,
            positives: student.positives,
            concerns: student.concerns,
            action: student.action,
          }),
        })

        const data = await response.json()
        
        if (data.error) {
          emails.push({
            identifier: student.identifier,
            email: `[Error generating email: ${data.error}]`,
            error: true
          })
        } else {
          emails.push({
            identifier: student.identifier,
            email: data.email,
            subject: data.subject,
            skipped: false,
            error: false
          })
        }
      }

      setGeneratedEmails(emails)
      setEditedEmails(emails.map(e => e.email))
      setActiveTab('review')
      setSelectedEmail(0)
      
    } catch (error) {
      alert('Error generating emails. Please try again.')
    }

    setGenerating(false)
    setCurrentStudent(0)
  }

  const handleExportAll = async () => {
    if (generatedEmails.length === 0) return
    setExporting(true)

    try {
      let combinedContent = `PARENT EMAILS - ${emailType.replace('-', ' ').toUpperCase()}\n`
      combinedContent += `Grade Level: ${gradeLevel}\n`
      combinedContent += `Generated: ${new Date().toLocaleDateString()}\n`
      combinedContent += `${'='.repeat(60)}\n\n`

      generatedEmails.forEach((email, index) => {
        if (!email.skipped && !email.error) {
          combinedContent += `--- ${email.identifier} ---\n`
          combinedContent += `Subject: ${email.subject || 'Update from ' + teacherName}\n\n`
          combinedContent += editedEmails[index] || email.email
          combinedContent += `\n\n${'='.repeat(60)}\n\n`
        }
      })

      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Parent Emails - ${emailType}`,
          content: combinedContent,
          toolName: 'Batch Parent Emails'
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Parent_Emails_${emailType}_${new Date().toISOString().split('T')[0]}.docx`
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
    const email = generatedEmails[index]
    const content = `Subject: ${email.subject || 'Update from ' + teacherName}\n\n${editedEmails[index] || email.email}`
    navigator.clipboard.writeText(content)
    alert('Email copied to clipboard!')
  }

  const handleCopyAll = () => {
    let combinedContent = ''
    generatedEmails.forEach((email, index) => {
      if (!email.skipped && !email.error) {
        combinedContent += `--- ${email.identifier} ---\n`
        combinedContent += `Subject: ${email.subject || 'Update from ' + teacherName}\n\n`
        combinedContent += editedEmails[index] || email.email
        combinedContent += `\n\n---\n\n`
      }
    })
    navigator.clipboard.writeText(combinedContent)
    alert('All emails copied to clipboard!')
  }

  const completedEmails = generatedEmails.filter(e => !e.skipped && !e.error).length

  const emailTypes = [
    { id: 'progress-update', label: 'Progress Update', desc: 'General academic/behavioral update' },
    { id: 'positive-news', label: 'Positive News', desc: 'Share good news and celebrations' },
    { id: 'concern', label: 'Concern/Check-in', desc: 'Address a concern with care' },
    { id: 'missing-work', label: 'Missing Work', desc: 'Notify about missing assignments' },
    { id: 'conference-invite', label: 'Conference Invite', desc: 'Request a parent meeting' },
    { id: 'event-reminder', label: 'Event Reminder', desc: 'Remind about upcoming event' },
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
            <span className="text-gray-800 font-medium">Batch Parent Emails</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📧</span>
                <h1 className="text-2xl font-semibold text-gray-800">Batch Parent Emails</h1>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">TIME SAVER</span>
              </div>
              <p className="text-gray-500">Personalized parent emails for your whole class - write notes once, AI personalizes each email.</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🔒</span>
              <div>
                <h3 className="text-green-800 font-medium">Privacy-First Design</h3>
                <p className="text-green-700 text-sm">Student/parent names are never stored. Use identifiers like "Student 1". Emails use "[Student Name]" and "[Parent Name]" placeholders - fill in real names before sending.</p>
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
            1. Enter Notes
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedEmails.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            2. Review & Send {completedEmails > 0 && `(${completedEmails})`}
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Ms. Smith"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                  <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                  <select value={emailType} onChange={(e) => setEmailType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {emailTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="warm">Warm & Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="encouraging">Encouraging</option>
                    <option value="direct">Direct & Concise</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Message (optional - appears in all emails)</label>
                <textarea
                  value={baseMessage}
                  onChange={(e) => setBaseMessage(e.target.value)}
                  placeholder="e.g., I wanted to reach out with an update on your child's progress this quarter..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                <select value={numberOfStudents} onChange={(e) => setNumberOfStudents(parseInt(e.target.value))}
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  {[3, 5, 10, 15, 20, 25, 30, 35].map(n => (
                    <option key={n} value={n}>{n} students</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Individual Notes</h2>
                <span className="text-sm text-gray-500">Quick bullet points → AI writes personalized email</span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {studentNotes.map((student, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-lg text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={student.identifier}
                        onChange={(e) => updateStudentNote(index, 'identifier', e.target.value)}
                        placeholder="Student identifier (e.g., 'Student 1' or initials)"
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Positives / Good News</label>
                        <textarea
                          value={student.positives}
                          onChange={(e) => updateStudentNote(index, 'positives', e.target.value)}
                          placeholder="What's going well?"
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Concerns (if any)</label>
                        <textarea
                          value={student.concerns}
                          onChange={(e) => updateStudentNote(index, 'concerns', e.target.value)}
                          placeholder="Any issues to address?"
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Action / Request</label>
                        <textarea
                          value={student.action}
                          onChange={(e) => updateStudentNote(index, 'action', e.target.value)}
                          placeholder="What do you need from parent?"
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
                  Generating email {currentStudent} of {numberOfStudents}...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate All Emails ({numberOfStudents} students)
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
        {activeTab === 'review' && generatedEmails.length > 0 && (
          <div className="space-y-6">
            {/* Export Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Emails</h2>
                  <p className="text-gray-500 text-sm">{completedEmails} emails ready • Review, edit, then copy/paste into your email</p>
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

            {/* Email Selector & Preview */}
            <div className="grid grid-cols-4 gap-6">
              {/* Email List */}
              <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">Emails</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {generatedEmails.map((email, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedEmail(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedEmail === index
                          ? 'bg-purple-100 text-purple-700'
                          : email.skipped || email.error
                          ? 'bg-gray-100 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{email.identifier}</span>
                      {email.skipped && <span className="text-xs ml-2">(skipped)</span>}
                      {email.error && <span className="text-xs ml-2 text-red-500">(error)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Preview/Edit */}
              <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {generatedEmails[selectedEmail]?.identifier}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Subject: {generatedEmails[selectedEmail]?.subject || `Update from ${teacherName}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyOne(selectedEmail)}
                    className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Copy This Email
                  </button>
                </div>
                <textarea
                  value={editedEmails[selectedEmail] || ''}
                  onChange={(e) => {
                    const updated = [...editedEmails]
                    updated[selectedEmail] = e.target.value
                    setEditedEmails(updated)
                  }}
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Replace "[Student Name]" and "[Parent Name]" with actual names before sending
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTab('input')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Edit Notes
            </button>
          </div>
        )}
      </main>
    </div>
  )
}