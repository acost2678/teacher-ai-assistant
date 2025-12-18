'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function MeetingNotesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [meetingType, setMeetingType] = useState('Parent-Teacher Conference')
  const [meetingDate, setMeetingDate] = useState('')
  const [attendees, setAttendees] = useState('')
  const [studentName, setStudentName] = useState('')
  const [agenda, setAgenda] = useState('')
  const [discussionPoints, setDiscussionPoints] = useState('')
  const [decisions, setDecisions] = useState('')
  const [actionItems, setActionItems] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showExemplar, setShowExemplar] = useState(false)
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

  const handleShowExemplar = () => {
    setMeetingType('Parent-Teacher Conference')
    setMeetingDate('2024-01-18')
    setAttendees('Mrs. Garcia (teacher), Mr. and Mrs. Thompson (parents)')
    setStudentName('Sophia Thompson')
    setAgenda('Review Q2 progress, discuss reading goals, address homework completion concerns')
    setDiscussionPoints('Sophia has improved in math significantly. Reading fluency is still below grade level. Homework is often incomplete or turned in late. Parents mentioned Sophia has trouble focusing after school activities.')
    setDecisions('Agreed to implement a homework check-in system. Will reduce after-school activities to 2 days per week. Teacher will send home weekly reading practice materials.')
    setActionItems('Teacher: Send reading materials by Friday. Parents: Set up homework station at home. Schedule follow-up in 4 weeks.')
    setFollowUpDate('2024-02-15')
    setShowExemplar(true)
    setGeneratedNotes('')
  }

  const handleResetExemplar = () => {
    setMeetingType('Parent-Teacher Conference')
    setMeetingDate('')
    setAttendees('')
    setStudentName('')
    setAgenda('')
    setDiscussionPoints('')
    setDecisions('')
    setActionItems('')
    setFollowUpDate('')
    setShowExemplar(false)
    setGeneratedNotes('')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerate = async () => {
    if (!discussionPoints) {
      alert('Please enter discussion points')
      return
    }
    
    setGenerating(true)
    setGeneratedNotes('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingType,
          meetingDate,
          attendees,
          studentName,
          agenda,
          discussionPoints,
          decisions,
          actionItems,
          followUpDate,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedNotes(data.notes)
        await handleSave(data.notes)
      }
    } catch (error) {
      alert('Error generating meeting notes. Please try again.')
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
          title: `Meeting Notes: ${meetingType}${studentName ? ` - ${studentName}` : ''}`,
          toolType: 'meeting-notes',
          toolName: 'Meeting Notes',
          content,
          metadata: { meetingType, meetingDate, studentName, attendees },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedNotes) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Meeting Notes - ${meetingType}`,
          content: generatedNotes,
          toolName: 'Meeting Notes'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Meeting_Notes_${meetingDate || 'draft'}.docx`
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
    navigator.clipboard.writeText(generatedNotes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Meeting Notes</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Meeting Notes</h1>
              <p className="text-gray-500">Generate organized meeting summaries and action items.</p>
            </div>
            <div className="flex items-center gap-3">
              {showExemplar && (
                <button onClick={handleResetExemplar} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowExemplar} className={`text-sm font-medium transition-colors ${showExemplar ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                Show exemplar
              </button>
            </div>
          </div>

          {showExemplar && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Exemplar is ready!</h3>
                  <p className="text-purple-600 text-sm">We've filled in example inputs and generated an example output.</p>
                </div>
                <button onClick={scrollToOutput} className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                  Scroll to view output
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type:</label>
              <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 appearance-none cursor-pointer">
                {['Parent-Teacher Conference', 'IEP Meeting', 'SST/RTI Meeting', 'Grade Level Team', 'Department Meeting', 'Staff Meeting', 'PLC Meeting', 'Admin Meeting', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
              <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendees:</label>
              <input type="text" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Names and roles of attendees"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name (if applicable):</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Leave blank if not student-specific"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Agenda/Purpose:</label>
            <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="What was the meeting about? List main topics..."
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Discussion Points: *</label>
            <textarea value={discussionPoints} onChange={(e) => setDiscussionPoints(e.target.value)} placeholder="Key points discussed, concerns raised, information shared..."
              rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Decisions Made:</label>
            <textarea value={decisions} onChange={(e) => setDecisions(e.target.value)} placeholder="What was agreed upon or decided?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Items:</label>
            <textarea value={actionItems} onChange={(e) => setActionItems(e.target.value)} placeholder="Who will do what by when?"
              rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date:</label>
            <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
          </div>

          <button onClick={handleGenerate} disabled={generating || !discussionPoints}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            {generating ? (<><span className="animate-spin">⏳</span>Generating...</>) : (<><span>✨</span>Generate</>)}
          </button>
        </div>

        <div ref={outputRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Notes</h2>
              {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
            </div>
            {generatedNotes && (
              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{copied ? '✓ Copied!' : '📋 Copy'}</button>
                <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                  {exporting ? 'Exporting...' : '📄 Export .docx'}
                </button>
              </div>
            )}
          </div>

          {generatedNotes ? (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedNotes}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-400">Your generated notes will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}