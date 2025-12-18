'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [exporting, setExporting] = useState(null)
  const router = useRouter()

  const toolTypes = {
    'all': 'All Documents',
    'parent-email': '📧 Parent Emails',
    'progress-report': '📝 Progress Reports',
    'iep-update': '🎯 IEP Updates',
    'incident-report': '⚠️ Incident Reports',
    'meeting-notes': '📋 Meeting Notes',
    'lesson-plan': '📚 Lesson Plans',
    'pacing-guide': '📅 Pacing Guides',
    'warm-up': '🌅 Warm-Ups',
    'exit-ticket': '🎫 Exit Tickets',
    'rubric': '📊 Rubrics',
    'quiz': '📝 Quizzes/Tests',
    'question-bank': '🏦 Question Banks',
    'quest': '🗡️ Quests',
    'boss-battle': '🐉 Boss Battles',
    'badges': '🏆 Badges',
    'xp-system': '⚡ XP Systems',
    'sel-checkin': '💚 SEL Check-Ins',
    'sel-activity': '🎯 SEL Activities',
    'calming': '🧘 Calming Strategies',
    'conflict-resolution': '🤝 Conflict Resolution',
    'sel-worksheet': '📝 SEL Worksheets',
    'social-story': '📖 Social Stories',
    'team-building': '🤝 Team Building',
    'essay-feedback': '✍️ Essay Feedback',
    'writing-prompt': '📝 Writing Prompts',
    'peer-review': '👥 Peer Reviews',
    'writing-conference': '📋 Writing Conferences',
    'comprehension': '📖 Comprehension',
    'vocabulary': '📚 Vocabulary',
    'guided-reading': '📖 Guided Reading',
    'reading-response': '📝 Reading Response',
    'text-level': '📊 Text Leveling',
    'tiered-activity': '🎯 Tiered Activities',
    'scaffold': '🛠️ Scaffolds',
    'accommodation': '♿ Accommodations',
    'error-analysis': '🔍 Error Analysis',
    'concept-explainer': '📐 Concept Explainer',
    'math-feedback': '✨ Math Feedback',
    'word-problems': '🔢 Word Problems',
    'procedure': '📋 Procedures',
    'seating': '🪑 Seating Charts',
    'behavior-plan': '💚 Behavior Plans',
    'sub-plan': '📝 Sub Plans',
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchDocuments(session.user.id)
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    checkSession()
  }, [router])

  const fetchDocuments = async (userId) => {
    try {
      const response = await fetch(`/api/documents?userId=${userId}&limit=100`)
      const data = await response.json()
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    setDeleting(docId)
    try {
      const response = await fetch(`/api/documents?id=${docId}&userId=${user.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setDocuments(documents.filter(d => d.id !== docId))
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null)
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
    setDeleting(null)
  }

  const handleExportDocx = async (doc) => {
    setExporting(doc.id)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: doc.title,
          content: doc.content,
          toolName: doc.tool_name,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting document:', error)
      alert('Failed to export document')
    }
    setExporting(null)
  }

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
    alert('Copied to clipboard!')
  }

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.tool_type === filter
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-800">Document History</h1>
          </div>
          <span className="text-gray-500 text-sm">{documents.length} documents</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full md:w-48 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {Object.entries(toolTypes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-bold text-gray-800">Documents</h2>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {filteredDocs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No documents found</p>
                  <p className="text-sm mt-2">Generate documents to see them here</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedDoc?.id === doc.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.tool_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Document Preview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-800">
                {selectedDoc ? selectedDoc.title : 'Select a document'}
              </h2>
              {selectedDoc && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(selectedDoc.content)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleExportDocx(selectedDoc)}
                    disabled={exporting === selectedDoc.id}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {exporting === selectedDoc.id ? 'Exporting...' : 'Export .docx'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    disabled={deleting === selectedDoc.id}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {deleting === selectedDoc.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 overflow-y-auto max-h-[600px]">
              {selectedDoc ? (
                <div className="whitespace-pre-wrap text-gray-800 text-sm">
                  {selectedDoc.content}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p>Select a document from the list to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}