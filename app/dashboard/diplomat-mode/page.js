'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function DiplomatModePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // Input
  const [emailDraft, setEmailDraft] = useState('')
  const [context, setContext] = useState('')
  const [relationship, setRelationship] = useState('neutral')
  
  // Output
  const [analysis, setAnalysis] = useState(null)
  const [revisedEmail, setRevisedEmail] = useState('')
  
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

  const handleShowDemo = () => {
    setEmailDraft(`Dear Mrs. Johnson,

I need to address the ongoing issues with Marcus's behavior in class. He has been constantly disrupting lessons and refusing to follow basic instructions. Other students are complaining about him, and frankly, I don't understand why this keeps happening when we've already discussed this multiple times.

I've done everything I can on my end. At this point, I need you to step up and address this at home. He clearly isn't getting the message, and I can't keep spending all my time managing his behavior while neglecting the other 24 students in my class.

If things don't improve by next week, we'll have no choice but to involve the principal and discuss whether this classroom is the right fit for him.

Please contact me immediately to discuss.

Ms. Thompson`)
    setContext('Parent has been defensive in past meetings. Student has ADHD diagnosis.')
    setRelationship('strained')
    setAnalysis(null)
    setRevisedEmail('')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setEmailDraft('')
    setContext('')
    setRelationship('neutral')
    setAnalysis(null)
    setRevisedEmail('')
    setShowDemo(false)
  }

  const handleAnalyze = async () => {
    if (!emailDraft.trim()) {
      alert('Please enter an email draft to analyze')
      return
    }

    setAnalyzing(true)
    setAnalysis(null)
    setRevisedEmail('')

    try {
      const response = await fetch('/api/diplomat-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailDraft,
          context,
          relationship,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        setAnalysis(data.analysis)
        setRevisedEmail(data.revisedEmail)
      }
    } catch (error) {
      alert('Error analyzing email. Please try again.')
    }

    setAnalyzing(false)
  }

  const handleCopyRevised = () => {
    navigator.clipboard.writeText(revisedEmail)
    alert('Revised email copied to clipboard!')
  }

  const getToneColor = (score) => {
    if (score >= 8) return 'bg-green-100 text-green-700 border-green-300'
    if (score >= 6) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    if (score >= 4) return 'bg-orange-100 text-orange-700 border-orange-300'
    return 'bg-red-100 text-red-700 border-red-300'
  }

  const getToneLabel = (score) => {
    if (score >= 8) return 'Excellent - Ready to send'
    if (score >= 6) return 'Good - Minor adjustments suggested'
    if (score >= 4) return 'Caution - Review before sending'
    return 'Needs Revision - High conflict risk'
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Diplomat Mode</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🕊️</span>
                <h1 className="text-2xl font-semibold text-gray-800">Diplomat Mode</h1>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">TONE CHECKER</span>
              </div>
              <p className="text-gray-500">Check your emails for defensive or escalating language before sending. Get suggestions for more collaborative, de-escalating communication.</p>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h3 className="text-blue-800 font-medium">Why Tone Matters</h3>
                <p className="text-blue-700 text-sm">Research shows that parent-teacher relationships directly impact student success. One poorly-worded email can damage trust built over months. This tool helps you communicate concerns while maintaining partnership.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Email Draft */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Email Draft</h2>
              <textarea
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                placeholder="Paste your email draft here...

Example: 'Dear Mr. and Mrs. Smith, I need to discuss Johnny's behavior in class...'"
                rows={12}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{emailDraft.length} characters</span>
              </div>
            </div>

            {/* Context */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Context (Optional)</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship with this family</label>
                <select 
                  value={relationship} 
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                >
                  <option value="positive">Positive - Good rapport established</option>
                  <option value="neutral">Neutral - Limited interaction</option>
                  <option value="strained">Strained - Previous conflicts or tension</option>
                  <option value="new">New - First communication</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional context</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any relevant background: parent's concerns, previous meetings, student circumstances, etc."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 resize-none"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !emailDraft.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Analyzing tone...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analyze Email Tone
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {!analysis ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <span className="text-4xl mb-3 block">🕊️</span>
                  <p>Paste your email and click "Analyze" to check the tone</p>
                </div>
              </div>
            ) : (
              <>
                {/* Tone Score */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Tone Analysis</h2>
                  
                  <div className={`p-4 rounded-xl border-2 mb-4 ${getToneColor(analysis.score)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">Tone Score: {analysis.score}/10</span>
                      <span className="text-2xl">{analysis.score >= 6 ? '✅' : '⚠️'}</span>
                    </div>
                    <p className="text-sm">{getToneLabel(analysis.score)}</p>
                  </div>

                  {/* Issues Found */}
                  {analysis.issues && analysis.issues.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">⚠️ Issues Detected:</h3>
                      <ul className="space-y-2">
                        {analysis.issues.map((issue, index) => (
                          <li key={index} className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                            <span className="font-medium text-red-700">{issue.type}:</span>
                            <span className="text-red-600 ml-1">"{issue.phrase}"</span>
                            <p className="text-red-600 mt-1 text-xs">{issue.suggestion}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">✨ What's Working:</h3>
                      <ul className="space-y-1">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-green-700 text-sm flex items-start gap-2">
                            <span>✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Revised Email */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Suggested Revision</h2>
                    <button
                      onClick={handleCopyRevised}
                      className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <textarea
                    value={revisedEmail}
                    onChange={(e) => setRevisedEmail(e.target.value)}
                    rows={14}
                    className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 This is a suggestion - edit as needed to match your voice
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Quick Tips for Parent Communication</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-medium text-green-800 mb-2">✅ Do</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Lead with something positive</li>
                <li>• Use "I've noticed" vs "He always"</li>
                <li>• Offer partnership: "Together we can..."</li>
                <li>• Be specific with examples</li>
                <li>• End with a collaborative next step</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-medium text-red-800 mb-2">❌ Avoid</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Absolutes: "always," "never"</li>
                <li>• Blame language: "you need to"</li>
                <li>• Comparing to other students</li>
                <li>• Ultimatums or threats</li>
                <li>• Writing when emotional</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 mb-2">💡 Remember</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Parents want their child to succeed</li>
                <li>• You're on the same team</li>
                <li>• Tone is 90% of the message</li>
                <li>• When in doubt, call instead</li>
                <li>• Sleep on difficult emails</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}