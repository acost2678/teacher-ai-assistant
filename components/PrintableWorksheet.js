'use client'

import { useState, useRef } from 'react'

export default function PrintableWorksheet({ 
  title = 'Worksheet',
  subtitle = '',
  gradeLevel = '',
  content = '',
  includeAnswerKey = false,
  answerKeyContent = '',
  showNameDate = true,
  showClassPeriod = true,
  extraSpacing = false,
  dyslexiaFriendly = false
}) {
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef(null)

  const handlePrint = () => {
    const printContent = printRef.current
    const printWindow = window.open('', '', 'width=800,height=600')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const getPrintStyles = () => `
    @page {
      size: letter;
      margin: 0.6in;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: ${dyslexiaFriendly ? "'OpenDyslexic', 'Comic Sans MS', sans-serif" : "'Arial', 'Helvetica', sans-serif"};
      font-size: ${dyslexiaFriendly ? '13pt' : '11pt'};
      line-height: ${dyslexiaFriendly ? '1.8' : '1.5'};
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    
    .worksheet-container {
      max-width: 100%;
    }
    
    .worksheet-header {
      border-bottom: 3px solid #000;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    
    .worksheet-title {
      font-size: ${dyslexiaFriendly ? '22pt' : '20pt'};
      font-weight: bold;
      text-align: center;
      margin: 0 0 4px 0;
    }
    
    .worksheet-subtitle {
      font-size: ${dyslexiaFriendly ? '12pt' : '11pt'};
      text-align: center;
      color: #333;
      margin: 0 0 4px 0;
    }
    
    .worksheet-grade {
      font-size: 10pt;
      text-align: center;
      color: #555;
      margin: 0 0 12px 0;
    }
    
    .worksheet-info {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 12px;
    }
    
    .info-field {
      flex: 1;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    
    .info-label {
      font-weight: bold;
      white-space: nowrap;
    }
    
    .info-line {
      flex: 1;
      border-bottom: 1.5px solid #000;
      min-width: 80px;
      height: 20px;
    }
    
    /* Content Styles */
    .worksheet-content {
      margin-top: 16px;
    }
    
    .worksheet-content h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 20px 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 2px solid #333;
    }
    
    .worksheet-content h2 {
      font-size: 15pt;
      font-weight: bold;
      margin: 18px 0 10px 0;
      padding: 8px 12px;
      background: #f0f0f0;
      border-left: 4px solid #333;
    }
    
    .worksheet-content h3 {
      font-size: 13pt;
      font-weight: bold;
      margin: 14px 0 8px 0;
      color: #222;
    }
    
    .worksheet-content h4 {
      font-size: 12pt;
      font-weight: bold;
      margin: 12px 0 6px 0;
    }
    
    .worksheet-content p {
      margin: 8px 0;
    }
    
    .worksheet-content ul, .worksheet-content ol {
      margin: 8px 0 8px 24px;
      padding: 0;
    }
    
    .worksheet-content li {
      margin: 6px 0;
    }
    
    .worksheet-content strong {
      font-weight: bold;
    }
    
    .worksheet-content em {
      font-style: italic;
    }
    
    /* Tables */
    .worksheet-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }
    
    .worksheet-content th, .worksheet-content td {
      border: 1px solid #333;
      padding: 8px 12px;
      text-align: left;
    }
    
    .worksheet-content th {
      background: #e8e8e8;
      font-weight: bold;
    }
    
    /* Fill-in blanks */
    .blank-line {
      display: inline-block;
      min-width: 150px;
      border-bottom: 1.5px solid #000;
      margin: 0 4px;
    }
    
    .blank-line-long {
      display: block;
      width: 100%;
      border-bottom: 1.5px solid #000;
      height: ${extraSpacing ? '28px' : '22px'};
      margin: 6px 0;
    }
    
    /* Checkbox items */
    .checkbox-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 8px 0;
    }
    
    .checkbox-box {
      width: 16px;
      height: 16px;
      border: 2px solid #333;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    /* Sections with boxes */
    .section-box {
      border: 2px solid #333;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      background: #fafafa;
    }
    
    .section-box-title {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #ccc;
    }
    
    /* Response areas */
    .response-box {
      border: 1.5px solid #999;
      min-height: ${extraSpacing ? '80px' : '50px'};
      margin: 8px 0;
      border-radius: 4px;
    }
    
    .response-lines {
      margin: 8px 0;
    }
    
    .response-line {
      border-bottom: 1px solid #999;
      height: ${extraSpacing ? '28px' : '22px'};
      margin: 4px 0;
    }
    
    /* Emoji scale */
    .emoji-scale {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 12px 0;
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    
    .emoji-scale-item {
      text-align: center;
    }
    
    .emoji-scale-item .emoji {
      font-size: 20pt;
    }
    
    /* Numbered items */
    .numbered-item {
      display: flex;
      gap: 8px;
      margin: 10px 0;
    }
    
    .item-number {
      font-weight: bold;
      min-width: 24px;
    }
    
    .item-content {
      flex: 1;
    }
    
    /* Code/preformatted blocks (for body diagrams etc) */
    .pre-block {
      font-family: monospace;
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
      white-space: pre-wrap;
      font-size: 10pt;
    }
    
    /* Word bank */
    .word-bank {
      border: 2px solid #333;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 16px 0;
      background: #fafafa;
    }
    
    .word-bank-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .word-bank-words {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px 24px;
    }
    
    .word-bank-word {
      padding: 4px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
    }
    
    /* Horizontal rule */
    hr {
      border: none;
      border-top: 2px solid #333;
      margin: 16px 0;
    }
    
    /* Footer */
    .worksheet-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    
    /* Answer Key */
    .answer-key {
      page-break-before: always;
      border: 2px solid #333;
      padding: 16px;
      margin-top: 30px;
    }
    
    .answer-key-title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #333;
    }
    
    @media print {
      .no-print {
        display: none !important;
      }
    }
  `

  // Convert markdown-style content to formatted HTML
  const formatContentToHTML = (rawContent) => {
    if (!rawContent) return ''
    
    let html = rawContent
    
    // Escape HTML entities first
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Process headers (must do before other processing)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
    
    // Process bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Process horizontal rules
    html = html.replace(/^---+$/gm, '<hr />')
    
    // Process checkboxes
    html = html.replace(/^□ (.+)$/gm, '<div class="checkbox-item"><div class="checkbox-box"></div><span>$1</span></div>')
    html = html.replace(/^\[[ x]?\] (.+)$/gm, '<div class="checkbox-item"><div class="checkbox-box"></div><span>$1</span></div>')
    
    // Process tables
    html = processMarkdownTables(html)
    
    // Process code blocks (for body diagrams, etc)
    html = html.replace(/```[\s\S]*?```/g, (match) => {
      const content = match.replace(/```/g, '').trim()
      return `<div class="pre-block">${content}</div>`
    })
    
    // Process fill-in blanks (multiple underscores)
    html = html.replace(/_{5,}/g, '<span class="blank-line">&nbsp;</span>')
    html = html.replace(/_+: /g, '<span class="blank-line">&nbsp;</span>: ')
    
    // Process numbered items with blanks
    html = html.replace(/^(\d+)\. (.+)$/gm, (match, num, content) => {
      const formattedContent = content.replace(/_{3,}/g, '<span class="blank-line">&nbsp;</span>')
      return `<div class="numbered-item"><span class="item-number">${num}.</span><span class="item-content">${formattedContent}</span></div>`
    })
    
    // Process bullet points
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    
    // Process emoji scales (simple detection)
    if (html.includes('😌') && html.includes('😰')) {
      html = html.replace(/(😌.*?😰)/g, '<div class="emoji-scale">$1</div>')
    }
    
    // Convert remaining newlines to proper spacing
    html = html.replace(/\n\n+/g, '</p><p>')
    html = html.replace(/\n/g, '<br />')
    
    // Wrap in paragraph if not starting with a block element
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>'
    }
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>\s*<(h[1-4]|ul|ol|div|hr|table)/g, '<$1')
    html = html.replace(/<\/(h[1-4]|ul|ol|div|hr|table)>\s*<\/p>/g, '</$1>')
    
    return html
  }

  // Process markdown tables
  const processMarkdownTables = (text) => {
    const tableRegex = /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g
    
    return text.replace(tableRegex, (match, headerRow, bodyRows) => {
      const headers = headerRow.split('|').map(h => h.trim()).filter(h => h)
      const rows = bodyRows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      )
      
      let tableHTML = '<table><thead><tr>'
      headers.forEach(h => {
        tableHTML += `<th>${h}</th>`
      })
      tableHTML += '</tr></thead><tbody>'
      
      rows.forEach(row => {
        tableHTML += '<tr>'
        row.forEach(cell => {
          // Handle blank cells with underscores
          const formattedCell = cell.replace(/_{3,}/g, '<span class="blank-line">&nbsp;</span>')
          tableHTML += `<td>${formattedCell || '&nbsp;'}</td>`
        })
        tableHTML += '</tr>'
      })
      
      tableHTML += '</tbody></table>'
      return tableHTML
    })
  }

  const formattedContent = formatContentToHTML(content)

  return (
    <div className="mt-6">
      {/* Preview/Print Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🖨️</span>
          <div>
            <h3 className="font-semibold text-gray-800">Print-Ready Worksheet</h3>
            <p className="text-sm text-gray-500">Professional formatting for classroom use</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              showPreview 
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-300'
            }`}
          >
            {showPreview ? '📝 Hide Preview' : '👁️ Show Preview'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>🖨️</span> Print Worksheet
          </button>
        </div>
      </div>

      {/* Print Preview */}
      {showPreview && (
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg">
          <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 flex items-center justify-between border-b">
            <span>📄 Print Preview</span>
            <span className="text-xs bg-white px-2 py-1 rounded">8.5" × 11" Letter</span>
          </div>
          
          <div 
            ref={printRef}
            className="p-8 bg-white overflow-auto max-h-[600px]"
            style={{ 
              fontFamily: dyslexiaFriendly ? "'Comic Sans MS', sans-serif" : "'Arial', sans-serif",
              fontSize: dyslexiaFriendly ? '13pt' : '11pt',
              lineHeight: dyslexiaFriendly ? '1.8' : '1.5'
            }}
          >
            <div className="worksheet-container">
              {/* Header */}
              <div style={{ borderBottom: '3px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: dyslexiaFriendly ? '22pt' : '20pt', fontWeight: 'bold', textAlign: 'center', margin: '0 0 4px 0' }}>
                  {title}
                </div>
                {subtitle && (
                  <div style={{ fontSize: '11pt', textAlign: 'center', color: '#333', margin: '0 0 4px 0' }}>
                    {subtitle}
                  </div>
                )}
                {gradeLevel && (
                  <div style={{ fontSize: '10pt', textAlign: 'center', color: '#555', margin: '0 0 12px 0' }}>
                    {gradeLevel}
                  </div>
                )}
                
                {(showNameDate || showClassPeriod) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '12px' }}>
                    {showNameDate && (
                      <>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>Name:</span>
                          <span style={{ flex: 1, borderBottom: '1.5px solid #000', height: '20px' }}></span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>Date:</span>
                          <span style={{ flex: 1, borderBottom: '1.5px solid #000', height: '20px' }}></span>
                        </div>
                      </>
                    )}
                    {showClassPeriod && (
                      <div style={{ flex: 0.7, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>Period:</span>
                        <span style={{ flex: 1, borderBottom: '1.5px solid #000', height: '20px' }}></span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Formatted Content */}
              <div 
                className="worksheet-content"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
                style={{
                  '--extra-spacing': extraSpacing ? '1' : '0'
                }}
              />

              {/* Footer */}
              <div style={{ 
                marginTop: '24px', 
                paddingTop: '10px', 
                borderTop: '1px solid #ccc', 
                fontSize: '9pt', 
                color: '#666',
                textAlign: 'center'
              }}>
                Created with Teacher AI Assistant • {new Date().toLocaleDateString()}
              </div>

              {/* Answer Key (on new page) */}
              {includeAnswerKey && answerKeyContent && (
                <div style={{ pageBreakBefore: 'always', border: '2px solid #333', padding: '16px', marginTop: '30px' }}>
                  <div style={{ fontSize: '16pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #333' }}>
                    📋 Answer Key - {title}
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatContentToHTML(answerKeyContent) }}
                    style={{ fontSize: '10pt' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}