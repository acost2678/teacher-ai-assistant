'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ParentEmailPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [studentName, setStudentName] = useState('')
  const [parentName, setParentName] = useState('')
  const [emailType, setEmailType] = useState('General Update')
  const [tone, setTone] = useState('Warm & Friendly')
  const [keyPoints, setKeyPoints] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const allowedTypes = ['text/plain', 'text/markdown', 'text/csv', 'application/pdf']
    const allowedExtensions = ['.txt', '.md', '.csv']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Please upload a .txt, .md, or .csv file. For PDF/Word, copy and paste the content.')
      return
    }
    
    setUploadedFile(file)
    const text = await file.text()
    setFileContent(text)
  }

  const handleGenerate = async () => {
    if (!keyPoints && !fileContent) {
      alert('Please enter your notes or upload a file')
      return
    }
    
    setGenerating(true)
    setGeneratedEmail('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          parentName,
          emailType,
          tone,
          keyPoints: keyPoints || fileContent,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedEmail(data.email)
        await handleSave(data.email)
      }
    } catch (error) {
      alert('Error generating email. Please try again.')
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
          title: `Parent Email: ${studentName || 'Student'}`,
          toolType: 'parent-email',
          toolName: 'Parent Email',
          content,
          metadata: { studentName, parentName, emailType, tone },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!generatedEmail) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Parent Email - ${studentName || 'Student'}`,
          content: generatedEmail,
          toolName: 'Parent Email'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Parent_Email_${studentName || 'Student'}.docx`
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
    navigator.clipboard.writeText(generatedEmail)
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              Tools
            </button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Parent Email Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Parent Email Generator</h1>
              <p className="text-gray-500">Generate professional parent communication with customizable tone.</p>
            </div>

            {/* Student Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student's name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Parent Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Name (optional)
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Enter parent's name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Email Type */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Type: *
              </label>
              <div className="relative">
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 appearance-none cursor-pointer"
                >
                  <option>General Update</option>
                  <option>Positive News</option>
                  <option>Behavior Concern</option>
                  <option>Academic Concern</option>
                  <option>Meeting Request</option>
                  <option>Absence Follow-up</option>
                  <option>Event Reminder</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>

            {/* Tone */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone: *
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 appearance-none cursor-pointer"
                >
                  <option>Warm & Friendly</option>
                  <option>Professional</option>
                  <option>Encouraging</option>
                  <option>Concerned but Supportive</option>
                  <option>Formal</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>

            {/* Key Points */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Notes: *
              </label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Enter the key points you want to communicate, or paste content to include..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder-gray-400 resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="mb-6 flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <span>📎</span> Add File
              </button>
              {uploadedFile && (
                <span className="text-sm text-gray-500">
                  {uploadedFile.name}
                </span>
              )}
              <span className="text-sm text-gray-400 ml-auto">
                Supports: .txt, .md, .csv
              </span>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || (!keyPoints && !fileContent)}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate
                </>
              )}
            </button>
          </div>

          {/* Right Column - Output */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Generated Email</h2>
                {saved && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✓ Saved
                  </span>
                )}
              </div>
              {generatedEmail && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    onClick={handleExportDocx}
                    disabled={exporting}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300"
                  >
                    {exporting ? 'Exporting...' : '📄 Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedEmail ? (
              <div className="bg-gray-50 rounded-xl p-5 min-h-[400px] max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">
                  {generatedEmail}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">📧</div>
                  <p className="text-gray-400">Your generated email will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}