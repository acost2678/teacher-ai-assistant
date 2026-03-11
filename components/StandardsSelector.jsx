'use client'

import { useState, useMemo } from 'react'

// ─── Framework Data ───────────────────────────────────────────────────────────

export const FRAMEWORKS = {
  ccss: {
    id: 'ccss',
    name: 'Common Core',
    shortName: 'CCSS',
    icon: '📐',
    color: 'blue',
    subjects: ['ELA', 'Math'],
    grades: ['K','1','2','3','4','5','6','7','8','9-10','11-12'],
  },
  casel: {
    id: 'casel',
    name: 'CASEL SEL',
    shortName: 'CASEL',
    icon: '💚',
    color: 'green',
    subjects: ['SEL'],
    grades: ['K-2','3-5','6-8','9-12'],
  },
  ngss: {
    id: 'ngss',
    name: 'Next Gen Science',
    shortName: 'NGSS',
    icon: '🔬',
    color: 'purple',
    subjects: ['Science'],
    grades: ['K-2','3-5','6-8','9-12'],
  },
  state: {
    id: 'state',
    name: 'State Standards',
    shortName: 'State',
    icon: '🗺️',
    color: 'orange',
    subjects: ['ELA','Math','Science','Social Studies','SEL'],
    grades: ['K','1','2','3','4','5','6','7','8','9','10','11','12'],
  },
}

// CASEL competencies — static, well-defined
export const CASEL_STANDARDS = [
  {
    id: 'casel-sa',
    code: 'SA',
    competency: 'Self-Awareness',
    icon: '🪞',
    indicators: [
      { id: 'casel-sa-1', code: 'SA.1', description: 'Identify and label emotions accurately' },
      { id: 'casel-sa-2', code: 'SA.2', description: 'Recognize personal strengths and areas for growth' },
      { id: 'casel-sa-3', code: 'SA.3', description: 'Develop a growth mindset and sense of purpose' },
      { id: 'casel-sa-4', code: 'SA.4', description: 'Demonstrate self-efficacy and positive identity' },
    ]
  },
  {
    id: 'casel-sm',
    code: 'SM',
    competency: 'Self-Management',
    icon: '🎯',
    indicators: [
      { id: 'casel-sm-1', code: 'SM.1', description: 'Regulate emotions and impulses effectively' },
      { id: 'casel-sm-2', code: 'SM.2', description: 'Set, monitor, and achieve personal goals' },
      { id: 'casel-sm-3', code: 'SM.3', description: 'Demonstrate organizational and planning skills' },
      { id: 'casel-sm-4', code: 'SM.4', description: 'Show courage and initiative in new situations' },
    ]
  },
  {
    id: 'casel-soa',
    code: 'SOA',
    competency: 'Social Awareness',
    icon: '🌍',
    indicators: [
      { id: 'casel-soa-1', code: 'SOA.1', description: 'Demonstrate empathy and compassion for others' },
      { id: 'casel-soa-2', code: 'SOA.2', description: 'Understand diverse perspectives and backgrounds' },
      { id: 'casel-soa-3', code: 'SOA.3', description: 'Recognize situational demands and opportunities' },
      { id: 'casel-soa-4', code: 'SOA.4', description: 'Appreciate diversity and feel connected to family, school, and community' },
    ]
  },
  {
    id: 'casel-rs',
    code: 'RS',
    competency: 'Relationship Skills',
    icon: '🤝',
    indicators: [
      { id: 'casel-rs-1', code: 'RS.1', description: 'Communicate clearly and listen actively' },
      { id: 'casel-rs-2', code: 'RS.2', description: 'Cooperate and work collaboratively toward shared goals' },
      { id: 'casel-rs-3', code: 'RS.3', description: 'Resolve conflicts constructively' },
      { id: 'casel-rs-4', code: 'RS.4', description: 'Resist negative social pressure and seek help when needed' },
    ]
  },
  {
    id: 'casel-rdm',
    code: 'RDM',
    competency: 'Responsible Decision-Making',
    icon: '⚖️',
    indicators: [
      { id: 'casel-rdm-1', code: 'RDM.1', description: 'Identify problems and analyze situations accurately' },
      { id: 'casel-rdm-2', code: 'RDM.2', description: 'Evaluate consequences of actions for self and others' },
      { id: 'casel-rdm-3', code: 'RDM.3', description: 'Reflect on personal, ethical, and safety considerations' },
      { id: 'casel-rdm-4', code: 'RDM.4', description: 'Apply decision-making skills in academic and social contexts' },
    ]
  },
]

