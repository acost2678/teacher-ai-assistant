'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function IEPUpdatePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('3rd Grade')
  const [disabilityCategory, setDisabilityCategory] = useState('learning-reading')
  const [currentPerformance, setCurrentPerformance] = useState('')
  const [strengthsInterests, setStrengthsInterests] = useState('')
  const [areasOfNeed, setAreasOfNeed] = useState('')
  const [uploadedContent, setUploadedContent] = useState('')
  const [generatedIEP, setGeneratedIEP] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  const handleGenerate = async () => {
    if (!studentName || !currentPerformance || !areasOfNeed) {
      alert('Please enter student name, current performance, and areas of need')
      return
    }
    setGenerating(true); setGeneratedIEP(''); setSaved(false)

    try {
      const response = await fetch('/api/generate-iep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, gradeLevel, disabilityCategory, currentPerformance, strengthsInterests, areasOfNeed, uploadedContent }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedIEP(data.iep); await handleSave(data.iep) }
    } catch (error) { alert('Error generating IEP. Please try again.') }
    setGenerating(false)
  }

  const handleSave = async (content) => {
    if (!content || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, title: `IEP Update: ${studentName}`, toolType: 'iep-update', toolName: 'IEP Update',
          content, metadata: { studentName, gradeLevel, disabilityCategory },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedIEP) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `IEP Update - ${studentName}`, content: generatedIEP, toolName: 'IEP Update' }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `IEP_Update_${studentName.replace(/\s+/g, '_')}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(generatedIEP); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">IEP Update Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Student Information</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Student Name *</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" placeholder="Enter student's name" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  {['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Primary Disability Category</label>
              <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                <optgroup label="Learning Disabilities">
                  <option value="learning-reading">Reading/Dyslexia</option>
                  <option value="learning-writing">Writing/Dysgraphia</option>
                  <option value="learning-math">Math/Dyscalculia</option>
                </optgroup>
                <optgroup label="Other Disabilities">
                  <option value="speech-language">Speech/Language Impairment</option>
                  <option value="autism">Autism Spectrum Disorder</option>
                  <option value="adhd">ADHD/Executive Function</option>
                  <option value="emotional-behavioral">Emotional/Behavioral Disability</option>
                  <option value="multiple">Multiple Disabilities</option>
                </optgroup>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Current Performance Level *</label>
              <textarea value={currentPerformance} onChange={(e) => setCurrentPerformance(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-24"
                placeholder="Describe current academic and functional performance..." />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Strengths & Interests</label>
              <textarea value={strengthsInterests} onChange={(e) => setStrengthsInterests(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-20"
                placeholder="What are the student's strengths?" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Areas of Need *</label>
              <textarea value={areasOfNeed} onChange={(e) => setAreasOfNeed(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 h-24"
                placeholder="What skills need to be developed?" />
            </div>

            {/* File Upload */}
            <FileUpload
              onContentExtracted={setUploadedContent}
              label="Upload Previous IEP or Evaluation (Optional)"
              helpText="Upload previous IEP, evaluation reports, or progress data to improve accuracy"
              placeholder="Paste content from previous IEP, evaluation reports, or assessment data..."
            />

            <button onClick={handleGenerate} disabled={generating}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate IEP Update'}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">IDEA-compliant with SMART goals</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated IEP</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedIEP && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-purple-600 hover:text-purple-800 text-sm">{copied ? '✓ Copied!' : 'Copy'}</button>
                  <button onClick={handleExportDocx} disabled={exporting} className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedIEP ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[600px]">{generatedIEP}</div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-96 flex items-center justify-center">
                <div><p className="mb-2">Your generated IEP update will appear here</p><p className="text-xs">IDEA-compliant with measurable SMART goals</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}