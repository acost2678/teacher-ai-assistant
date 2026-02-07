'use client'

import { useState } from 'react'

export default function TranslateOutput({ content, onTranslated }) {
  const [translating, setTranslating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('spanish')
  const [translatedContent, setTranslatedContent] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [copied, setCopied] = useState(false)

  const languages = [
    { id: 'spanish', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { id: 'chinese', label: 'Chinese (Simplified)', native: '中文', flag: '🇨🇳' },
    { id: 'vietnamese', label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    { id: 'arabic', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { id: 'french', label: 'French', native: 'Français', flag: '🇫🇷' },
    { id: 'portuguese', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
    { id: 'korean', label: 'Korean', native: '한국어', flag: '🇰🇷' },
    { id: 'tagalog', label: 'Tagalog', native: 'Tagalog', flag: '🇵🇭' },
    { id: 'russian', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { id: 'haitian-creole', label: 'Haitian Creole', native: 'Kreyòl Ayisyen', flag: '🇭🇹' },
    { id: 'german', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { id: 'japanese', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { id: 'hindi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { id: 'urdu', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
    { id: 'somali', label: 'Somali', native: 'Soomaali', flag: '🇸🇴' },
  ]

  const handleTranslate = async () => {
    if (!content) return
    
    setTranslating(true)
    setTranslatedContent(null)
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          targetLanguage: selectedLanguage
        }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        alert('Translation error: ' + data.error)
      } else {
        setTranslatedContent(data.translatedContent)
        setShowTranslation(true)
        if (onTranslated) {
          onTranslated(data.translatedContent)
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
      alert('Failed to translate. Please try again.')
    }
    
    setTranslating(false)
  }

  const handleCopy = () => {
    if (translatedContent) {
      navigator.clipboard.writeText(translatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExport = async (format) => {
    if (!translatedContent) return
    
    try {
      const langLabel = languages.find(l => l.id === selectedLanguage)?.label || selectedLanguage
      const endpoint = format === 'pdf' ? '/api/export-pdf' : '/api/export-docx'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Document (${langLabel})`,
          content: translatedContent,
          toolName: 'Teacher AI Assistant'
        }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `translated_${selectedLanguage}.${format === 'pdf' ? 'pdf' : 'docx'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert(`Failed to export as ${format.toUpperCase()}`)
    }
  }

  const selectedLang = languages.find(l => l.id === selectedLanguage)

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🌐</span>
        <h3 className="font-medium text-gray-700">Translate for ELL Families</h3>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Select Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value)
                setTranslatedContent(null)
                setShowTranslation(false)
              }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.label} ({lang.native})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleTranslate}
              disabled={translating || !content}
              className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              {translating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Translating...
                </>
              ) : (
                <>
                  <span>🌍</span>
                  Translate to {selectedLang?.label}
                </>
              )}
            </button>
          </div>
        </div>

        {showTranslation && translatedContent && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span>{selectedLang?.flag}</span>
                Translated to {selectedLang?.label}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1"
                >
                  📄 Word
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1"
                >
                  📑 PDF
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{translatedContent}</pre>
            </div>
          </div>
        )}
        
        {!showTranslation && (
          <p className="text-xs text-gray-500 mt-3">
            💡 Translate your output to send to ELL families in their preferred language
          </p>
        )}
      </div>
    </div>
  )
}