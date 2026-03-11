'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import TranslateOutput from '../../../components/TranslateOutput'

export default function MeetingNotesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Input mode: 'manual' or 'transcript'
  const [inputMode, setInputMode] = useState('manual')

  // Meeting details
  const [meetingType, setMeetingType] = useState('Parent-Teacher Conference')
  const [meetingDate, setMeetingDate] = useState('')
  const [attendees, setAttendees] = useState('')
  const [studentName, setStudentName] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  // Manual input fields
  const [agenda, setAgenda] = useState('')
  const [discussionPoints, setDiscussionPoints] = useState('')
  const [decisions, setDecisions] = useState('')
  const [actionItems, setActionItems] = useState('')

  // Transcript input
  const [rawTranscript, setRawTranscript] = useState('')

  // Output
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [editedNotes, setEditedNotes] = useState('')
  const [parsedActionItems, setParsedActionItems] = useState([])
  const [activeTab, setActiveTab] = useState('input')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [seeDemo, setSeeDemo] = useState(false)

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

  const handleSeeDemo = () => {
    setInputMode('manual')
    setMeetingType('Parent-Teacher Conference')
    setMeetingDate('2025-01-18')
    setAttendees('Mrs. Garcia (classroom teacher), Mr. and Mrs. Thompson (parents/guardians)')
    setStudentName('Sophia Thompson')
    setAgenda('Review Q2 academic progress, discuss reading fluency goals, address homework completion concerns')
    setDiscussionPoints('Sophia has shown significant improvement in math — moved from below grade level to on grade level since October. Reading fluency is still below grade level at 68 wpm (grade benchmark is 90 wpm). Homework is frequently incomplete or late — parents noted she has trouble focusing after school due to back-to-back extracurricular activities. Parents asked about reading intervention options. Teacher shared that Sophia responds well to partner reading and audiobooks.')
    setDecisions('Implement a daily homework check-in sheet. Reduce after-school activities to 2 days per week to allow homework time. Teacher will enroll Sophia in the small-group reading fluency intervention starting next week.')
    setActionItems('Teacher: enroll Sophia in fluency group and send home weekly reading log by Friday. Parents: set up dedicated homework station and routine at home. Schedule 4-week follow-up conference.')
    setFollowUpDate('2025-02-15')
    setRawTranscript('')
    setSeeDemo(true)
    setGeneratedNotes('')
    setEditedNotes('')
    setParsedActionItems([])
    setActiveTab('input')
  }

  const handleResetDemo = () => {
    setInputMode('manual')
    setMeetingType('Parent-Teacher Conference')
    setMeetingDate('')
    setAttendees('')
    setStudentName('')
    setAgenda('')
    setDiscussionPoints('')
    setDecisions('')
    setActionItems('')
    setFollowUpDate('')
    setRawTranscript('')
    setSeeDemo(false)
    setGeneratedNotes('')
    setEditedNotes('')
    setParsedActionItems([])
    setActiveTab('input')
  }

  const handleGenerate = async () => {
    const hasInput = inputMode === 'transcript' ? rawTranscript.trim() : discussionPoints.trim()
    if (!hasInput) {
      alert(inputMode === 'transcript' ? 'Please paste a transcript' : 'Please enter discussion points')
      return
    }

    setGenerating(true)
    setGeneratedNotes('')
    setEditedNotes('')
    setParsedActionItems([])
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
          discussionPoints: inputMode === 'manual' ? discussionPoints : '',
          decisions: inputMode === 'manual' ? decisions : '',
          actionItems: inputMode === 'manual' ? actionItems : '',
          followUpDate,
          rawTranscript: inputMode === 'transcript' ? rawTranscript : '',
        }),
      })

      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedNotes(data.notes)
        setEditedNotes(data.notes)
        if (data.actionItems?.length > 0) {
          setParsedActionItems(data.actionItems)
        }
        await handleSave(data.notes)
        setActiveTab('output')
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
    if (!editedNotes) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Meeting Notes - ${meetingType}`,
          content: editedNotes,
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
    navigator.clipboard.writeText(editedNotes)
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
              <span className="text-gray-300">›</span>
              <span className="text-gray-800 font-medium">Meeting Notes</span>
            </div>
            <div className="flex gap-2">
              {!seeDemo ? (
                <button onClick={handleSeeDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  <span>✨</span> See Demo
                </button>
              ) : (
                <button onClick={handleResetDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <span>↺</span> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📋</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Meeting Notes</h1>
              <p className="text-gray-500 text-sm mt-1">Generate professional meeting summaries with extracted action items. Enter notes manually or paste a raw transcript.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-green-600">🔒</span>
              <div>
                <p className="text-green-800 font-medium text-sm">Privacy-First</p>
                <p className="text-green-700 text-xs">Student names replaced with [Student Name] — FERPA compliant</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-blue-600">⚡</span>
              <div>
                <p className="text-blue-800 font-medium text-sm">Transcript Processing</p>
                <p className="text-blue-700 text-xs">Paste raw notes or a transcript — AI structures it for you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}
          >
            1. Meeting Details
          </button>
          <button
            onClick={() => setActiveTab('output')}
            disabled={!generatedNotes}
            className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-40'}`}
          >
            2. Generated Notes
            {parsedActionItems.length > 0 && (
              <span className="ml-2 bg-purple-200 text-purple-800 text-xs px-2 py-0.5 rounded-full">{parsedActionItems.length} actions</span>
            )}
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-6">

            {/* Meeting details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Meeting Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
                  <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['Parent-Teacher Conference', 'IEP Meeting', 'SST/RTI Meeting', '504 Plan Meeting', 'PLC Meeting', 'Grade Level Team', 'Department Meeting', 'Staff Meeting', 'Admin Meeting', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
                  <input type="text" value={attendees} onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Names and roles..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name <span className="text-gray-400 font-normal">(if applicable)</span></label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Will be replaced with [Student Name]"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full md:w-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700" />
              </div>
            </div>

            {/* Input mode toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Meeting Content</h2>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setInputMode('manual')}
                  className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${inputMode === 'manual' ? 'bg-purple-50 border-purple-400 text-purple-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  ✏️ Enter Notes Manually
                </button>
                <button
                  onClick={() => setInputMode('transcript')}
                  className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${inputMode === 'transcript' ? 'bg-purple-50 border-purple-400 text-purple-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  📄 Paste Transcript / Raw Notes
                </button>
              </div>

              {inputMode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agenda / Purpose</label>
                    <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)}
                      placeholder="What was the meeting about? Main topics..."
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discussion Points <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">— jot notes, bullet points, or full sentences</span>
                    </label>
                    <textarea value={discussionPoints} onChange={(e) => setDiscussionPoints(e.target.value)}
                      placeholder="Key points, concerns, data shared, questions raised..."
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decisions Made</label>
                    <textarea value={decisions} onChange={(e) => setDecisions(e.target.value)}
                      placeholder="What was agreed upon or decided?"
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Items</label>
                    <textarea value={actionItems} onChange={(e) => setActionItems(e.target.value)}
                      placeholder="Who will do what by when? e.g., 'Teacher: send reading log home by Friday. Parents: set up homework routine.'"
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm" />
                  </div>
                </div>
              )}

              {inputMode === 'transcript' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Transcript or Raw Notes <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-400 text-xs mb-3">Paste a meeting transcript, voice-to-text output, or rough notes. The AI will extract key points, decisions, and action items automatically.</p>
                  <textarea value={rawTranscript} onChange={(e) => setRawTranscript(e.target.value)}
                    placeholder="Paste your transcript or unstructured notes here...

Example:
Ms. Garcia: Sophia has really improved in math this quarter. 
Mr. Thompson: That's great to hear. We've been worried about her reading though.
Ms. Garcia: Yes, her fluency is at 68 words per minute, and the benchmark is 90...
..."
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none text-sm font-mono" />
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || (inputMode === 'manual' ? !discussionPoints.trim() : !rawTranscript.trim())}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base"
            >
              {generating ? (
                <><span className="animate-spin">⏳</span> Generating Notes...</>
              ) : (
                <><span>✨</span> Generate Meeting Notes</>
              )}
            </button>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && generatedNotes && (
          <div className="space-y-6">

            {/* Action items panel */}
            {parsedActionItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">⚡ Action Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="text-left px-4 py-3 text-purple-800 font-medium rounded-tl-lg">#</th>
                        <th className="text-left px-4 py-3 text-purple-800 font-medium">Action</th>
                        <th className="text-left px-4 py-3 text-purple-800 font-medium">Responsible</th>
                        <th className="text-left px-4 py-3 text-purple-800 font-medium rounded-tr-lg">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedActionItems.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-700">{item.task}</td>
                          <td className="px-4 py-3 text-gray-600">{item.person}</td>
                          <td className="px-4 py-3 text-gray-600">{item.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes output */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Notes</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-sm">Review and edit below.</p>
                    {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Saved</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm">
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm">
                    {exporting ? 'Exporting...' : '📄 Export .docx'}
                  </button>
                </div>
              </div>

              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={35}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none font-mono text-sm"
              />
            </div>

            <TranslateOutput content={editedNotes} />

            <button onClick={() => setActiveTab('input')} className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              ← Back to Edit Details
            </button>
          </div>
        )}
      </main>
    </div>
  )
}