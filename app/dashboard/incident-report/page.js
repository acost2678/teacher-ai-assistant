'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function IncidentReportPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentTime, setIncidentTime] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [incidentType, setIncidentType] = useState('behavior-disruption')
  const [description, setDescription] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [actionsTaken, setActionsTaken] = useState('')
  const [parentContacted, setParentContacted] = useState(false)
  const [adminNotified, setAdminNotified] = useState(false)
  const [generatedReport, setGeneratedReport] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setIncidentDate(today)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleGenerate = async () => {
    if (!studentName || !description || !incidentLocation) {
      alert('Please enter student name, location, and description')
      return
    }
    setGenerating(true); setGeneratedReport(''); setSaved(false)

    try {
      const response = await fetch('/api/generate-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, gradeLevel, incidentDate, incidentTime, incidentLocation, incidentType, description, witnesses, actionsTaken, parentContacted, adminNotified }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedReport(data.report); await handleSave(data.report) }
    } catch (error) { alert('Error generating report. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, title: `Incident: ${studentName} - ${incidentDate}`, toolType: 'incident-report', toolName: 'Incident Report',
          content, metadata: { studentName, gradeLevel, incidentDate, incidentType, incidentLocation },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedReport) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Incident Report - ${studentName} - ${incidentDate}`, content: generatedReport, toolName: 'Incident Report' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Incident_Report_${studentName.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedReport); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">Incident Report Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Incident Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Student Name *</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800" placeholder="Enter student's name" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Date</label>
                <input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Time</label>
                <input type="time" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Location *</label>
              <input type="text" value={incidentLocation} onChange={(e) => setIncidentLocation(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800" placeholder="e.g., Classroom 204, Cafeteria" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Incident Type</label>
              <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800">
                <optgroup label="Behavior">
                  <option value="behavior-disruption">Classroom Disruption</option>
                  <option value="behavior-defiance">Defiance/Non-Compliance</option>
                  <option value="behavior-verbal">Verbal Altercation</option>
                </optgroup>
                <optgroup label="Safety">
                  <option value="safety-physical">Physical Altercation</option>
                  <option value="safety-injury">Injury</option>
                  <option value="safety-property">Property Damage</option>
                </optgroup>
                <optgroup label="Bullying/Harassment">
                  <option value="bullying-verbal">Verbal Bullying</option>
                  <option value="bullying-physical">Physical Bullying</option>
                  <option value="bullying-cyber">Cyber Bullying</option>
                  <option value="bullying-social">Social/Relational Bullying</option>
                </optgroup>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 h-24"
                placeholder="Describe what happened..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Witnesses</label>
              <input type="text" value={witnesses} onChange={(e) => setWitnesses(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800" placeholder="Names of witnesses" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Actions Taken</label>
              <textarea value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 h-16"
                placeholder="What did you do in response?" />
            </div>

            <div className="mb-4 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <input type="checkbox" checked={parentContacted} onChange={(e) => setParentContacted(e.target.checked)} className="w-5 h-5" />
                <label className="text-gray-700">Parent/Guardian contacted</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={adminNotified} onChange={(e) => setAdminNotified(e.target.checked)} className="w-5 h-5" />
                <label className="text-gray-700">Administration notified</label>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Incident Report'}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">PBIS-aligned with objective language</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Report</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedReport && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-orange-600 hover:text-orange-800 text-sm">{copied ? '✓ Copied!' : 'Copy'}</button>
                  <button onClick={handleExportDocx} disabled={exporting} className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedReport ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[600px]">{generatedReport}</div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div><p className="mb-2">Your generated incident report will appear here</p><p className="text-xs">PBIS-aligned with objective language</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}