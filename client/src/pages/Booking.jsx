import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const AVAIL_DAYS = [2,3,4,7,8,9,10,11,14,15,16,17,18]
const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','3:00 PM','5:00 PM','6:00 PM','7:00 PM']
const UNAVAIL = new Set(['12:00 PM','7:00 PM'])

export default function Booking() {
  const [month, setMonth] = useState(3) // April = index 3
  const [year, setYear] = useState(2026)
  const [selDay, setSelDay] = useState(2)
  const [selTime, setSelTime] = useState('11:00 AM')
  const [selType, setSelType] = useState('Strategy Call')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(null)

  const changeMonth = (d) => {
    let m = month + d, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y)
  }

  const confirmBooking = () => {
    const date = selDay ? `${MONTHS[month]} ${selDay}, ${year}` : 'April 4, 2026'
    setConfirmed(`${date} · ${selTime}`)
    setModalOpen(true)
  }

  // Build calendar days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calDays = []
  for (let i = 0; i < firstDay; i++) calDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d)

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased min-h-screen selection:bg-[#E63946] selection:text-white">
      <Navbar variant="app" />
      <main className="pt-24 pb-16 px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-10">
          <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-3">Mentor Sessions</span>
          <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight">Book a Session</h1>
          <p className="text-[#555] font-light mt-1.5 text-sm">Pick a date, select a time. Coach Arjun will confirm within minutes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-7">
            <div className="flex items-center justify-between mb-7">
              <button onClick={() => changeMonth(-1)} className="w-9 h-9 rounded-xl border border-[#1A1A1A] hover:border-[#333] text-[#555] hover:text-white flex items-center justify-center transition-all">
                <Icon icon="solar:arrow-left-linear" className="text-sm" />
              </button>
              <div className="font-['Barlow_Condensed'] text-2xl text-white tracking-tight">{MONTHS[month]} {year}</div>
              <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded-xl border border-[#1A1A1A] hover:border-[#333] text-[#555] hover:text-white flex items-center justify-center transition-all">
                <Icon icon="solar:arrow-right-linear" className="text-sm" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-3">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-[10px] text-[#333] uppercase tracking-wider py-1.5">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} />
                const isAvail = AVAIL_DAYS.includes(d)
                const isSel = d === selDay
                return (
                  <div key={d}
                    onClick={() => { if (isAvail) { setSelDay(d) } }}
                    className="aspect-square flex items-center justify-center text-sm rounded-xl transition-all"
                    style={{
                      background: isSel ? '#E63946' : '',
                      border: isSel ? 'none' : isAvail ? '1px solid #1A1A1A' : 'none',
                      color: isSel ? 'white' : isAvail ? '#888' : '#222',
                      cursor: isAvail ? 'pointer' : 'default',
                    }}
                    onMouseEnter={e => { if (isAvail && !isSel) { e.currentTarget.style.borderColor = 'rgba(230,57,70,0.4)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(230,57,70,0.05)' } }}
                    onMouseLeave={e => { if (isAvail && !isSel) { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.color = '#888'; e.currentTarget.style.background = '' } }}
                  >
                    {d}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Selected date */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-2">Selected Date</div>
              <div className="font-['Barlow_Condensed'] text-2xl text-white tracking-tight">
                {selDay ? `${MONTHS[month]} ${selDay}, ${year}` : 'Choose a date'}
              </div>
              <div className="text-[#555] text-xs font-light mt-1">Then pick a time slot below</div>
            </div>

            {/* Time slots */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5 flex-1">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-4">Available Times</div>
              <div className="grid grid-cols-2 gap-2">
                {TIMES.map(t => {
                  const unavail = UNAVAIL.has(t)
                  const sel = selTime === t && !unavail
                  return (
                    <button key={t} disabled={unavail}
                      onClick={() => !unavail && setSelTime(t)}
                      className="rounded-xl py-3 text-sm transition-all"
                      style={{
                        border: sel ? '1px solid rgba(230,57,70,0.5)' : unavail ? '1px solid #111' : '1px solid #1A1A1A',
                        background: sel ? 'rgba(230,57,70,0.1)' : '',
                        color: sel ? '#E63946' : unavail ? '#333' : '#666',
                        cursor: unavail ? 'not-allowed' : 'pointer',
                      }}>
                      {t}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 text-[10px]">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm border border-[#E63946]/50 bg-[#E63946]/10" /><span className="text-[#555]">Selected</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm border border-[#111]" /><span className="text-[#333]">Unavailable</span></div>
              </div>
            </div>

            {/* Session type */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-4">Session Type</div>
              <div className="space-y-3">
                {['Strategy Call','Form Check','Check-in Call'].map(type => {
                  const sel = selType === type
                  return (
                    <label key={type} className="flex items-center gap-3 cursor-pointer" onClick={() => setSelType(type)}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: sel ? '#E63946' : '#333' }}>
                        {sel && <div className="w-1.5 h-1.5 bg-[#E63946] rounded-full" />}
                      </div>
                      <span className="text-sm" style={{ color: sel ? 'white' : '#555' }}>{type}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <button onClick={confirmBooking} className="btn-primary w-full py-4 rounded-xl text-sm font-normal flex items-center justify-center gap-2.5">
              Confirm Booking <Icon icon="solar:check-circle-linear" className="text-base" />
            </button>
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="mt-5 bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-7">
          <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-5">Upcoming Sessions</div>
          <div className="flex items-center justify-between bg-[#080304] border border-[#E63946]/20 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center">
                <Icon icon="solar:video-frame-linear" className="text-[#E63946] text-base" />
              </div>
              <div>
                <div className="text-sm text-white">Strategy Call · Coach Arjun</div>
                <div className="text-[10px] text-[#E63946] mt-0.5 uppercase tracking-widest">Apr 4, 2026 · 11:00 AM</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="border border-[#E63946]/30 text-[#E63946] text-xs px-4 py-1.5 rounded-lg hover:bg-[#E63946]/10 transition-colors">Join</button>
              <button className="border border-[#1A1A1A] text-[#555] text-xs px-4 py-1.5 rounded-lg hover:border-[#333] hover:text-[#888] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#080304]/85 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-10 max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#E63946]/10 border border-[#E63946]/30 flex items-center justify-center mx-auto mb-6">
                <Icon icon="solar:check-circle-linear" className="text-[#E63946] text-3xl" />
              </div>
              <h3 className="font-['Barlow_Condensed'] text-4xl text-white tracking-tight mb-2">Session Booked</h3>
              <p className="text-[#555] text-sm font-light mb-2">{confirmed}</p>
              <p className="text-[#444] text-xs font-light mb-8">Coach Arjun has been notified. You'll receive a link 30 minutes before your session.</p>
              <button onClick={() => setModalOpen(false)} className="btn-primary w-full py-3 rounded-xl text-sm font-normal">Got it</button>
            </div>
          </div>
        </div>
      )}

      <Footer minimal />
    </div>
  )
}