// NGSS Disciplinary Core Ideas (abbreviated — AI fills in detail)
export const NGSS_DOMAINS = [
  { id: 'ngss-ps',  code: 'PS',  name: 'Physical Science',         icon: '⚡', grades: ['K-2','3-5','6-8','9-12'] },
  { id: 'ngss-ls',  code: 'LS',  name: 'Life Science',             icon: '🌱', grades: ['K-2','3-5','6-8','9-12'] },
  { id: 'ngss-ess', code: 'ESS', name: 'Earth & Space Science',    icon: '🌍', grades: ['K-2','3-5','6-8','9-12'] },
  { id: 'ngss-ets', code: 'ETS', name: 'Engineering & Technology', icon: '⚙️', grades: ['K-2','3-5','6-8','9-12'] },
]

// US States list
export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','Washington D.C.',
]

// Color map
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   ring: 'ring-blue-400'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  ring: 'ring-green-400'  },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', ring: 'ring-purple-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', ring: 'ring-orange-400' },
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * StandardsSelector
 *
 * Props:
 *   selectedStandards  — array of selected standard objects
 *   onStandardsChange  — (standards[]) => void
 *   compact            — boolean, renders inline mini version for embedding in other tools
 *   allowMultiple      — boolean, allow selecting multiple standards (default true)
 *   defaultFramework   — 'ccss' | 'casel' | 'ngss' | 'state'
 */
