'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function QuizGraderPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Quiz Setup
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [subject, setSubject] = useState('Science')
  const [quizTitle, setQuizTitle] = useState('')
  const [quizContent, setQuizContent] = useState('')
  const [answerKey, setAnswerKey] = useState('')
  const [totalPoints, setTotalPoints] = useState('')
  
  // File Uploads
  const [quizFile, setQuizFile] = useState(null)
  const [quizFileProcessing, setQuizFileProcessing] = useState(false)
  const [answersFile, setAnswersFile] = useState(null)
  const [answersFileProcessing, setAnswersFileProcessing] = useState(false)
  
  // Grading Mode
  const [gradingMode, setGradingMode] = useState('single') // 'single' or 'batch'
  
  // Single Student
  const [studentName, setStudentName] = useState('')
  const [studentAnswers, setStudentAnswers] = useState('')
  
  // Batch Students
  const [batchStudentData, setBatchStudentData] = useState('')
  
  // Feedback Options
  const [feedbackTone, setFeedbackTone] = useState('encouraging')
  const [includeExplanations, setIncludeExplanations] = useState(true)
  const [includeStudyTips, setIncludeStudyTips] = useState(true)
  
  // Output
  const [gradingResults, setGradingResults] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  
  // UI State
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState('results') // 'results', 'analytics', 'feedback'
  
  const quizFileInputRef = useRef(null)
  const answersFileInputRef = useRef(null)
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

  // Process uploaded file to extract text
  const processFile = async (file, type) => {
    if (!file) return
    
    if (type === 'quiz') {
      setQuizFileProcessing(true)
    } else {
      setAnswersFileProcessing(true)
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (type === 'quiz') {
          // Try to split into quiz content and answer key
          const text = data.text || ''
          const answerKeyMatch = text.toLowerCase().indexOf('answer key')
          if (answerKeyMatch !== -1) {
            setQuizContent(text.substring(0, answerKeyMatch).trim())
            setAnswerKey(text.substring(answerKeyMatch).trim())
          } else {
            setQuizContent(text)
          }
          setQuizFile(file)
        } else {
          if (gradingMode === 'single') {
            setStudentAnswers(data.text || '')
          } else {
            setBatchStudentData(data.text || '')
          }
          setAnswersFile(file)
        }
      } else {
        alert('Failed to process file. Please try pasting the content instead.')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Failed to process file. Please try pasting the content instead.')
    }
    
    if (type === 'quiz') {
      setQuizFileProcessing(false)
    } else {
      setAnswersFileProcessing(false)
    }
  }

  const handleQuizFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file, 'quiz')
    }
  }

  const handleAnswersFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file, 'answers')
    }
  }

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('Science')
    setQuizTitle('Water Cycle Quiz')
    setQuizContent(`1. What is the process called when water changes from liquid to gas?
a) Condensation
b) Evaporation
c) Precipitation
d) Collection

2. Where does most evaporation occur?
a) Lakes
b) Rivers
c) Oceans
d) Puddles

3. What causes water to evaporate?
a) Wind
b) Heat from the sun
c) Gravity
d) Cold temperatures

4. What is it called when water vapor cools and forms clouds?
a) Evaporation
b) Precipitation
c) Condensation
d) Transpiration

5. Which of these is NOT a form of precipitation?
a) Rain
b) Snow
c) Fog
d) Hail

6. Short Answer: Explain how the water cycle affects weather in your area. (4 points)`)
    setAnswerKey(`1. b) Evaporation
2. c) Oceans
3. b) Heat from the sun
4. c) Condensation
5. c) Fog
6. Answers should include: water evaporates from local bodies of water, forms clouds, precipitation falls as rain/snow depending on season, water collects and the cycle repeats. Should mention how this creates local weather patterns.`)
    setTotalPoints('10')
    setGradingMode('batch')
    setBatchStudentData(`Student: Maria Santos
1. b
2. c
3. b
4. c
5. a
6. Water goes up from the lake and makes clouds. Then it rains and the water goes back to the lake. This is why we get rain in spring.

---

Student: James Wilson
1. b
2. c
3. a
4. b
5. c
6. The sun heats water and it evaporates. Then it condenses into clouds. When clouds get heavy, precipitation falls as rain or snow. This cycle affects our weather because it determines when we get storms and how much rain we receive.

---

Student: Aisha Johnson
1. a
2. c
3. b
4. c
5. c
6. The water cycle makes weather. Evaporation and condensation happen.`)
    setShowDemo(true)
    setGradingResults(null)
    setAnalytics(null)
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('Science')
    setQuizTitle('')
    setQuizContent('')
    setAnswerKey('')
    setTotalPoints('')
    setGradingMode('single')
    setStudentName('')
    setStudentAnswers('')
    setBatchStudentData('')
    setQuizFile(null)
    setAnswersFile(null)
    setShowDemo(false)
    setGradingResults(null)
    setAnalytics(null)
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGrade = async () => {
    if (!quizContent || !answerKey) {
      alert('Please enter the quiz and answer key')
      return
    }
    
    if (gradingMode === 'single' && !studentAnswers) {
      alert('Please enter student answers')
      return
    }
    
    if (gradingMode === 'batch' && !batchStudentData) {
      alert('Please enter student data')
      return
    }
    
    setGrading(true)
    setGradingResults(null)
    setAnalytics(null)
    setSaved(false)

    try {
      const response = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          subject,
          quizTitle,
          quizContent,
          answerKey,
          totalPoints: totalPoints || '100',
          gradingMode,
          studentName: gradingMode === 'single' ? studentName : null,
          studentAnswers: gradingMode === 'single' ? studentAnswers : null,
          batchStudentData: gradingMode === 'batch' ? batchStudentData : null,
          feedbackTone,
          includeExplanations,
          includeStudyTips,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGradingResults(data.results)
        setAnalytics(data.analytics)
        await handleSave(data)
        scrollToOutput()
      }
    } catch (error) {
      alert('Error grading quiz. Please try again.')
    }
    
    setGrading(false)
  }

  const handleSave = async (data) => {
    if (!data || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Quiz Grades: ${quizTitle || 'Untitled Quiz'}`,
          toolType: 'quiz-grader',
          toolName: 'Quiz Grader',
          content: JSON.stringify(data, null, 2),
          metadata: { gradeLevel, subject, quizTitle, gradingMode },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async () => {
    if (!gradingResults) return
    setExporting(true)
    try {
      let content = `QUIZ GRADING RESULTS\n${'='.repeat(50)}\n\n`
      content += `Quiz: ${quizTitle}\nSubject: ${subject}\nGrade Level: ${gradeLevel}\n\n`
      
      if (gradingMode === 'single') {
        content += `STUDENT: ${studentName || 'Student'}\n${'-'.repeat(30)}\n`
        content += `Score: ${gradingResults.score}\n`
        content += `Percentage: ${gradingResults.percentage}%\n\n`
        content += `FEEDBACK:\n${gradingResults.feedback}\n\n`
        if (gradingResults.questionBreakdown) {
          content += `QUESTION BREAKDOWN:\n${gradingResults.questionBreakdown}\n`
        }
      } else {
        gradingResults.forEach((result, index) => {
          content += `\nSTUDENT: ${result.studentName}\n${'-'.repeat(30)}\n`
          content += `Score: ${result.score}\n`
          content += `Percentage: ${result.percentage}%\n`
          content += `Feedback: ${result.feedback}\n`
        })
        
        if (analytics) {
          content += `\n\nCLASS ANALYTICS\n${'='.repeat(50)}\n`
          content += analytics
        }
      }
      
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Quiz Grades - ${quizTitle}`,
          content: content,
          toolName: 'Quiz Grader'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Quiz_Grades_${(quizTitle || 'Quiz').replace(/\s+/g, '_')}.docx`
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
    let text = ''
    if (gradingMode === 'single' && gradingResults) {
      text = `Student: ${studentName}\nScore: ${gradingResults.score} (${gradingResults.percentage}%)\n\nFeedback:\n${gradingResults.feedback}`
    } else if (gradingResults) {
      text = gradingResults.map(r => `${r.studentName}: ${r.score} (${r.percentage}%)`).join('\n')
      if (analytics) {
        text += `\n\nAnalytics:\n${analytics}`
      }
    }
    navigator.clipboard.writeText(text)
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Quiz Grader</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">✅</span>
                <h1 className="text-2xl font-semibold text-gray-800">Quiz Grader</h1>
              </div>
              <p className="text-gray-500">Grade quizzes with personalized feedback and class analytics.</p>
            </div>
            <div className="flex items-center gap-3">
              {showDemo && (
                <button onClick={handleResetDemo} className="text-gray-400 hover:text-gray-600 transition-colors" title="Reset">↺</button>
              )}
              <button onClick={handleShowDemo} className={`text-sm font-medium transition-colors ${showDemo ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}>
                Show Demo
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-xl">✨</span>
                <div className="flex-1">
                  <h3 className="text-purple-700 font-medium">Demo loaded!</h3>
                  <p className="text-purple-600 text-sm">Example: Water Cycle Quiz with 3 students' answers ready to grade.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Quiz Setup */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Quiz Setup</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Foreign Language', 'Computer Science'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                  <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} 
                    placeholder="e.g., Water Cycle Quiz"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Points</label>
                  <input type="text" value={totalPoints} onChange={(e) => setTotalPoints(e.target.value)} 
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
                </div>
              </div>

              {/* Quiz File Upload */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Quiz Questions *</label>
                  <div>
                    <input 
                      type="file" 
                      ref={quizFileInputRef}
                      onChange={handleQuizFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                    />
                    <button 
                      onClick={() => quizFileInputRef.current?.click()}
                      disabled={quizFileProcessing}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300"
                    >
                      {quizFileProcessing ? '⏳ Processing...' : '📎 Upload File'}
                    </button>
                  </div>
                </div>
                {quizFile && (
                  <div className="mb-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center justify-between">
                    <span>✓ {quizFile.name}</span>
                    <button onClick={() => { setQuizFile(null); setQuizContent(''); setAnswerKey('') }} className="text-green-700 hover:text-green-800">✕</button>
                  </div>
                )}
                <textarea value={quizContent} onChange={(e) => setQuizContent(e.target.value)} 
                  placeholder="Paste your quiz questions here or upload a file..."
                  rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer Key *</label>
                <textarea value={answerKey} onChange={(e) => setAnswerKey(e.target.value)} 
                  placeholder="Paste your answer key here (will auto-fill if included in uploaded quiz)..."
                  rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>
            </div>

            {/* Grading Mode */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">👥 Student Answers</h2>
              
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setGradingMode('single')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${gradingMode === 'single' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  👤 Single Student
                </button>
                <button 
                  onClick={() => setGradingMode('batch')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${gradingMode === 'batch' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  👥 Batch Grade Class
                </button>
              </div>

              {/* Answers File Upload */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {gradingMode === 'single' ? 'Student Answers *' : 'All Students\' Answers *'}
                  </label>
                  <div>
                    <input 
                      type="file" 
                      ref={answersFileInputRef}
                      onChange={handleAnswersFileChange}
                      accept=".pdf,.doc,.docx,.txt,.csv"
                      className="hidden"
                    />
                    <button 
                      onClick={() => answersFileInputRef.current?.click()}
                      disabled={answersFileProcessing}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300"
                    >
                      {answersFileProcessing ? '⏳ Processing...' : '📎 Upload File'}
                    </button>
                  </div>
                </div>
                {answersFile && (
                  <div className="mb-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center justify-between">
                    <span>✓ {answersFile.name}</span>
                    <button onClick={() => { setAnswersFile(null); setStudentAnswers(''); setBatchStudentData('') }} className="text-green-700 hover:text-green-800">✕</button>
                  </div>
                )}
              </div>

              {gradingMode === 'single' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                    <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} 
                      placeholder="e.g., Maria Santos"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400" />
                  </div>
                  <div>
                    <textarea value={studentAnswers} onChange={(e) => setStudentAnswers(e.target.value)} 
                      placeholder="Paste the student's answers here or upload a file..."
                      rows={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Format:</span> Separate each student with "---" or "Student: Name"
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Example:<br />
                      Student: Maria Santos<br />
                      1. b<br />
                      2. c<br />
                      ---<br />
                      Student: James Wilson<br />
                      1. a<br />
                      2. c
                    </p>
                  </div>
                  <div>
                    <textarea value={batchStudentData} onChange={(e) => setBatchStudentData(e.target.value)} 
                      placeholder="Paste all students' answers here or upload a file..."
                      rows={8} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
                  </div>
                </>
              )}
            </div>

            {/* Feedback Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">💬 Feedback Options</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Tone</label>
                <select value={feedbackTone} onChange={(e) => setFeedbackTone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                  <option value="encouraging">🌟 Encouraging & Supportive</option>
                  <option value="constructive">📝 Constructive & Direct</option>
                  <option value="detailed">🔍 Detailed & Academic</option>
                  <option value="brief">⚡ Brief & To-the-Point</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeExplanations} onChange={(e) => setIncludeExplanations(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                  <span className="text-gray-700">Include explanations for wrong answers</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={includeStudyTips} onChange={(e) => setIncludeStudyTips(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                  <span className="text-gray-700">Include study tips for improvement</span>
                </label>
              </div>
            </div>

            {/* Grade Button */}
            <button onClick={handleGrade} disabled={grading || !quizContent || !answerKey}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              {grading ? (
                <><span className="animate-spin">⏳</span>Grading...</>
              ) : (
                <><span>✅</span>Grade {gradingMode === 'batch' ? 'All Students' : 'Quiz'}</>
              )}
            </button>
          </div>

          {/* Right Column - Output */}
          <div ref={outputRef} className="space-y-6">
            {gradingResults ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">Grading Results</h2>
                    {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <button onClick={handleExportDocx} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                      {exporting ? 'Exporting...' : '📄 Export'}
                    </button>
                  </div>
                </div>

                {/* Tabs for batch mode */}
                {gradingMode === 'batch' && (
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => setActiveTab('results')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'results' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      📊 Scores
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      📈 Analytics
                    </button>
                    <button 
                      onClick={() => setActiveTab('feedback')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'feedback' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      💬 Feedback
                    </button>
                  </div>
                )}

                {/* Single Student Results */}
                {gradingMode === 'single' && gradingResults && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 text-center">
                      <p className="text-gray-600 mb-1">{studentName || 'Student'}</p>
                      <p className="text-4xl font-bold text-purple-700">{gradingResults.score}</p>
                      <p className="text-2xl text-gray-600">{gradingResults.percentage}%</p>
                      <div className="mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          gradingResults.percentage >= 90 ? 'bg-green-100 text-green-700' :
                          gradingResults.percentage >= 80 ? 'bg-blue-100 text-blue-700' :
                          gradingResults.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                          gradingResults.percentage >= 60 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {gradingResults.percentage >= 90 ? 'Excellent!' :
                           gradingResults.percentage >= 80 ? 'Great Job!' :
                           gradingResults.percentage >= 70 ? 'Good Work' :
                           gradingResults.percentage >= 60 ? 'Keep Trying' :
                           'Needs Review'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 mb-2">📝 Feedback</h3>
                      <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{gradingResults.feedback}</pre>
                    </div>

                    {gradingResults.questionBreakdown && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h3 className="font-medium text-gray-800 mb-2">📋 Question Breakdown</h3>
                        <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{gradingResults.questionBreakdown}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Batch Results - Scores Tab */}
                {gradingMode === 'batch' && activeTab === 'results' && Array.isArray(gradingResults) && (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {gradingResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{result.studentName}</p>
                          <p className="text-sm text-gray-500">{result.score}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            result.percentage >= 90 ? 'text-green-600' :
                            result.percentage >= 80 ? 'text-blue-600' :
                            result.percentage >= 70 ? 'text-yellow-600' :
                            result.percentage >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>{result.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Batch Results - Analytics Tab */}
                {gradingMode === 'batch' && activeTab === 'analytics' && analytics && (
                  <div className="bg-gray-50 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{analytics}</pre>
                  </div>
                )}

                {/* Batch Results - Feedback Tab */}
                {gradingMode === 'batch' && activeTab === 'feedback' && Array.isArray(gradingResults) && (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {gradingResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-800">{result.studentName}</p>
                          <span className="text-sm text-purple-600">{result.percentage}%</span>
                        </div>
                        <p className="text-sm text-gray-600">{result.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to grade!</h3>
                  <p className="text-gray-400 mb-4">Upload or paste your quiz and student answers</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left max-w-sm mx-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">You'll get:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>✓ Individual scores & percentages</li>
                      <li>✓ Personalized feedback per student</li>
                      <li>✓ Explanations for wrong answers</li>
                      <li>✓ Class analytics & patterns</li>
                      <li>✓ Reteaching suggestions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}