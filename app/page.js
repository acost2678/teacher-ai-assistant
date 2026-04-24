'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TOOLS = [
  { icon: '📧', name: 'Parent Emails', desc: 'Professional communications in seconds' },
  { icon: '📋', name: 'IEP & BIP Tools', desc: 'PBIS-aligned behavior & compliance docs' },
  { icon: '📊', name: 'Rubric Builder', desc: 'Standards-aligned rubrics instantly' },
  { icon: '💚', name: 'SEL Activities', desc: 'All 5 CASEL competencies covered' },
  { icon: '📖', name: 'Lesson Plans', desc: 'Differentiated, standards-aligned plans' },
  { icon: '🎓', name: 'PD Generator', desc: 'Research-based presentations with notes' },
  { icon: '📝', name: 'Progress Reports', desc: 'Batch reports for your whole class' },
  { icon: '🎨', name: 'Coloring Pages', desc: 'Custom SEL & academic coloring pages' },
  { icon: '🗡️', name: 'Quest Designer', desc: 'Gamified learning adventures' },
]

const TESTIMONIALS = [
  { quote: "I used to spend every Sunday night drowning in paperwork. Now I'm done in an hour. This tool is a lifesaver.", name: "Maria T.", role: "3rd Grade Teacher, Florida" },
  { quote: "The IEP tools alone are worth it. Writing PLOPs and measurable goals used to take me all day. Now it takes 20 minutes.", name: "James K.", role: "Special Education Teacher, Texas" },
  { quote: "As a school counselor, the SEL tools are incredibly well-designed. You can tell this was built by someone who actually works with kids.", name: "Sandra R.", role: "Elementary School Counselor, Ohio" },
]

const FEATURES = [
  '59 AI-powered tools',
  'Unlimited document generation',
  'Export to .docx & PowerPoint',
  'Save directly to Google Drive',
  'FERPA-compliant privacy design',
  'Skool community membership',
  'New tools added regularly',
  'Support from a fellow educator',
]

