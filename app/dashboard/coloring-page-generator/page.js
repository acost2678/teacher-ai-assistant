'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function ColoringPageGeneratorPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // Mode: 'upload' or 'generate'
  const [mode, setMode] = useState('generate')
  
  // Upload mode
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedPreview, setUploadedPreview] = useState(null)
  const [processingFile, setProcessingFile] = useState(false)
  const fileInputRef = useRef(null)
  
  // Generate mode
  const [subject, setSubject] = useState('')
  const [theme, setTheme] = useState('')
  const [ageGroup, setAgeGroup] = useState('elementary')
  const [complexity, setComplexity] = useState('medium')
  const [includeText, setIncludeText] = useState(false)
  const [customText, setCustomText] = useState('')
  
  // Style options
  const [lineThickness, setLineThickness] = useState('medium')
  const [style, setStyle] = useState('cartoon')
  
  const router = useRouter()

  const themeOptions = [
    { id: 'animals', label: 'Animals', icon: '🐾' },
    { id: 'nature', label: 'Nature & Plants', icon: '🌿' },
    { id: 'space', label: 'Space & Planets', icon: '🚀' },
    { id: 'ocean', label: 'Ocean & Sea Life', icon: '🐠' },
    { id: 'dinosaurs', label: 'Dinosaurs', icon: '🦕' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { id: 'fantasy', label: 'Fantasy & Magic', icon: '🧙' },
    { id: 'food', label: 'Food & Treats', icon: '🍕' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'holidays', label: 'Holidays', icon: '🎄' },
    { id: 'seasons', label: 'Seasons', icon: '🍂' },
    { id: 'community', label: 'Community Helpers', icon: '👨‍🚒' },
    { id: 'shapes', label: 'Shapes & Patterns', icon: '🔷' },
    { id: 'letters', label: 'Letters & Numbers', icon: '🔤' },
    { id: 'fairytales', label: 'Fairy Tales', icon: '👸' },
    { id: 'custom', label: 'Custom Topic', icon: '✨' },
  ]

  const styleOptions = [
    { id: 'cartoon', label: 'Cartoon/Simple', description: 'Bold outlines, simple shapes' },
    { id: 'realistic', label: 'Semi-Realistic', description: 'More detailed, natural look' },
    { id: 'mandala', label: 'Mandala/Pattern', description: 'Symmetrical patterns' },
    { id: 'doodle', label: 'Doodle Style', description: 'Fun, hand-drawn look' },
  ]

  const ageGroupOptions = [
    { id: 'toddler', label: 'Toddler (2-3)', description: 'Very simple, large shapes' },
    { id: 'preschool', label: 'Pre-K (3-5)', description: 'Simple with some detail' },
    { id: 'elementary', label: 'Elementary (5-10)', description: 'Moderate detail' },
    { id: 'tween', label: 'Tween+ (10+)', description: 'More complex designs' },
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

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)')
      return
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    
    setUploadedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedPreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    setUploadedPreview(null)
    setGeneratedImage(null)
  }

  const handleShowDemo = () => {
    setMode('generate')
    setSubject('a friendly dinosaur playing in a prehistoric jungle')
    setTheme('dinosaurs')
    setAgeGroup('elementary')
    setComplexity('medium')
    setStyle('cartoon')
    setLineThickness('medium')
    setIncludeText(true)
    setCustomText('Dino Fun!')
    setShowDemo(true)
  }

  const handleResetDemo = () => {
    setMode('generate')
    setSubject('')
    setTheme('')
    setAgeGroup('elementary')
    setComplexity('medium')
    setStyle('cartoon')
    setLineThickness('medium')
    setIncludeText(false)
    setCustomText('')
    setUploadedFile(null)
    setUploadedPreview(null)
    setGeneratedImage(null)
    setShowDemo(false)
  }

  const handleGenerate = async () => {
    if (mode === 'generate' && !subject && !theme) {
      alert('Please enter a subject or select a theme')
      return
    }
    if (mode === 'upload' && !uploadedFile) {
      alert('Please upload an image first')
      return
    }
    
    setGenerating(true)
    setGeneratedImage(null)

    try {
      if (mode === 'upload') {
        // Convert uploaded image to coloring page
        const formData = new FormData()
        formData.append('image', uploadedFile)
        formData.append('lineThickness', lineThickness)
        formData.append('complexity', complexity)
        
        const response = await fetch('/api/coloring-page/convert', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const blob = await response.blob()
          const imageUrl = URL.createObjectURL(blob)
          setGeneratedImage(imageUrl)
        } else {
          const error = await response.json()
          alert('Error: ' + (error.error || 'Failed to convert image'))
        }
      } else {
        // Generate coloring page from description
        const response = await fetch('/api/coloring-page/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            theme,
            ageGroup,
            complexity,
            style,
            lineThickness,
            includeText,
            customText
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setGeneratedImage(data.imageUrl)
        } else {
          const error = await response.json()
          alert('Error: ' + (error.error || 'Failed to generate coloring page'))
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('Error generating coloring page. Please try again.')
    }
    
    setGenerating(false)
  }

  const handleDownload = async (format = 'png') => {
    if (!generatedImage) return
    
    setExporting(true)
    
    try {
      // For PNG, just download the image directly
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `coloring_page_${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      alert('Failed to download')
    }
    
    setExporting(false)
  }

  const handlePrint = () => {
    if (!generatedImage) return
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Coloring Page</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; }
            @media print {
              body { margin: 0; }
              img { max-width: 100%; max-height: 100%; }
            }
          </style>
        </head>
        <body>
          <img src="${generatedImage}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
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
            <span className="text-gray-800 font-medium">Coloring Page Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎨</span>
                <h1 className="text-2xl font-semibold text-gray-800">Coloring Page Generator</h1>
              </div>
              <p className="text-gray-500">Create custom coloring pages from images or AI-generated designs. Perfect for classroom activities!</p>
            </div>
            <div className="flex gap-2">
              {!showDemo ? (
                <button onClick={handleShowDemo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  <span>✨</span> See Demo
                </button>
              ) : (
                <button onClick={handleResetDemo} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <span>↺</span> Reset
                </button>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-pink-600 text-xl">📷</span>
                <div>
                  <h3 className="text-pink-800 font-medium">Upload & Convert</h3>
                  <p className="text-pink-700 text-sm">Turn any photo into a coloring page</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✨</span>
                <div>
                  <h3 className="text-purple-800 font-medium">AI Generated</h3>
                  <p className="text-purple-700 text-sm">Create from any topic or theme</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">👶</span>
                <div>
                  <h3 className="text-blue-800 font-medium">Age Appropriate</h3>
                  <p className="text-blue-700 text-sm">Adjust complexity for any grade</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('generate')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mode === 'generate' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">✨</span>
                  <span className="font-medium text-gray-800 block">Generate New</span>
                  <span className="text-sm text-gray-500">AI creates from your description</span>
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mode === 'upload' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-2">📷</span>
                  <span className="font-medium text-gray-800 block">Upload Image</span>
                  <span className="text-sm text-gray-500">Convert photo to coloring page</span>
                </button>
              </div>
            </div>

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">📷 Upload Image</h2>
                
                {!uploadedPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="text-4xl mb-3">🖼️</div>
                    <p className="text-gray-600 mb-2">Drag & drop an image or click to browse</p>
                    <p className="text-gray-400 text-sm mb-4">PNG, JPG, GIF up to 10MB</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Choose Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={uploadedPreview} 
                        alt="Uploaded preview" 
                        className="w-full rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={removeUploadedFile}
                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">✓ Image ready to convert</p>
                  </div>
                )}
              </div>
            )}

            {/* Generate Mode */}
            {mode === 'generate' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">✨ Describe Your Coloring Page</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {themeOptions.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          theme === t.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-xl block">{t.icon}</span>
                        <span className="text-xs text-gray-600">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Subject <span className="text-gray-400">(describe what you want)</span>
                  </label>
                  <textarea
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., a friendly dinosaur playing in a jungle, a rocket ship flying to the moon, a butterfly on a flower..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ageGroupOptions.map(age => (
                      <button
                        key={age.id}
                        onClick={() => setAgeGroup(age.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          ageGroup === age.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <span className="font-medium text-gray-800 block text-sm">{age.label}</span>
                        <span className="text-xs text-gray-500">{age.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Art Style</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {styleOptions.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Line Thickness</label>
                    <select
                      value={lineThickness}
                      onChange={(e) => setLineThickness(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="thin">Thin (detailed)</option>
                      <option value="medium">Medium</option>
                      <option value="thick">Thick (easy to color)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Include text/title on the page</span>
                </label>

                {includeText && (
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter text to display (e.g., 'Happy Spring!')"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || (mode === 'upload' && !uploadedFile) || (mode === 'generate' && !subject && !theme)}
              className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-purple-300 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span> 
                  {mode === 'upload' ? 'Converting...' : 'Generating...'}
                </>
              ) : (
                <>
                  <span>🎨</span> 
                  {mode === 'upload' ? 'Convert to Coloring Page' : 'Generate Coloring Page'}
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
              {generatedImage && (
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg text-sm font-medium"
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={() => handleDownload('png')}
                    disabled={exporting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-purple-300"
                  >
                    📥 Download
                  </button>
                </div>
              )}
            </div>

            {generatedImage ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <img 
                  src={generatedImage} 
                  alt="Generated coloring page" 
                  className="w-full rounded-lg bg-white"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-gray-400 mb-2">Your coloring page will appear here</p>
                <p className="text-gray-300 text-sm">
                  {mode === 'upload' 
                    ? 'Upload an image and click Convert'
                    : 'Describe what you want and click Generate'
                  }
                </p>
              </div>
            )}

            {generatedImage && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600">💡</span>
                  <div>
                    <h4 className="text-yellow-800 font-medium text-sm">Print Tips</h4>
                    <p className="text-yellow-700 text-sm">For best results, print on white cardstock paper. Use "Fit to Page" in your print settings.</p>
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