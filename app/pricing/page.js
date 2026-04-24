'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('paid') // 'paid' or 'invite'

  const VALID_INVITE_CODES = ['FOUNDING2026', 'THRIVE2026', 'TEACHERFREE']

  const handlePaidCheckout = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleInviteCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!VALID_INVITE_CODES.includes(inviteCode.toUpperCase().trim())) {
      setError('Invalid invite code. Please check and try again.')
      return
    }
    setLoading(true)
    setError('')
    router.push(`/auth/login?invite=${inviteCode.toUpperCase().trim()}&email=${encodeURIComponent(email)}`)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 960, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 24 }}>🦎</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#1C2B2D' }}>Thrive & Learn</span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#1C2B2D', lineHeight: 1.2, marginBottom: 16 }}>
            Get Full Access Today
          </h1>
          <p style={{ fontSize: 17, color: '#6B7E80', fontWeight: 300 }}>
            59 AI-powered tools designed to save teachers 5+ hours every week
          </p>
        </div>

        {/* Two options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Paid option */}
          <div style={{ background: '#007A8A', borderRadius: 24, padding: 40, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Full Access</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 56, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>$9.99</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>per month · cancel anytime</div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
              {[
                '59 AI-powered tools',
                'Unlimited document generation',
                'Export to .docx & PowerPoint',
                'Save to Google Drive',
                'FERPA-compliant design',
                'New tools added regularly',
              ].map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setMode('paid') }}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 100, border: 'none', fontSize: 14, marginBottom: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              onClick={handlePaidCheckout}
              disabled={loading && mode === 'paid'}
              style={{ width: '100%', background: 'white', color: '#007A8A', border: 'none', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              {loading && mode === 'paid' ? 'Redirecting...' : 'Get Access — $9.99/mo →'}
            </button>
          </div>

          {/* Invite code option */}
          <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '2px solid #E0F7FA' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#00B4C8', marginBottom: 16 }}>Founding Member</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 56, fontWeight: 700, lineHeight: 1, color: '#1C2B2D', marginBottom: 8 }}>Free</div>
            <div style={{ fontSize: 14, color: '#6B7E80', marginBottom: 32 }}>invite code required · founding members only</div>

            <div style={{ background: '#E0F7FA', borderRadius: 16, padding: '20px', marginBottom: 32 }}>
              <p style={{ fontSize: 14, color: '#007A8A', lineHeight: 1.6, margin: 0 }}>
                🎉 <strong>Are you a Skool community member?</strong> Enter your invite code below for free lifetime access as a founding member.
              </p>
            </div>

            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setMode('invite') }}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 100, border: '1px solid #E0F7FA', fontSize: 14, marginBottom: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#1C2B2D' }}
            />
            <input
              type="text"
               placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value); setMode('invite') }}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 100, border: '1px solid #E0F7FA', fontSize: 14, marginBottom: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', color: '#1C2B2D', textTransform: 'uppercase' }}
            />
            <button
              onClick={handleInviteCode}
              disabled={loading && mode === 'invite'}
              style={{ width: '100%', background: '#007A8A', color: 'white', border: 'none', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              {loading && mode === 'invite' ? 'Verifying...' : 'Claim Free Access →'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 20px', borderRadius: 12, marginTop: 24, textAlign: 'center', fontSize: 14 }}>
            {error}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#6B7E80' }}>
          Already have an account?{' '}
          <button onClick={() => router.push('/auth/login')} style={{ color: '#007A8A', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            Sign in here →
          </button>
        </p>
      </div>
    </div>
  )
}