'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ProjectCreatorPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Basic Info
  const [gradeLevel, setGradeLevel] = useState('5th Grade')
  const [subject, setSubject] = useState('Science')
  
  // Lesson Content
  const [lessonContent, setLessonContent] = useState('')
  const [learningObjectives, setLearningObjectives] = useState('')
  
  // Project Preferences
  const [demonstrationMethod, setDemonstrationMethod] = useState('')
  const [projectFormat, setProjectFormat] = useState('individual')
  const [timeAvailable, setTimeAvailable] = useState('1 week')
  const [materialsAvailable, setMaterialsAvailable] = useState('')
  const [preferredProjectTypes, setPreferredProjectTypes] = useState([])
  
  // Differentiation
  const [differentiationNeeds, setDifferentiationNeeds] = useState('')
  
  // Mode & Output
  const [mode, setMode] = useState('ideas') // 'ideas' or 'full'
  const [generatedIdeas, setGeneratedIdeas] = useState([])
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [generatedProject, setGeneratedProject] = useState('')
  const [studentHandout, setStudentHandout] = useState('')
  
  // UI State
  const [copied, setCopied] = useState(false)
  const [copiedHandout, setCopiedHandout] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState('project') // 'project' or 'handout'
  
  const outputRef = useRef(null)
  const router = useRouter()

  const projectTypeOptions = [
    { id: 'poster', label: '📊 Poster/Display Board', description: 'Visual presentation on poster board' },
    { id: 'slideshow', label: '💻 Slideshow/Presentation', description: 'PowerPoint, Google Slides, Canva' },
    { id: 'video', label: '🎬 Video/Documentary', description: 'Recorded video or documentary style' },
    { id: 'model', label: '🏗️ Model/Diorama', description: '3D physical representation' },
    { id: 'essay', label: '📝 Essay/Written Report', description: 'Formal written piece' },
    { id: 'infographic', label: '📈 Infographic', description: 'Visual data representation' },
    { id: 'brochure', label: '📰 Brochure/Pamphlet', description: 'Foldable informational document' },
    { id: 'website', label: '🌐 Website/Digital Portfolio', description: 'Online presence or portfolio' },
    { id: 'podcast', label: '🎙️ Podcast/Audio Recording', description: 'Audio-based presentation' },
    { id: 'comic', label: '📚 Comic Strip/Graphic Novel', description: 'Illustrated storytelling' },
    { id: 'game', label: '🎮 Game/Interactive Activity', description: 'Board game, card game, or digital game' },
    { id: 'experiment', label: '🔬 Experiment/Investigation', description: 'Hands-on scientific inquiry' },
    { id: 'performance', label: '🎭 Performance/Skit/Play', description: 'Live or recorded acting' },
    { id: 'song', label: '🎵 Song/Rap/Jingle', description: 'Musical creation' },
    { id: 'art', label: '🎨 Art Project', description: 'Painting, sculpture, mixed media' },
    { id: 'interview', label: '🎤 Interview/Documentary', description: 'Recorded interviews' },
    { id: 'social-media', label: '📱 Mock Social Media Campaign', description: 'Fake Instagram, Twitter, etc.' },
    { id: 'news', label: '📺 News Report/Broadcast', description: 'Journalism-style reporting' },
    { id: 'childrens-book', label: '📖 Children\'s Book', description: 'Illustrated story for younger audience' },
    { id: 'magazine', label: '📰 Magazine/Newspaper', description: 'Multi-page publication' },
    { id: 'timeline', label: '📅 Timeline/Visual Timeline', description: 'Chronological representation' },
    { id: 'map', label: '🗺️ Annotated Map', description: 'Geographic visualization' },
    { id: 'letter', label: '✉️ Letter/Diary Entry', description: 'Historical perspective writing' },
    { id: 'debate', label: '🗣️ Debate/Argumentative Presentation', description: 'Persuasive speaking' },
    { id: 'museum', label: '🏛️ Museum Exhibit', description: 'Curated display with artifacts' },
    { id: 'tutorial', label: '📋 How-To Guide/Tutorial', description: 'Step-by-step instructions' },
    { id: 'board-game', label: '🎲 Board Game', description: 'Custom game with rules' },
    { id: 'escape-room', label: '🔐 Escape Room', description: 'Puzzle-based challenge' },
    { id: 'stem-challenge', label: '⚙️ STEM Challenge', description: 'Engineering/design challenge' },
    { id: 'research', label: '🔍 Research Project', description: 'In-depth investigation with sources' },
  ]

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

  const handleProjectTypeToggle = (typeId) => {
    setPreferredProjectTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  const handleShowDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('Science')
    setLessonContent(`We completed a 2-week unit on the water cycle. Students learned about:
- Evaporation: water turning from liquid to gas
- Condensation: water vapor cooling and forming clouds
- Precipitation: rain, snow, sleet, hail
- Collection: water gathering in oceans, lakes, rivers, groundwater
- The role of the sun in driving the water cycle
- How the water cycle affects weather and climate`)
    setLearningObjectives('Students can explain the four stages of the water cycle, describe how energy from the sun drives the cycle, and predict how changes to the water cycle affect local ecosystems.')
    setDemonstrationMethod('Students should demonstrate understanding of the complete cycle and be able to explain cause-and-effect relationships.')
    setProjectFormat('pairs')
    setTimeAvailable('1 week')
    setMaterialsAvailable('Chromebooks, art supplies, poster board, craft materials, access to library')
    setPreferredProjectTypes(['poster', 'model', 'video', 'infographic'])
    setDifferentiationNeeds('2 ELL students need sentence frames, 1 student with IEP needs extended time and chunked instructions')
    setShowDemo(true)
    setGeneratedIdeas([])
    setSelectedIdea(null)
    setGeneratedProject('')
    setStudentHandout('')
  }

  const handleResetDemo = () => {
    setGradeLevel('5th Grade')
    setSubject('Science')
    setLessonContent('')
    setLearningObjectives('')
    setDemonstrationMethod('')
    setProjectFormat('individual')
    setTimeAvailable('1 week')
    setMaterialsAvailable('')
    setPreferredProjectTypes([])
    setDifferentiationNeeds('')
    setShowDemo(false)
    setGeneratedIdeas([])
    setSelectedIdea(null)
    setGeneratedProject('')
    setStudentHandout('')
    setMode('ideas')
  }

  const scrollToOutput = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleGenerateIdeas = async () => {
    if (!lessonContent) {
      alert('Please enter the lesson content')
      return
    }
    
    setGenerating(true)
    setGeneratedIdeas([])
    setSelectedIdea(null)
    setGeneratedProject('')
    setStudentHandout('')
    setSaved(false)
    setMode('ideas')

    try {
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ideas',
          gradeLevel,
          subject,
          lessonContent,
          learningObjectives,
          demonstrationMethod,
          projectFormat,
          timeAvailable,
          materialsAvailable,
          preferredProjectTypes,
          differentiationNeeds,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedIdeas(data.ideas || [])
        scrollToOutput()
      }
    } catch (error) {
      alert('Error generating ideas. Please try again.')
    }
    
    setGenerating(false)
  }

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea)
  }

  const handleGenerateFullProject = async (idea = selectedIdea) => {
    if (!idea && !selectedIdea) {
      alert('Please select a project idea first')
      return
    }
    
    setGenerating(true)
    setGeneratedProject('')
    setStudentHandout('')
    setSaved(false)
    setMode('full')

    try {
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'full',
          gradeLevel,
          subject,
          lessonContent,
          learningObjectives,
          demonstrationMethod,
          projectFormat,
          timeAvailable,
          materialsAvailable,
          preferredProjectTypes,
          differentiationNeeds,
          selectedIdea: idea || selectedIdea,
        }),
      })
      
      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setGeneratedProject(data.project || '')
        setStudentHandout(data.studentHandout || '')
        await handleSave(data.project, data.studentHandout)
        scrollToOutput()
      }
    } catch (error) {
      alert('Error generating project. Please try again.')
    }
    
    setGenerating(false)
  }

  const handleSave = async (project, handout) => {
    if (!project || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Project: ${selectedIdea?.title || 'Custom Project'}`,
          toolType: 'project-creator',
          toolName: 'Project Creator',
          content: project + '\n\n---STUDENT HANDOUT---\n\n' + handout,
          metadata: { gradeLevel, subject, projectFormat, timeAvailable },
        }),
      })
      setSaved(true)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleExportDocx = async (content, filename) => {
    if (!content) return
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: filename,
          content: content,
          toolName: 'Project Creator'
        }),
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename.replace(/\s+/g, '_')}.docx`
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

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'handout') {
      setCopiedHandout(true)
      setTimeout(() => setCopiedHandout(false), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
            <span className="text-gray-800 font-medium">Project Creator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎯</span>
                <h1 className="text-2xl font-semibold text-gray-800">Project Creator</h1>
              </div>
              <p className="text-gray-500">Generate creative project ideas and complete project packets from your lessons.</p>
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
                  <p className="text-purple-600 text-sm">Example: 5th Grade Water Cycle unit → Generate project ideas!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Lesson Information</h2>
              
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
                    {['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Health', 'Foreign Language', 'Computer Science'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Content *</label>
                <textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} 
                  placeholder="Paste or describe the lesson/unit you taught. Include key concepts, vocabulary, skills covered..."
                  rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
                <textarea value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} 
                  placeholder="What should students know or be able to do after this lesson?"
                  rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How Should Students Demonstrate Learning?</label>
                <textarea value={demonstrationMethod} onChange={(e) => setDemonstrationMethod(e.target.value)} 
                  placeholder="e.g., Explain concepts in their own words, apply skills to new situations, create something that shows understanding..."
                  rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>
            </div>

            {/* Project Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Preferences</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Format</label>
                  <select value={projectFormat} onChange={(e) => setProjectFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="individual">Individual</option>
                    <option value="pairs">Pairs</option>
                    <option value="small-groups">Small Groups (3-4)</option>
                    <option value="large-groups">Large Groups (5+)</option>
                    <option value="flexible">Flexible (student choice)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Available</label>
                  <select value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700">
                    <option value="1-2 days">1-2 Days</option>
                    <option value="3-4 days">3-4 Days</option>
                    <option value="1 week">1 Week</option>
                    <option value="2 weeks">2 Weeks</option>
                    <option value="3-4 weeks">3-4 Weeks</option>
                    <option value="ongoing">Ongoing/Semester</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials Available</label>
                <textarea value={materialsAvailable} onChange={(e) => setMaterialsAvailable(e.target.value)} 
                  placeholder="e.g., Chromebooks, art supplies, poster board, craft materials, library access, printer..."
                  rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Differentiation Needs (Optional)</label>
                <textarea value={differentiationNeeds} onChange={(e) => setDifferentiationNeeds(e.target.value)} 
                  placeholder="ELL students, IEP accommodations, gifted learners, specific student needs..."
                  rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 resize-none" />
              </div>

              {/* Project Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Project Types (Optional)</label>
                <p className="text-xs text-gray-500 mb-3">Select types you'd like ideas for, or leave blank for AI to suggest based on your lesson.</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                  {projectTypeOptions.map(type => (
                    <label key={type.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm ${preferredProjectTypes.includes(type.id) ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-100 hover:bg-gray-50'} border`}>
                      <input 
                        type="checkbox" 
                        checked={preferredProjectTypes.includes(type.id)}
                        onChange={() => handleProjectTypeToggle(type.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" 
                      />
                      <span className="text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
                {preferredProjectTypes.length > 0 && (
                  <p className="text-xs text-purple-600 mt-2">{preferredProjectTypes.length} types selected</p>
                )}
              </div>
            </div>

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <button onClick={handleGenerateIdeas} disabled={generating || !lessonContent}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                {generating && mode === 'ideas' ? (
                  <><span className="animate-spin">⏳</span>Generating Ideas...</>
                ) : (
                  <><span>💡</span>Generate Project Ideas</>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Output */}
          <div ref={outputRef} className="space-y-6">
            {/* Ideas Output */}
            {generatedIdeas.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">💡 Project Ideas</h2>
                <p className="text-sm text-gray-500 mb-4">Click on an idea to select it, then generate the full project.</p>
                
                <div className="space-y-3 mb-4">
                  {generatedIdeas.map((idea, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectIdea(idea)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedIdea?.title === idea.title 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{idea.icon || '📋'}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{idea.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                          <p className="text-xs text-purple-600 mt-2">💡 {idea.whyItWorks}</p>
                        </div>
                        {selectedIdea?.title === idea.title && (
                          <span className="text-purple-600 text-xl">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedIdea && (
                  <button onClick={() => handleGenerateFullProject()} disabled={generating}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {generating && mode === 'full' ? (
                      <><span className="animate-spin">⏳</span>Generating Full Project...</>
                    ) : (
                      <><span>🚀</span>Generate Full Project: {selectedIdea.title}</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Full Project Output */}
            {generatedProject && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">Generated Project</h2>
                    {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Saved</span>}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => setActiveTab('project')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'project' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    📋 Teacher Project Plan
                  </button>
                  <button 
                    onClick={() => setActiveTab('handout')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'handout' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    📄 Student Handout
                  </button>
                </div>

                {activeTab === 'project' && (
                  <>
                    <div className="flex gap-2 mb-4">
                      <button onClick={() => handleCopy(generatedProject, 'project')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                      <button onClick={() => handleExportDocx(generatedProject, `Project_${selectedIdea?.title || 'Plan'}`)} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                        {exporting ? 'Exporting...' : '📄 Export .docx'}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{generatedProject}</pre>
                    </div>
                  </>
                )}

                {activeTab === 'handout' && studentHandout && (
                  <>
                    <div className="flex gap-2 mb-4">
                      <button onClick={() => handleCopy(studentHandout, 'handout')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        {copiedHandout ? '✓ Copied!' : '📋 Copy'}
                      </button>
                      <button onClick={() => handleExportDocx(studentHandout, `Student_Handout_${selectedIdea?.title || 'Project'}`)} disabled={exporting} className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-purple-300">
                        {exporting ? 'Exporting...' : '📄 Export .docx'}
                      </button>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 max-h-[500px] overflow-y-auto">
                      <p className="text-xs text-blue-600 mb-3">🎓 This handout is ready to print and give to students!</p>
                      <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">{studentHandout}</pre>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Empty State */}
            {generatedIdeas.length === 0 && !generatedProject && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to create projects!</h3>
                  <p className="text-gray-400">Enter your lesson details and click "Generate Project Ideas"</p>
                  <div className="mt-6 text-left max-w-md mx-auto bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">How it works:</p>
                    <ol className="text-sm text-gray-500 space-y-1">
                      <li>1️⃣ Enter your lesson content</li>
                      <li>2️⃣ Set preferences (time, format, materials)</li>
                      <li>3️⃣ Generate 5-6 project ideas</li>
                      <li>4️⃣ Select your favorite idea</li>
                      <li>5️⃣ Generate full project + student handout</li>
                    </ol>
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