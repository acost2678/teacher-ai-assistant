'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import FileUpload from '../../../components/FileUpload'

export default function EssayFeedbackPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Basic settings
  const [gradeLevel, setGradeLevel] = useState('9th Grade')
  const [writingType, setWritingType] = useState('argumentative')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  
  // Student writing
  const [studentWriting, setStudentWriting] = useState('')
  
  // Teacher customization
  const [rubric, setRubric] = useState('')
  const [teacherSamples, setTeacherSamples] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  
  // Feedback options
  const [feedbackFocus, setFeedbackFocus] = useState('balanced')
  const [feedbackTone, setFeedbackTone] = useState('encouraging')
  const [feedbackDepth, setFeedbackDepth] = useState('detailed')
  const [includeStrengths, setIncludeStrengths] = useState(true)
  const [includeNextSteps, setIncludeNextSteps] = useState(true)
  const [includeInlineSuggestions, setIncludeInlineSuggestions] = useState(true)
  const [includeGradeEstimate, setIncludeGradeEstimate] = useState(false)
  
  // Output
  const [generatedFeedback, setGeneratedFeedback] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // UI state
  const [activeTab, setActiveTab] = useState('writing')
  
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
    if (!studentWriting.trim()) {
      alert('Please enter or paste the student\'s writing')
      return
    }
    
    setGenerating(true)
    setGeneratedFeedback('')
    setSaved(false)

    try {
      const response = await fetch('/api/generate-essay-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel, writingType, assignmentDescription, studentWriting,
          rubric, teacherSamples, feedbackFocus, feedbackTone, feedbackDepth,
          includeStrengths, includeNextSteps, includeInlineSuggestions,
          includeGradeEstimate, customInstructions,
        }),
      })
      const data = await response.json()
      if (data.error) { alert('Error: ' + data.error) }
      else { setGeneratedFeedback(data.feedback); await handleSave(data.feedback) }
    } catch (error) { alert('Error generating feedback. Please try again.') }
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
          title: `Essay Feedback: ${writingType} (${gradeLevel})`,
          toolType: 'essay-feedback',
          toolName: 'Essay Feedback',
          content,
          metadata: { gradeLevel, writingType, feedbackFocus, feedbackTone },
        }),
      })
      setSaved(true)
    } catch (error) { console.error('Error saving:', error) }
  }

  const handleExportDocx = async () => {
    if (!generatedFeedback) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Essay Feedback - ${writingType}`, 
          content: generatedFeedback, 
          toolName: 'Essay Feedback' 
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `Essay_Feedback_${writingType}.docx`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) { alert('Failed to export') }
    setExporting(false)
  }

  const handleCopy = () => { 
    navigator.clipboard.writeText(generatedFeedback)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) 
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-600">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800">← Back</button>
            <h1 className="text-xl font-bold text-gray-800">✍️ Essay Feedback Generator</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              {[
                { id: 'writing', label: '📝 Student Writing', required: true },
                { id: 'rubric', label: '📊 Rubric' },
                { id: 'style', label: '🎨 Your Style' },
                { id: 'options', label: '⚙️ Options' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-rose-50 text-rose-700 border-b-2 border-rose-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {tab.required && <span className="text-rose-500 ml-1">*</span>}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh]">
              
              {/* Tab 1: Student Writing */}
              {activeTab === 'writing' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Student Writing</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Grade Level</label>
                      <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                        {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', 
                          '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'College'].map(g => 
                          <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Writing Type</label>
                      <select value={writingType} onChange={(e) => setWritingType(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                        <option value="argumentative">Argumentative/Persuasive</option>
                        <option value="expository">Expository/Informational</option>
                        <option value="narrative">Narrative</option>
                        <option value="literary-analysis">Literary Analysis</option>
                        <option value="research">Research Paper</option>
                        <option value="compare-contrast">Compare/Contrast</option>
                        <option value="response-to-text">Response to Text</option>
                        <option value="descriptive">Descriptive</option>
                        <option value="creative">Creative Writing</option>
                        <option value="journal">Journal/Reflection</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Assignment Description (optional)</label>
                    <input type="text" value={assignmentDescription} onChange={(e) => setAssignmentDescription(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800"
                      placeholder="e.g., 5-paragraph essay on climate change, Personal narrative about a challenge..." />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                      Student's Writing <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      value={studentWriting} 
                      onChange={(e) => setStudentWriting(e.target.value)}
                      className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 h-64 font-mono text-sm"
                      placeholder="Paste the student's writing here..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {studentWriting.split(/\s+/).filter(w => w).length} words
                    </p>
                  </div>

                  <FileUpload
                    onContentExtracted={setStudentWriting}
                    label="Or Upload Student's Work"
                    helpText="Upload a .txt file or paste from a Word document"
                    placeholder="Paste student's essay here..."
                  />
                </div>
              )}

              {/* Tab 2: Rubric */}
              {activeTab === 'rubric' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Rubric</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Add your rubric so feedback aligns with your grading criteria. The AI will reference specific rubric categories.
                  </p>

                  <div className="mb-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
                    <label className="block text-gray-800 font-medium mb-2">📊 Your Rubric</label>
                    <textarea 
                      value={rubric} 
                      onChange={(e) => setRubric(e.target.value)}
                      className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 h-48 text-sm"
                      placeholder="Paste your rubric here...

Example format:
CONTENT (25 points)
- 25-22: Exceptional depth, original ideas, thorough development
- 21-18: Strong ideas with good development
- 17-14: Adequate ideas, some development needed
- Below 14: Ideas unclear or underdeveloped

ORGANIZATION (25 points)
- 25-22: Clear structure, smooth transitions, logical flow
..."
                    />
                  </div>

                  <FileUpload
                    onContentExtracted={setRubric}
                    label="Or Upload Rubric File"
                    helpText="Upload your rubric document"
                    placeholder="Paste rubric content here..."
                  />

                  <div className="mt-4 flex items-center gap-3">
                    <input type="checkbox" id="includeGradeEstimate" checked={includeGradeEstimate}
                      onChange={(e) => setIncludeGradeEstimate(e.target.checked)} className="w-5 h-5 text-rose-600 rounded" />
                    <label htmlFor="includeGradeEstimate" className="text-gray-700">
                      Include estimated score/grade based on rubric
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 3: Your Style */}
              {activeTab === 'style' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Match Your Grading Style</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload examples of your previous feedback so the AI can match your unique voice and approach.
                  </p>

                  <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <label className="block text-gray-800 font-medium mb-2">🎨 Your Previous Feedback Examples</label>
                    <p className="text-xs text-gray-600 mb-3">
                      Paste 1-3 examples of feedback you've given on student writing. The AI will study your tone, 
                      the types of comments you make, and how you phrase suggestions.
                    </p>
                    <textarea 
                      value={teacherSamples} 
                      onChange={(e) => setTeacherSamples(e.target.value)}
                      className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 h-48 text-sm"
                      placeholder="Paste examples of your previous feedback here...

Example:
'Great opening hook! You immediately grabbed my attention with that question. One thing to work on: your second paragraph jumps to a new idea without a transition. Try adding a sentence that connects your first point about... to your second point about...

I love how you used the quote from the text to support your argument. Next time, try explaining WHY this quote proves your point - don't assume the reader will make that connection.

Overall, this shows real growth in your argumentative writing! Focus on those transitions for your revision.'"
                    />
                  </div>

                  <FileUpload
                    onContentExtracted={setTeacherSamples}
                    label="Or Upload Previous Graded Work"
                    helpText="Upload a document with your feedback comments"
                    placeholder="Paste your feedback examples here..."
                  />

                  <div className="mt-4">
                    <label className="block text-gray-700 mb-2">Custom Instructions (optional)</label>
                    <textarea 
                      value={customInstructions} 
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 h-20 text-sm"
                      placeholder="Any specific instructions? e.g., 'Focus especially on thesis statements', 'This student struggles with organization', 'Be extra encouraging - this is a reluctant writer'"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Options */}
              {activeTab === 'options' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Feedback Options</h2>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Feedback Focus</label>
                    <select value={feedbackFocus} onChange={(e) => setFeedbackFocus(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                      <option value="balanced">🔄 Balanced - All areas equally</option>
                      <option value="content">💡 Content & Ideas</option>
                      <option value="organization">📐 Organization & Structure</option>
                      <option value="voice">🎭 Voice & Style</option>
                      <option value="conventions">📝 Conventions & Mechanics</option>
                      <option value="evidence">📚 Evidence & Support</option>
                      <option value="argument">⚖️ Argument & Logic</option>
                      <option value="holistic">🌐 Holistic - Big picture only</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Feedback Tone</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'encouraging', label: '💚 Encouraging & Supportive', desc: 'Focus on growth, celebrate effort' },
                        { id: 'coaching', label: '🏃 Coaching', desc: 'Like a mentor guiding improvement' },
                        { id: 'direct', label: '📍 Direct & Clear', desc: 'Straightforward, specific suggestions' },
                        { id: 'socratic', label: '❓ Socratic', desc: 'Ask questions to prompt thinking' },
                        { id: 'formal', label: '📋 Formal', desc: 'Professional, scholarly tone' },
                      ].map(t => (
                        <button key={t.id} type="button" onClick={() => setFeedbackTone(t.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${feedbackTone === t.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300'}`}>
                          <div className="font-medium text-gray-800">{t.label}</div>
                          <div className="text-xs text-gray-500">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Feedback Depth</label>
                    <select value={feedbackDepth} onChange={(e) => setFeedbackDepth(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800">
                      <option value="brief">Brief - Key points only</option>
                      <option value="moderate">Moderate - Main feedback with examples</option>
                      <option value="detailed">Detailed - Comprehensive with specifics</option>
                      <option value="extensive">Extensive - In-depth analysis</option>
                    </select>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <label className="block text-gray-800 font-medium mb-3">Include in Feedback</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={includeStrengths}
                          onChange={(e) => setIncludeStrengths(e.target.checked)} className="w-5 h-5 text-rose-600 rounded" />
                        <span className="text-gray-700">🌟 Strengths section (what's working well)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={includeNextSteps}
                          onChange={(e) => setIncludeNextSteps(e.target.checked)} className="w-5 h-5 text-rose-600 rounded" />
                        <span className="text-gray-700">🎯 Next steps for revision</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={includeInlineSuggestions}
                          onChange={(e) => setIncludeInlineSuggestions(e.target.checked)} className="w-5 h-5 text-rose-600 rounded" />
                        <span className="text-gray-700">📍 Specific inline suggestions</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button - always visible */}
              <div className="mt-6 pt-4 border-t">
                <button onClick={handleGenerate} disabled={generating || !studentWriting.trim()}
                  className="w-full bg-rose-600 text-white p-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {generating ? '✍️ Generating Thoughtful Feedback...' : '✍️ Generate Feedback'}
                </button>
                {!studentWriting.trim() && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Add student writing in the first tab to generate feedback
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Generated Feedback</h2>
                {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Saved</span>}
              </div>
              {generatedFeedback && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="text-rose-600 hover:text-rose-800 text-sm">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleExportDocx} disabled={exporting} 
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50">
                    {exporting ? 'Exporting...' : 'Export .docx'}
                  </button>
                </div>
              )}
            </div>

            {generatedFeedback ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800 text-sm overflow-y-auto max-h-[75vh]">
                {generatedFeedback}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-gray-400 text-center h-[75vh] flex items-center justify-center">
                <div>
                  <p className="text-4xl mb-4">✍️</p>
                  <p className="mb-2">Your feedback will appear here</p>
                  <p className="text-xs max-w-xs mx-auto">
                    Thoughtful, personalized feedback that honors your teaching voice
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}