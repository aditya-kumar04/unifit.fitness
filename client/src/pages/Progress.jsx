import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TODAY = 12
const WEEK_DATA = [
  { day: 'Day 1', kg: '92.0' },
  { day: 'Day 4', kg: '91.3' },
  { day: 'Day 6', kg: '90.8' },
  { day: 'Day 9', kg: '90.1' },
  { day: 'Today', kg: '89.2', highlight: true },
]

export default function Progress() {
  const [photoSlot, setPhotoSlot] = useState(null)

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleWeek4Upload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => setPhotoSlot(evt.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased min-h-screen selection:bg-[#E63946] selection:text-white">
      <Navbar variant="app" />
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-3">30-Day Journey</span>
            <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight">Your Progress</h1>
            <p className="text-[#555] font-light mt-1.5 text-sm">Day 12 · You're ahead of schedule.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-[#0D0B0C] border border-[#E63946]/40 rounded-xl px-5 py-3 text-center">
              <div className="font-['Bebas_Neue'] text-3xl text-[#E63946]">−2.8</div>
              <div className="text-[10px] text-[#555] uppercase tracking-widest">kg lost</div>
            </div>
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-xl px-5 py-3 text-center">
              <div className="font-['Bebas_Neue'] text-3xl text-white">18</div>
              <div className="text-[10px] text-[#555] uppercase tracking-widest">days left</div>
            </div>
          </div>
        </div>

        {/* Chart + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-7 reveal">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-1">Weight Trend</div>
                <div className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight">92 → 89.2 kg</div>
              </div>
              <div className="flex gap-1.5">
                <button className="border border-[#E63946]/40 bg-[#E63946]/10 text-[#E63946] text-xs px-3 py-1.5 rounded-lg">30D</button>
                <button className="border border-[#1A1A1A] text-[#555] text-xs px-3 py-1.5 rounded-lg hover:border-[#333] hover:text-[#888] transition-colors">7D</button>
              </div>
            </div>
            <svg viewBox="0 0 600 180" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#E63946', stopOpacity: 0.15 }} />
                  <stop offset="100%" style={{ stopColor: '#E63946', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {[30, 70, 110, 150].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#161616" strokeWidth="1" />)}
              {[['5','28','93'],['5','68','91'],['5','108','90'],['5','148','89']].map(([x, y, t]) => (
                <text key={y} x={x} y={y} fill="#2a2a2a" fontSize="10" fontFamily="DM Sans">{t}</text>
              ))}
              <path d="M25,40 L75,46 L125,56 L175,65 L250,80 L320,95 L390,108 L460,118 L530,124 L570,128 L570,180 L25,180 Z" fill="url(#areaGrad)" />
              <path d="M25,40 L75,46 L125,56 L175,65 L250,80 L320,95 L390,108 L460,118 L530,124 L570,128" fill="none" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
              {[[25,40],[175,65],[320,95],[460,118]].map(([cx,cy]) => <circle key={`${cx}`} cx={cx} cy={cy} r="3" fill="#E63946" opacity="0.5" />)}
              <circle cx="570" cy="128" r="5" fill="#E63946" />
              <text x="18" y="175" fill="#333" fontSize="9" fontFamily="DM Sans">Day 1</text>
              <text x="315" y="175" fill="#333" fontSize="9" fontFamily="DM Sans">Day 8</text>
              <text x="548" y="175" fill="#E63946" fontSize="9" fontFamily="DM Sans">Today</text>
            </svg>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {WEEK_DATA.map(w => (
                <div key={w.day} className="flex-shrink-0 rounded-xl px-3 py-2 text-center"
                  style={{ background: w.highlight ? '#0D0B0C' : '#080304', border: `1px solid ${w.highlight ? 'rgba(230,57,70,0.4)' : '#1A1A1A'}` }}>
                  <div className="font-['Bebas_Neue'] text-lg" style={{ color: w.highlight ? '#E63946' : w.day === 'Day 1' ? '#888' : 'white' }}>{w.kg}</div>
                  <div className="text-[10px]" style={{ color: w.highlight ? '#E63946' : '#333' }}>{w.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats col */}
          <div className="flex flex-col gap-5">
            {[
              { label: 'Starting Weight', val: '92.0', unit: 'kg', sub: 'Day 1 · March 21', subColor: '#333', border: '#1A1A1A', labelColor: '#444' },
              { label: 'Current Weight', val: '89.2', unit: 'kg', sub: '−2.8 kg from start', subColor: '#22c55e', border: 'rgba(230,57,70,0.3)', labelColor: '#E63946' },
            ].map(s => (
              <div key={s.label} className="bg-[#0D0B0C] rounded-2xl p-6 reveal" style={{ border: `1px solid ${s.border}` }}>
                <div className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: s.labelColor }}>{s.label}</div>
                <div className="font-['Bebas_Neue'] text-5xl text-white">{s.val} <span className="text-2xl text-[#555]">{s.unit}</span></div>
                <div className="text-xs mt-1 flex items-center gap-1" style={{ color: s.subColor }}>
                  {s.subColor === '#22c55e' && <Icon icon="solar:arrow-down-linear" className="text-xs" />}{s.sub}
                </div>
              </div>
            ))}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6 reveal">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-3">Target Weight</div>
              <div className="font-['Bebas_Neue'] text-5xl text-white">85.0 <span className="text-2xl text-[#555]">kg</span></div>
              <div className="text-[#555] text-xs mt-1.5 mb-2.5">4.2 kg remaining</div>
              <div className="w-full h-1 bg-[#161616] rounded-full">
                <div className="h-full bg-[#E63946] rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Photos */}
        <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-7 mb-5 reveal">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-1">Progress Photos</div>
              <h2 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight">Weekly Check-in</h2>
            </div>
            <label className="cursor-pointer btn-primary text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 font-normal">
              <Icon icon="solar:camera-linear" className="text-base" /> Upload This Week
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { week: 'Week 1', date: 'Mar 21', kg: '92.0', style: {} },
              { week: 'Week 2', date: 'Mar 28', kg: '91.2', style: {} },
              { week: 'Week 3 · Now', date: 'Apr 2', kg: '89.2', current: true },
            ].map(w => (
              <div key={w.week}>
                <div className="aspect-[3/4] bg-[#080304] rounded-2xl flex flex-col items-center justify-center"
                  style={{ border: `1px solid ${w.current ? 'rgba(230,57,70,0.3)' : '#1A1A1A'}` }}>
                  <Icon icon="solar:user-rounded-linear" className="text-5xl mb-2" style={{ color: w.current ? 'rgba(230,57,70,0.2)' : '#1A1A1A' }} />
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: w.current ? '#E63946' : '#333' }}>{w.kg} kg</div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs" style={{ color: w.current ? '#E63946' : '#888' }}>{w.week}</div>
                  <div className="text-[10px]" style={{ color: w.current ? 'rgba(230,57,70,0.6)' : '#444' }}>{w.date}</div>
                </div>
              </div>
            ))}
            <label className="cursor-pointer block">
              {photoSlot
                ? <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#E63946]/30">
                    <img src={photoSlot} className="w-full h-full object-cover" alt="Week 4" />
                  </div>
                : <div className="aspect-[3/4] bg-[#080304] border border-dashed border-[#1A1A1A] rounded-2xl flex flex-col items-center justify-center hover:border-[#333] transition-colors">
                    <Icon icon="solar:upload-minimalistic-linear" className="text-[#333] text-3xl mb-2" />
                    <div className="text-[10px] text-[#333] uppercase tracking-widest">Upload</div>
                  </div>
              }
              <div className="mt-2 text-center">
                <div className="text-xs text-[#444]">Week 4</div>
                <div className="text-[10px] text-[#333]">Apr 11</div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleWeek4Upload} />
            </label>
          </div>
        </div>

        {/* 30-Day Timeline */}
        <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-7 reveal">
          <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-5">30-Day Timeline</div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
              const past = d < TODAY, current = d === TODAY
              return (
                <div key={d} title={`Day ${d}`}
                  className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer hover:scale-110 transition-all relative group"
                  style={{
                    background: past || current ? '#E63946' : '#161616',
                    border: current ? '2px solid transparent' : past ? 'none' : '1px solid #222',
                    boxShadow: current ? '0 0 0 3px rgba(230,57,70,0.3)' : 'none',
                  }}>
                  {past
                    ? <Icon icon="solar:check-read-linear" className="text-white text-[9px]" />
                    : <span className="text-[9px]" style={{ color: current ? 'white' : '#333', fontWeight: current ? 'bold' : 'normal' }}>{d}</span>
                  }
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {current ? 'Today' : `Day ${d}`}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-6 mt-5 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#E63946]" /><span className="text-[#555]">Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#E63946] ring-2 ring-[#E63946]/30" /><span className="text-white">Today</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#161616] border border-[#222]" /><span className="text-[#444]">Upcoming</span></div>
          </div>
        </div>
      </main>
      <Footer minimal />
    </div>
  )
}
