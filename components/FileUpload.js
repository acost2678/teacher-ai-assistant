'use client'

import { useState } from 'react'

export default function FileUpload({ onContentExtracted, label, placeholder, helpText }) {
  const [fileName, setFileName] = useState('')
  const [extractedContent, setExtractedContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showPasteArea, setShowPasteArea] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsProcessing(true)
    setError('')
    setFileName(file.name)

    try {
      const fileType = file.type
      const fileName = file.name.toLowerCase()

      // Handle text-based files
      if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        const text = await file.text()
        setExtractedContent(text)
        onContentExtracted(text)
      }
      // Handle CSV files
      else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        const text = await file.text()
        setExtractedContent(text)
        onContentExtracted(text)
      }
      // Handle JSON files
      else if (fileType === 'application/json' || fileName.endsWith('.json')) {
        const text = await file.text()
        setExtractedContent(text)
        onContentExtracted(text)
      }
      // For PDF and DOCX, we'll show a message to use paste instead
      else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        setError(`For ${fileName.split('.').pop().toUpperCase()} files, please copy the text content and paste it below.`)
        setShowPasteArea(true)
        setFileName('')
      }
      // Unsupported file type
      else {
        setError('Please upload a .txt, .md, or .csv file. For PDF/Word docs, use the paste option below.')
        setShowPasteArea(true)
        setFileName('')
      }
    } catch (err) {
      setError('Error reading file. Please try again or paste content manually.')
      setShowPasteArea(true)
    }

    setIsProcessing(false)
  }

  const handlePasteChange = (e) => {
    const content = e.target.value
    setExtractedContent(content)
    onContentExtracted(content)
  }

  const handleClear = () => {
    setFileName('')
    setExtractedContent('')
    setError('')
    onContentExtracted('')
  }

  return (
    <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <label className="block text-gray-800 font-medium mb-2">
        📎 {label || 'Upload Reference Document'}
      </label>
      <p className="text-xs text-gray-500 mb-3">
        {helpText || 'Upload a file or paste content to help AI generate more accurate results'}
      </p>

      {/* File Upload */}
      <div className="flex items-center gap-3 mb-3">
        <label className="cursor-pointer bg-white border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-100 transition-colors">
          <span className="text-sm text-gray-700">
            {isProcessing ? 'Processing...' : 'Choose File'}
          </span>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".txt,.md,.csv,.json,.pdf,.docx,.doc"
            className="hidden"
            disabled={isProcessing}
          />
        </label>
        
        {fileName && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600">✓ {fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPasteArea(!showPasteArea)}
          className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
        >
          {showPasteArea ? 'Hide paste area' : 'Or paste content'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-amber-600 mb-3">⚠️ {error}</p>
      )}

      {/* Paste Area */}
      {showPasteArea && (
        <textarea
          value={extractedContent}
          onChange={handlePasteChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 h-32 text-sm"
          placeholder={placeholder || 'Paste document content here (from PDF, Word, etc.)...'}
        />
      )}

      {/* Content Preview */}
      {extractedContent && !showPasteArea && (
        <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-600 max-h-20 overflow-y-auto">
          <strong>Preview:</strong> {extractedContent.substring(0, 200)}
          {extractedContent.length > 200 && '...'}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Supported: .txt, .md, .csv • For PDF/Word: copy & paste content
      </p>
    </div>
  )
}