export default function StandardsSelector({
  selectedStandards = [],
  onStandardsChange,
  compact = false,
  allowMultiple = true,
  defaultFramework = null,
}) {
  const [activeFramework, setActiveFramework] = useState(defaultFramework)
  const [subject,         setSubject]         = useState('')
  const [gradeFilter,     setGradeFilter]     = useState('')
  const [selectedState,   setSelectedState]   = useState('')
  const [standardSearch,  setStandardSearch]  = useState('')
  const [expanded,        setExpanded]        = useState({}) // for CASEL accordion

  const fw = activeFramework ? FRAMEWORKS[activeFramework] : null
  const colors = fw ? COLOR_MAP[fw.color] : null

  // ── Toggle standard selection ──────────────────────────────────────────────
  const toggleStandard = (std) => {
    const already = selectedStandards.find(s => s.id === std.id)
    if (already) {
      onStandardsChange(selectedStandards.filter(s => s.id !== std.id))
    } else {
      onStandardsChange(allowMultiple ? [...selectedStandards, std] : [std])
    }
  }

  const isSelected = (id) => selectedStandards.some(s => s.id === id)

  const removeStandard = (id) => onStandardsChange(selectedStandards.filter(s => s.id !== id))

  // ── CASEL filtered indicators ──────────────────────────────────────────────
  const filteredCasel = useMemo(() => {
    if (!standardSearch) return CASEL_STANDARDS
    const q = standardSearch.toLowerCase()
    return CASEL_STANDARDS.map(comp => ({
      ...comp,
      indicators: comp.indicators.filter(i =>
        i.description.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
      )
    })).filter(comp => comp.indicators.length > 0 || comp.competency.toLowerCase().includes(q))
  }, [standardSearch])

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPACT MODE — for embedding inside other tools
  // ─────────────────────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Framework pills */}
        <div className="flex flex-wrap gap-2">
          {Object.values(FRAMEWORKS).map(f => {
            const c = COLOR_MAP[f.color]
            const active = activeFramework === f.id
            return (
              <button key={f.id} onClick={() => { setActiveFramework(active ? null : f.id); setSubject(''); setGradeFilter('') }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all
                  ${active ? `${c.bg} ${c.border} ${c.text}` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <span>{f.icon}</span>{f.shortName}
              </button>
            )
          })}
        </div>

        {/* Compact CASEL picker */}
        {activeFramework === 'casel' && (
          <div className="space-y-2">
            {CASEL_STANDARDS.map(comp => (
              <div key={comp.id}>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{comp.icon} {comp.competency}</p>
                <div className="flex flex-wrap gap-1">
                  {comp.indicators.map(ind => (
                    <button key={ind.id} onClick={() => toggleStandard({ id: ind.id, code: `CASEL.${ind.code}`, description: ind.description, framework: 'casel', competency: comp.competency })}
                      className={`text-xs px-2 py-1 rounded-lg border transition-all
                        ${isSelected(ind.id) ? 'bg-green-100 border-green-400 text-green-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>
                      {ind.code}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact state/CCSS/NGSS — text input for standard code */}
        {activeFramework && activeFramework !== 'casel' && (
          <div className="flex gap-2">
            {activeFramework === 'state' && (
              <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700">
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <input value={standardSearch} onChange={e => setStandardSearch(e.target.value)}
              placeholder={`Enter standard code (e.g., ${activeFramework === 'ccss' ? 'CCSS.ELA-LITERACY.RI.5.3' : activeFramework === 'ngss' ? 'NGSS.3-LS1-1' : 'Standard code...'})`}
              className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700" />
            <button onClick={() => {
              if (!standardSearch.trim()) return
              const newStd = {
                id: `${activeFramework}-${standardSearch.trim()}`,
                code: standardSearch.trim(),
                description: `${selectedState ? selectedState + ' — ' : ''}${standardSearch.trim()}`,
                framework: activeFramework,
                state: selectedState || null,
              }
              toggleStandard(newStd)
              setStandardSearch('')
            }} className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Add
            </button>
          </div>
        )}

        {/* Selected tags */}
        {selectedStandards.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedStandards.map(std => {
              const c = COLOR_MAP[FRAMEWORKS[std.framework]?.color || 'blue']
              return (
                <span key={std.id} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${c.badge}`}>
                  {std.code}
                  <button onClick={() => removeStandard(std.id)} className="hover:opacity-70 ml-0.5">×</button>
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FULL MODE — standalone page or large section
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Framework Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.values(FRAMEWORKS).map(f => {
          const c = COLOR_MAP[f.color]
          const active = activeFramework === f.id
          return (
            <button key={f.id}
              onClick={() => { setActiveFramework(active ? null : f.id); setSubject(''); setGradeFilter(''); setStandardSearch('') }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${active ? `${c.bg} ${c.border}` : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className={`font-semibold text-sm ${active ? c.text : 'text-gray-700'}`}>{f.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{f.subjects.join(' · ')}</div>
            </button>
          )
        })}
      </div>

      {/* ── CASEL Framework ── */}
      {activeFramework === 'casel' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">CASEL SEL Competencies</h3>
              <p className="text-sm text-gray-500">Select competencies and indicators to align your content</p>
            </div>
            <input value={standardSearch} onChange={e => setStandardSearch(e.target.value)}
              placeholder="Search competencies..."
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 w-48" />
          </div>

          <div className="space-y-4">
            {filteredCasel.map(comp => {
              const isExpanded = expanded[comp.id] !== false // default open
              return (
                <div key={comp.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(p => ({ ...p, [comp.id]: !isExpanded }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-green-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{comp.icon}</span>
                      <span className="font-semibold text-gray-800 text-sm">{comp.competency}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{comp.code}</span>
                    </div>
                    <span className={`text-gray-400 transition-transform text-sm ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {comp.indicators.map(ind => {
                        const selected = isSelected(ind.id)
                        return (
                          <button key={ind.id}
                            onClick={() => toggleStandard({ id: ind.id, code: `CASEL.${ind.code}`, description: ind.description, framework: 'casel', competency: comp.competency })}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${selected ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${selected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                              {selected && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-green-700 block">{ind.code}</span>
                              <span className="text-xs text-gray-600 leading-snug">{ind.description}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── NGSS Framework ── */}
      {activeFramework === 'ngss' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Next Generation Science Standards</h3>
            <p className="text-sm text-gray-500">Select your domain and grade band, then enter or search the specific standard code</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {NGSS_DOMAINS.map(domain => {
              const active = subject === domain.code
              return (
                <button key={domain.id} onClick={() => setSubject(active ? '' : domain.code)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${active ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <span className="text-xl block mb-1">{domain.icon}</span>
                  <span className={`text-xs font-semibold ${active ? 'text-purple-700' : 'text-gray-700'}`}>{domain.name}</span>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2">
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700">
              <option value="">Grade band...</option>
              {['K-2','3-5','6-8','9-12'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input value={standardSearch} onChange={e => setStandardSearch(e.target.value)}
              placeholder={`Standard code (e.g., ${subject || 'PS'}1-1, ${subject || 'LS'}2-3...)`}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <button onClick={() => {
              if (!standardSearch.trim()) return
              toggleStandard({
                id: `ngss-${standardSearch.trim()}`,
                code: `NGSS.${standardSearch.trim()}`,
                description: `${gradeFilter ? `Grade ${gradeFilter} · ` : ''}${subject ? subject + ' · ' : ''}${standardSearch.trim()}`,
                framework: 'ngss',
                domain: subject,
                gradeBand: gradeFilter,
              })
              setStandardSearch('')
            }} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors font-medium">
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── CCSS Framework ── */}
      {activeFramework === 'ccss' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Common Core State Standards</h3>
            <p className="text-sm text-gray-500">Filter by subject and grade, then enter your standard code</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
              <div className="flex gap-2">
                {['ELA','Math'].map(s => (
                  <button key={s} onClick={() => setSubject(subject === s ? '' : s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all
                      ${subject === s ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Grade</label>
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700">
                <option value="">All grades</option>
                {['K','1','2','3','4','5','6','7','8','9-10','11-12'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Standard Code</label>
              <div className="flex gap-2">
                <input value={standardSearch} onChange={e => setStandardSearch(e.target.value)}
                  placeholder={subject === 'Math' ? 'e.g., 5.NBT.A.1' : 'e.g., RI.5.3'}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={() => {
                  if (!standardSearch.trim()) return
                  const prefix = subject === 'Math' ? 'CCSS.MATH' : 'CCSS.ELA-LITERACY'
                  toggleStandard({
                    id: `ccss-${standardSearch.trim()}`,
                    code: `${prefix}.${standardSearch.trim()}`,
                    description: `${subject || 'CCSS'} · Grade ${gradeFilter || 'All'} · ${standardSearch.trim()}`,
                    framework: 'ccss',
                    subject,
                    grade: gradeFilter,
                  })
                  setStandardSearch('')
                }} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Quick reference */}
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">📘 Common Code Formats</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-blue-600">
              <span>ELA Reading Info: <strong>RI.{gradeFilter||'5'}.{'{'}standard{'}'}</strong></span>
              <span>ELA Reading Lit: <strong>RL.{gradeFilter||'5'}.{'{'}standard{'}'}</strong></span>
              <span>ELA Writing: <strong>W.{gradeFilter||'5'}.{'{'}standard{'}'}</strong></span>
              <span>Math: <strong>{gradeFilter||'5'}.{'{'}domain{'}'}.{'{'}cluster{'}'}.{'{'}standard{'}'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── State Standards Framework ── */}
      {activeFramework === 'state' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">State Standards</h3>
            <p className="text-sm text-gray-500">Select your state, subject, and grade — then enter the standard code from your state framework</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
              <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700">
                <option value="">Select your state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700">
                <option value="">All subjects</option>
                {FRAMEWORKS.state.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Grade</label>
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700">
                <option value="">All grades</option>
                {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input value={standardSearch} onChange={e => setStandardSearch(e.target.value)}
              placeholder="Enter standard code from your state framework..."
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button onClick={() => {
              if (!standardSearch.trim() || !selectedState) { alert('Please select a state and enter a standard code'); return }
              toggleStandard({
                id: `state-${selectedState}-${standardSearch.trim()}`,
                code: standardSearch.trim(),
                description: `${selectedState} · ${subject || 'All Subjects'} · Grade ${gradeFilter || 'All'} · ${standardSearch.trim()}`,
                framework: 'state',
                state: selectedState,
                subject,
                grade: gradeFilter,
              })
              setStandardSearch('')
            }} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors font-medium">
              Add Standard
            </button>
          </div>

          {!selectedState && (
            <p className="text-xs text-orange-600 mt-2">⚠️ Select your state first — state standard codes vary significantly by state.</p>
          )}
        </div>
      )}

      {/* ── Selected Standards Summary ── */}
      {selectedStandards.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Selected Standards ({selectedStandards.length})</h3>
            <button onClick={() => onStandardsChange([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Clear all</button>
          </div>
          <div className="space-y-2">
            {selectedStandards.map(std => {
              const c = COLOR_MAP[FRAMEWORKS[std.framework]?.color || 'blue']
              return (
                <div key={std.id} className={`flex items-start justify-between gap-3 p-3 rounded-xl ${c.bg} border ${c.border}`}>
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${c.badge}`}>{std.code}</span>
                    <span className="text-xs text-gray-600 leading-snug">{std.description}</span>
                  </div>
                  <button onClick={() => removeStandard(std.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 text-sm">✕</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}