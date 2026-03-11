'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const PAGE_TYPES = [
  { id: 'SEL & Emotions', emoji: '💛', desc: 'Feelings, mindfulness, growth mindset' },
  { id: 'Academic Content', emoji: '📚', desc: 'Math, science, reading, social studies' },
  { id: 'Holiday & Seasonal', emoji: '🎄', desc: 'Holidays, seasons, special events' },
  { id: 'Classroom Community', emoji: '🏫', desc: 'Rules, kindness, teamwork, belonging' },
  { id: 'Student Choice / Custom', emoji: '⭐', desc: 'Student picks their own topic' },
]

const SEL_THEMES = [
  'Feeling Happy', 'Feeling Calm', 'Feeling Brave', 'Growth Mindset',
  'Kindness', 'Gratitude', 'Deep Breathing', 'I Am Enough',
  'Making Friends', 'Solving Problems', 'Self-Control', 'Empathy',
]

const ACADEMIC_THEMES = [
  'Addition & Subtraction', 'Multiplication', 'Fractions', 'Shapes & Geometry',
  'The Water Cycle', 'Life Cycle of a Butterfly', 'Solar System', 'Food Chain',
  'Community Helpers', 'American Symbols', 'Parts of a Plant', 'Animal Habitats',
]

const HOLIDAY_THEMES = [
  'Back to School', 'Fall & Autumn', 'Halloween', 'Thanksgiving',
  'Winter Holidays', 'New Year', 'Valentine\'s Day', 'St. Patrick\'s Day',
  'Spring', 'Earth Day', 'Mother\'s Day', 'End of Year',
]

const COMMUNITY_THEMES = [
  'Classroom Rules', 'Being a Good Friend', 'Helping Others',
  'Our Class Family', 'Respect', 'Responsibility', 'Anti-Bullying',
  'We Are All Different', 'Working Together', 'School Pride',
]

function getThemesForType(pageType) {
  if (pageType === 'SEL & Emotions') return SEL_THEMES
  if (pageType === 'Academic Content') return ACADEMIC_THEMES
  if (pageType === 'Holiday & Seasonal') return HOLIDAY_THEMES
  if (pageType === 'Classroom Community') return COMMUNITY_THEMES
  return []
}

