'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function MeetingNotesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [meetingType, setMeetingType] = useState('parent-teacher')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [duration, setDuration] = useState('30 minutes')
  const [attendees, setAttendees] = useState('')
  const [studentName, setStudentName] = useState('')
  const [meetingPurpose, setMeetingPurpose] = useState('')
  const [discussionNotes, setDiscussionNotes] = useState('')
  const [decisionsReached, setDecisionsReached] = useState('')
  const [concerns, setConcerns] = useState('')
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setMeetingDate(today)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleGenerate = async () => {
    if (!attendees || !discussionNotes || !meetingPurpose) {
      alert('Please enter attendees, purpose, and discussion notes')
      return
    }
    setGenerating(true); setGeneratedNotes(''); setSaved(false)

    try {
      const response = await fetch('/api/generate-meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingType, meetingDate, meetingTime, duration, attendees, studentName, meetingPurpose, discussionNotes, decisionsReached, concerns }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedNotes(data.notes); await handleSave(data.notes) }
    } catch (error) { alert('Error generating notes. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      const meetingTypeLabels = { 'parent-teacher': 'Parent-Teacher', 'iep': 'IEP', 'sst': 'SST', '504': '504 Plan', 'team-plc': 'Team/PLC', 'general': 'General' }
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, title: `${meetingTypeLabels[meetingType]} Meeting - ${meetingDate}`, toolType: 'meeting-notes', toolName: 'Meeting Notes',
          content, metadata: { meetingType, meetingDate, studentName, attendees },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedNotes) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Meeting Notes - ${meetingDate}`, content: generatedNotes, toolName: 'Meeting Notes' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Meeting_Notes_${meetingDate}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedNotes); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const showStudentField = ['parent-teacher', 'iep', 'sst', '504'].includes(meetingType)

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Meeting Notes Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Meeting Details</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Meeting Type</label>
              <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                <option value="parent-teacher">Parent-Teacher Conference</option>
                <option value="iep">IEP Meeting</option>
                <option value="sst">Student Support Team (SST)</option>
                <option value="504">504 Plan Meeting</option>
                <option value="team-plc">Team/PLC Meeting</option>
                <option value="general">General Meeting</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Date</label>
                <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Time</label>
                <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  {['15 minutes', '30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Attendees *</label>
              <textarea value={attendees} onChange={(e) => setAttendees(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-20"
                placeholder="List attendees with roles..." />
            </div>

            {showStudentField && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Student Name</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" placeholder="Enter student's name" />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Meeting Purpose *</label>
              <textarea value={meetingPurpose} onChange={(e) => setMeetingPurpose(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-16"
                placeholder="What was the main purpose?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Discussion Notes *</label>
              <textarea value={discussionNotes} onChange={(e) => setDiscussionNotes(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-24"
                placeholder="Key topics discussed..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Decisions Reached</label>
              <textarea value={decisionsReached} onChange={(e) => setDecisionsReached(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-16"
                placeholder="What was decided?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Concerns Raised</label>
              <textarea value={concerns} onChange={(e) => setConcerns(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-16"
                placeholder="Any concerns to document?" />
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Meeting Notes'}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">Includes summary, action items & follow-ups</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Notes</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedNotes && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-purple-600 hover:text-purple-800 text-sm">{copied ? '✓ Copied!' : 'Copy'}</button>
                  <button onClick={handleExportDocx} disabled={exporting} className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedNotes ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[650px]">{generatedNotes}</div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div><p className="mb-2">Your generated meeting notes will appear here</p><p className="text-xs">Includes summary, decisions, action items & follow-ups</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}