export default function LandingPage() {
  const router = useRouter()
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.scroll-fade').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollFadeStyle = {
    opacity: 0,
    transform: 'translateY(28px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  }

  const SKOOL_URL = 'https://www.skool.com/thriveandlearnonline'

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF7F2', color: '#1C2B2D', overflowX: 'hidden' }}>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(13,92,99,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Thrive & Learn" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 600, color: '#1C2B2D' }}>Thrive & Learn</div>
            <div style={{ fontSize: 10, color: '#6B7E80', letterSpacing: '0.5px' }}>AI TEACHER ASSISTANT</div>
          </div>
        </div>
        <button
          onClick={() => router.push('/pricing')}
          style={{ background: '#007A8A', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          Try the Teacher OS & AI Assistant
        </button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 40px 80px', position: 'relative', background: 'linear-gradient(135deg, #FAF7F2 0%, #E0F7FA 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FDF3E3', border: '1px solid rgba(212,136,30,0.2)', color: '#D4881E', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
              ✦ Built by a teacher and school counselor
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(42px, 5vw, 64px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
              Your evenings<br />
              belong to{' '}
              <em style={{ fontStyle: 'italic', color: '#007A8A' }}>you</em>,<br />
              not paperwork.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#6B7E80', marginBottom: 40, fontWeight: 300, maxWidth: 480 }}>
              59 AI-powered tools designed for teachers. Generate parent emails, IEP docs, lesson plans, SEL activities, and more — in seconds, not hours.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/pricing')}
                style={{ background: '#007A8A', color: 'white', border: 'none', padding: '16px 32px', borderRadius: 100, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 8px 32px rgba(13,92,99,0.3)' }}
              >
                Try the Teacher OS & AI Assistant →
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                style={{ color: '#007A8A', fontSize: 15, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif' }}
              >
                Already a member? Sign in ↗
              </button>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(13,92,99,0.1)' }}>
              {[['59', 'AI Tools'], ['15+', 'Languages'], ['100%', 'FERPA Safe']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: '#007A8A' }}>{num}</div>
                  <div style={{ fontSize: 13, color: '#6B7E80' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 32px 80px rgba(13,92,99,0.12)', border: '1px solid rgba(13,92,99,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, background: '#E0F7FA', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📧</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Parent Email Generated</div>
                <div style={{ fontSize: 12, color: '#6B7E80' }}>Warm & Friendly · Positive News</div>
              </div>
            </div>
            <div style={{ background: '#FAF7F2', borderRadius: 12, padding: 16, fontSize: 13, lineHeight: 1.7, color: '#1C2B2D', marginBottom: 16 }}>
              Dear [Parent Name],<br /><br />
              I wanted to reach out to share some wonderful news about [Student Name]'s recent progress. This week, [Student Name] demonstrated exceptional growth in reading comprehension and showed incredible kindness toward classmates...
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: '#E0F7FA', color: '#007A8A', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>✓ Generated in 4 seconds</span>
              <span style={{ background: '#E0F7FA', color: '#007A8A', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>🔒 FERPA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <div style={{ background: '#007A8A', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
        {[['⏱️', 'Saves 5+ hours per week'], ['🔒', 'Privacy-first design'], ['🎓', 'Built by educators, for educators'], ['☁️', 'Save directly to Google Drive']].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>
            <span style={{ fontSize: 18 }}>{icon}</span> {text}
          </div>
        ))}
      </div>

      {/* PAIN POINTS */}
      <section style={{ background: '#1C2B2D', padding: '100px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="scroll-fade" style={scrollFadeStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>The problem we're solving</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 60 }}>
              Teaching is hard enough.<br />Paperwork shouldn't make it harder.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              { num: '3hrs', title: 'Lost every evening', desc: 'The average teacher spends 3+ hours on administrative tasks after school each day — time that should belong to family, rest, or self.' },
              { num: '40%', title: 'Consider leaving', desc: 'Nearly 40% of teachers seriously consider leaving the profession due to burnout. Paperwork overload is one of the top cited reasons.' },
              { num: '11hrs', title: 'Weekly admin load', desc: 'Teachers report spending up to 11 hours per week on non-teaching tasks — emails, reports, IEPs, lesson plans, and compliance docs.' },
            ].map((item, i) => (
              <div key={i} className="scroll-fade" style={{ ...scrollFadeStyle, transitionDelay: `${i * 0.1}s`, background: 'rgba(255,255,255,0.04)', padding: '40px 32px' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: '#00B4C8', marginBottom: 12, lineHeight: 1 }}>{item.num}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 12 }}>{item.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section style={{ padding: '100px 40px', background: '#E0F7FA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="scroll-fade" style={scrollFadeStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#00B4C8', marginBottom: 16 }}>What's included</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>A tool for every task<br />on your to-do list.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: '#6B7E80', maxWidth: 520, fontWeight: 300, marginBottom: 60 }}>Every tool was designed with real classroom experience. No generic AI — just practical, research-grounded outputs ready to use.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {TOOLS.map((tool, i) => (
              <div key={i} className="scroll-fade" style={{ ...scrollFadeStyle, transitionDelay: `${(i % 3) * 0.1}s`, background: 'white', borderRadius: 20, padding: 28, border: '1px solid rgba(13,92,99,0.08)' }}>
                <span style={{ fontSize: 32, marginBottom: 14, display: 'block' }}>{tool.icon}</span>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{tool.name}</div>
                <div style={{ fontSize: 13, color: '#6B7E80', lineHeight: 1.6 }}>{tool.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 15, color: '#007A8A', fontWeight: 600 }}>+ 50 more tools across 6 categories →</div>
          <div className="scroll-fade" style={{ ...scrollFadeStyle, background: 'white', border: '1px solid rgba(13,92,99,0.15)', borderRadius: 16, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, marginTop: 48 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: 14, color: '#007A8A', lineHeight: 1.6 }}>
              <strong>Privacy-first by design.</strong> Every tool uses placeholder names like [Student Name] instead of real student data, keeping you fully FERPA-compliant. Real names never enter the AI.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="scroll-fade" style={scrollFadeStyle}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#00B4C8', marginBottom: 16 }}>How it works</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 60 }}>From notes to polished<br />documents in seconds.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {[
            { num: '1', title: 'Choose your tool', desc: 'Browse 59 tools organized by category — Communication, IEP & Compliance, SEL, Lesson Planning, and more.' },
            { num: '2', title: 'Fill in your details', desc: 'Enter a few notes about the student or topic. No special skills needed — just write the way you think.' },
            { num: '3', title: 'Generate & export', desc: 'Get a polished document instantly. Copy it, export as .docx, or save directly to Google Drive.' },
          ].map((step, i) => (
            <div key={i} className="scroll-fade" style={{ ...scrollFadeStyle, transitionDelay: `${i * 0.15}s`, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#007A8A', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: '0 auto 24px' }}>{step.num}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 14, color: '#6B7E80', lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: '#FDF3E3', padding: '100px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#D4881E', marginBottom: 16 }}>From real teachers</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 40px)', fontWeight: 700, marginBottom: 48 }}>What educators are saying</h2>
          <div key={activeTestimonial} style={{ animation: 'fadeIn 0.6s ease' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(18px, 2.5vw, 26px)', fontStyle: 'italic', lineHeight: 1.6, color: '#1C2B2D', marginBottom: 32 }}>
              "{TESTIMONIALS[activeTestimonial].quote}"
            </p>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{TESTIMONIALS[activeTestimonial].name}</div>
            <div style={{ fontSize: 13, color: '#6B7E80', marginTop: 4 }}>{TESTIMONIALS[activeTestimonial].role}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i === activeTestimonial ? 24 : 8, height: 8, borderRadius: i === activeTestimonial ? 4 : '50%', background: i === activeTestimonial ? '#D4881E' : 'rgba(212,136,30,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '100px 40px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="scroll-fade" style={scrollFadeStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#00B4C8', marginBottom: 16 }}>Simple pricing</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, lineHeight: 1.15 }}>One membership.<br />Everything included.</h2>
          </div>
          <div className="scroll-fade" style={{ ...scrollFadeStyle, background: '#007A8A', borderRadius: 32, padding: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginTop: 60 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 80, fontWeight: 700, color: 'white', lineHeight: 1 }}><sup style={{ fontSize: 32, verticalAlign: 'super' }}>$</sup>9.99</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 24, marginTop: 8 }}>per month · cancel anytime</div>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontStyle: 'italic' }}>"Less than a cup of coffee a week — and it gives you your evenings back."</p>
              <button
                onClick={() => router.push('/pricing')}
                style={{ display: 'block', width: '100%', background: 'white', color: '#007A8A', border: 'none', padding: '18px 32px', borderRadius: 100, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 32, fontFamily: 'DM Sans, sans-serif' }}
              >
                Try the Teacher OS & AI Assistant →
              </button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {FEATURES.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.9)', fontSize: 15, padding: '10px 0', borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <span style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center', background: '#1C2B2D', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(26,138,125,0.15) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }} className="scroll-fade">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
            You became a teacher<br />to change lives —<br />not fill out forms.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.7 }}>
            Join hundreds of educators who have reclaimed their evenings with AI tools built by someone who understands your classroom.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            style={{ background: '#00B4C8', color: 'white', border: 'none', padding: '18px 40px', borderRadius: 100, fontSize: 17, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 12px 40px rgba(26,138,125,0.4)' }}
          >
            Try the Teacher OS & AI Assistant →
          </button>
          <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Already a member?{' '}
            <button onClick={() => router.push('/auth/login')} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
              Sign in here →
            </button>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1C2B2D', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>© 2026 Thrive & Learn Online</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <button onClick={() => router.push('/auth/login')} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Member Login</button>
          <button onClick={() => router.push('/dashboard/help')} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Help Center</button>
          <a href="mailto:support@thriveandlearnonline.com" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