export default function ColoringPageGenerator() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [gradeLevel, setGradeLevel] = useState('Elementary (1–5)')
  const [pageType, setPageType] = useState('SEL & Emotions')
  const [selectedTheme, setSelectedTheme] = useState('Feeling Happy')
  const [customTopic, setCustomTopic] = useState('')
  const [complexity, setComplexity] = useState('simple')
  const [includeTitle, setIncludeTitle] = useState(true)
  const [includeInstructions, setIncludeInstructions] = useState(true)

  const [generatedImage, setGeneratedImage] = useState(null)
  const [pageTitle, setPageTitle] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('input')
  const [showDemo, setShowDemo] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const isCustom = pageType === 'Student Choice / Custom'
  const themes = getThemesForType(pageType)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) { setUser(session.user); setLoading(false) }
      else { router.push('/auth/login') }
    }
    checkSession()
  }, [router])

  // Reset theme when page type changes
  useEffect(() => {
    if (!isCustom && themes.length > 0) {
      setSelectedTheme(themes[0])
    }
    setCustomTopic('')
  }, [pageType])

  const handleShowDemo = () => {
    setGradeLevel('Pre-K / Kindergarten')
    setPageType('SEL & Emotions')
    setSelectedTheme('Feeling Happy')
    setComplexity('simple')
    setIncludeTitle(true)
    setIncludeInstructions(true)
    setShowDemo(true)
    setGeneratedImage(null)
    setActiveTab('input')
  }

  const handleResetDemo = () => {
    setGradeLevel('Elementary (1–5)')
    setPageType('SEL & Emotions')
    setSelectedTheme('Feeling Happy')
    setCustomTopic('')
    setComplexity('simple')
    setIncludeTitle(true)
    setIncludeInstructions(true)
    setShowDemo(false)
    setGeneratedImage(null)
    setActiveTab('input')
  }

  const handleGenerate = async () => {
    const topic = isCustom ? customTopic : selectedTheme
    if (!topic.trim()) { setError('Please enter a topic'); return }

    setGenerating(true)
    setGeneratedImage(null)
    setSaved(false)
    setError('')

    try {
      const response = await fetch('/api/generate-coloring-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          pageType,
          theme: isCustom ? null : selectedTheme,
          customTopic: isCustom ? customTopic : null,
          complexity,
          includeTitle,
          includeInstructions,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setGeneratedImage(data.imageUrl)
        setPageTitle(data.pageTitle)
        await handleSave(data.imageUrl, data.pageTitle)
        setActiveTab('output')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }

    setGenerating(false)
  }

  const handleSave = async (imageUrl, title) => {
    if (!imageUrl || !user) return
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: title || 'Coloring Page',
          toolType: 'coloring-page',
          toolName: 'Coloring Page Generator',
          content: imageUrl,
          metadata: { gradeLevel, pageType, complexity },
        }),
      })
      setSaved(true)
    } catch { console.error('Error saving') }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    const a = document.createElement('a')
    a.href = generatedImage
    a.download = `Coloring_Page_${pageTitle.replace(/[^a-z0-9]/gi, '_')}.png`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageTitle}</title>
          <style>
            @page { margin: 0.5in; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${generatedImage}" alt="${pageTitle}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Tools</button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800 font-medium">Coloring Page Generator</span>
          </div>
          <div className="flex gap-2">
            {!showDemo ? (
              <button onClick={handleShowDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">✨ See Demo</button>
            ) : (
              <button onClick={handleResetDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">↺ Reset</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎨</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Coloring Page Generator</h1>
              <p className="text-gray-500 text-sm mt-1">Generate print-ready coloring pages for SEL lessons, academic content, holidays, and classroom community building.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">⚡ Powered by DALL-E 3</span>
            <span>~$0.04 per image</span>
            <span>•</span>
            <span>1024×1024px printable quality</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('input')} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'input' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>1. Page Details</button>
          <button onClick={() => setActiveTab('output')} disabled={!generatedImage} className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${activeTab === 'output' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 disabled:opacity-40'}`}>2. Generated Page</button>
        </div>

        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Grade level */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Grade Level</h2>
              <div className="flex gap-3">
                {['Pre-K / Kindergarten', 'Elementary (1–5)'].map(g => (
                  <button key={g} onClick={() => setGradeLevel(g)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${gradeLevel === g ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                    {g === 'Pre-K / Kindergarten' ? '🌱 ' : '📖 '}{g}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {gradeLevel === 'Pre-K / Kindergarten'
                  ? 'Extra thick outlines, very simple shapes, large coloring areas'
                  : 'Clear outlines, moderate detail suitable for grades 1–5'}
              </p>
            </div>

            {/* Page type */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Type</h2>
              <div className="grid grid-cols-1 gap-2">
                {PAGE_TYPES.map(({ id, emoji, desc }) => (
                  <button key={id} onClick={() => setPageType(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${pageType === id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    <span className="text-xl">{emoji}</span>
                    <div>
                      <p className={`font-medium text-sm ${pageType === id ? 'text-purple-700' : 'text-gray-700'}`}>{id}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    {pageType === id && <span className="ml-auto text-purple-500 text-sm">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme / Topic */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {isCustom ? 'Student\'s Topic' : 'Choose a Theme'}
              </h2>

              {isCustom ? (
                <div>
                  <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g., dinosaurs, unicorns, soccer, outer space, favorite animal..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 text-sm" />
                  <p className="text-xs text-gray-400 mt-2">Students can choose anything they love — the generator creates an age-appropriate coloring page.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {themes.map(t => (
                    <button key={t} onClick={() => setSelectedTheme(t)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${selectedTheme === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Complexity + options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Complexity & Options</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">Line Complexity</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'simple', label: 'Simple', desc: 'Large shapes, thick lines', emoji: '🟡' },
                    { id: 'medium', label: 'Medium', desc: 'More detail, patterns', emoji: '🔶' },
                    { id: 'detailed', label: 'Detailed', desc: 'Intricate, fine lines', emoji: '🔷' },
                  ].map(({ id, label, desc, emoji }) => (
                    <button key={id} onClick={() => setComplexity(id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${complexity === id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      <div className="text-xl mb-1">{emoji}</div>
                      <div className={`font-medium text-sm ${complexity === id ? 'text-purple-700' : 'text-gray-700'}`}>{label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { state: includeTitle, setter: setIncludeTitle, label: 'Include title text', desc: 'Adds the theme name as a title at the top of the page' },
                  { state: includeInstructions, setter: setIncludeInstructions, label: 'Include "Color Me!" label', desc: 'Adds a small instruction label at the bottom' },
                ].map(({ state, setter, label, desc }) => (
                  <label key={label} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <div>
                      <span className="text-gray-700 font-medium text-sm">{label}</span>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
            )}

            <button onClick={handleGenerate} disabled={generating || (isCustom && !customTopic.trim())}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 text-base">
              {generating ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating — this takes about 10 seconds...
                </>
              ) : (
                <><span>🎨</span> Generate Coloring Page</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">Each generation uses DALL-E 3 (~$0.04). Images are unique every time.</p>
          </div>
        )}

        {activeTab === 'output' && generatedImage && (
          <div className="space-y-6">
            {/* Action bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 text-sm">{gradeLevel} · {pageType} · {complexity} complexity</p>
                    {saved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Saved</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors text-sm">
                    🖨️ Print
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm">
                    ⬇️ Download PNG
                  </button>
                </div>
              </div>
            </div>

            {/* Image preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: '500px' }}>
                <img src={generatedImage} alt={pageTitle} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" style={{ maxHeight: '700px' }} />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">1024×1024px · Print at full size on 8.5×11" paper for best results</p>
            </div>

            {/* Generate another */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-1">Want a different version?</h3>
              <p className="text-sm text-gray-500 mb-4">Each generation creates a unique image. Click below to generate another with the same settings.</p>
              <div className="flex gap-3">
                <button onClick={handleGenerate} disabled={generating}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm">
                  {generating ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</> : '🎲 Generate Another'}
                </button>
                <button onClick={() => setActiveTab('input')}
                  className="px-5 py-2 border border-gray-200 text-gray-600 hover:border-purple-300 rounded-lg font-medium transition-colors text-sm">
                  ← Change Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}