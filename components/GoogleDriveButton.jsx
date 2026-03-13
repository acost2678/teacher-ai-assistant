'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function GoogleDriveButton({ title, content, toolName, className = '' }) {
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [docUrl, setDocUrl] = useState(null)
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const isConnected = status === 'authenticated' && session?.accessToken
  const isLoading = status === 'loading'

  const handleSaveToDrive = async () => {
    if (!content) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const response = await fetch('/api/save-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, toolName }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSaved(true)
        setDocUrl(data.docUrl)
      }
    } catch {
      setError('Failed to save to Google Drive.')
    }

    setSaving(false)
  }

  const handleConnect = () => {
    signIn('google', { callbackUrl: window.location.href })
  }

  const handleDisconnect = () => {
    signOut({ redirect: false })
    setShowDropdown(false)
    setSaved(false)
    setDocUrl(null)
  }

  if (isLoading) {
    return (
      <button disabled className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium ${className}`}>
        <GoogleIcon />
        Loading...
      </button>
    )
  }

  // Not connected — show Connect button
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-all ${className}`}
      >
        <GoogleIcon />
        Save to Google Drive
      </button>
    )
  }

  // Connected — show save button or saved state
  return (
    <div className="relative">
      {saved && docUrl ? (
        <div className="flex items-center gap-2">
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            <span>✓</span>
            Open in Google Docs
          </a>
          <button
            onClick={handleSaveToDrive}
            className="px-3 py-2 text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Save again"
          >
            ↺
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveToDrive}
            disabled={saving || !content}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 disabled:opacity-40 rounded-lg text-sm font-medium transition-all ${className}`}
          >
            <GoogleIcon />
            {saving ? 'Saving...' : 'Save to Google Drive'}
          </button>
          {/* Connected indicator + disconnect option */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 px-2 py-2 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title={`Connected as ${session?.user?.email}`}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50 w-56">
                <p className="text-xs text-gray-500 mb-1">Connected as</p>
                <p className="text-sm font-medium text-gray-800 truncate mb-3">{session?.user?.email}</p>
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors"
                >
                  Disconnect Google
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}