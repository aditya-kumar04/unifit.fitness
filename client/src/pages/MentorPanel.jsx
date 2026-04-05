import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'

const CLIENTS = [
  { id: 1, initials: 'RM', name: 'Rahul Mehta', day: 'Day 12', goal: 'Fat Loss', weight: '89.2 kg', status: 'On Track', online: 'green' },
  { id: 2, initials: 'PS', name: 'Priya Sharma', day: 'Day 8', goal: 'Muscle Gain', weight: '61.5 kg', status: 'Needs Nudge', online: 'yellow' },
  { id: 3, initials: 'AG', name: 'Aryan Gupta', day: 'Day 22', goal: 'Consistency', weight: '78.4 kg', status: 'Excellent', online: 'green' },
  { id: 4, initials: 'SP', name: 'Sneha Patel', day: 'Day 5', goal: 'Fat Loss', weight: '54.8 kg', status: 'At Risk', online: 'red' },
  { id: 5, initials: 'KS', name: 'Karan Singh', day: 'Day 18', goal: 'Muscle Gain', weight: '83.0 kg', status: 'On Track', online: 'green' },
]

const STATUS_COLORS = {
  'On Track':    { text: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)' },
  'Excellent':   { text: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.3)' },
  'Needs Nudge': { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)' },
  'At Risk':     { text: '#E63946', bg: 'rgba(230,57,70,0.1)',    border: 'rgba(230,57,70,0.3)' },
}
const ONLINE_COLORS = { green: '#22c55e', yellow: '#F59E0B', red: '#E63946' }

const ACTIVITY = [
  { icon: 'solar:check-circle-linear', iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.1)', iconBorder: 'rgba(34,197,94,0.2)', text: 'Completed Upper Body session', time: 'Today · 11:45 AM' },
  { icon: 'solar:health-linear', iconColor: '#E63946', iconBg: 'rgba(230,57,70,0.1)', iconBorder: 'rgba(230,57,70,0.2)', text: 'Logged 3 meals · 1820 kcal', time: 'Today · 4:30 PM' },
  { icon: 'solar:chat-round-dots-linear', iconColor: '#4A90D9', iconBg: 'rgba(74,144,217,0.1)', iconBorder: 'rgba(74,144,217,0.2)', text: '"Bench PR today — 75kg!"', time: 'Today · 12:00 PM' },
  { icon: 'solar:arrow-down-linear', iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.1)', iconBorder: 'rgba(34,197,94,0.2)', text: 'Logged weight: 89.2 kg (−0.4 kg)', time: 'Yesterday · 8:10 AM' },
  { icon: 'solar:calendar-date-linear', iconColor: '#444', iconBg: '#1A1A1A', iconBorder: '#222', text: 'Completed Leg Day', time: 'Yesterday · 5:00 PM' },
]

export default function MentorPanel() {
  const [activeClient, setActiveClient] = useState(CLIENTS[0])
  const [planUpdated, setPlanUpdated] = useState(false)

  const pushUpdate = () => {
    setPlanUpdated(true)
    setTimeout(() => setPlanUpdated(false), 2500)
  }

  const sc = STATUS_COLORS[activeClient.status] || STATUS_COLORS['On Track']

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased h-screen flex flex-col selection:bg-[#E63946] selection:text-white overflow-hidden">
      {/* Custom nav for mentor panel */}
      <nav className="flex-shrink-0 bg-[#080304]/95 backdrop-blur-xl border-b border-[#161616] z-50">
        <div className="max-w-full px-6 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#E63946] rounded-md flex items-center justify-center">
                <Icon icon="solar:bolt-bold" className="text-white text-base" />
              </div>
              <span className="font-['Bebas_Neue'] text-xl tracking-wider text-white">UNIFIT</span>
            </Link>
            <div className="w-px h-4 bg-[#1A1A1A]" />
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em]">Mentor Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
              <span className="text-xs text-[#555]">12 active clients</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E63946] flex items-center justify-center">
              <Icon icon="solar:user-linear" className="text-white text-sm" />
            </div>
            <span className="text-sm text-[#888] hidden lg:block">Coach Arjun</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Client Sidebar */}
        <aside className="flex flex-col w-72 border-r border-[#161616] bg-[#050102] flex-shrink-0">
          <div className="p-4 border-b border-[#161616]">
            <div className="flex items-center gap-2.5 bg-[#0A0304]/80 border border-[#1A1A1A] rounded-xl px-4 py-2.5">
              <Icon icon="solar:magnifer-linear" className="text-[#333] text-sm flex-shrink-0" />
              <input type="text" placeholder="Search clients..." className="bg-transparent text-sm text-[#ccc] outline-none placeholder-[#333] w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {CLIENTS.map(client => {
              const active = activeClient.id === client.id
              return (
                <div key={client.id}
                  onClick={() => setActiveClient(client)}
                  className="client-card bg-[#0D0B0C] rounded-2xl p-3.5 cursor-pointer"
                  style={{ borderColor: active ? '#E63946' : '#1A1A1A', background: active ? 'rgba(230,57,70,0.06)' : '#0D0B0C' }}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                        style={{ background: active ? '#E63946' : '#1A1A1A', border: active ? 'none' : '1px solid #222', color: active ? 'white' : '#666' }}>
                        {client.initials}
                      </div>
                      <div className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full border-2 border-[#050102]"
                        style={{ background: ONLINE_COLORS[client.online], animation: client.online === 'red' ? 'pulse 2s infinite' : 'none' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white truncate">{client.name}</div>
                      <div className="text-[10px] uppercase tracking-widest" style={{ color: active ? '#E63946' : '#555' }}>{client.day} · {client.goal}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px]" style={{ color: STATUS_COLORS[client.status]?.text || '#22c55e' }}>{client.status}</div>
                      <div className="text-[10px] text-[#333]">{client.weight}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer stats */}
          <div className="py-3.5 px-4 border-t border-[#161616] grid grid-cols-3 text-center">
            {[['12','Total','white'],['9','On Track','#22c55e'],['3','At Risk','#E63946']].map(([v,l,c]) => (
              <div key={l}>
                <div className="font-['Bebas_Neue'] text-2xl" style={{ color: c }}>{v}</div>
                <div className="text-[9px] text-[#333] uppercase tracking-widest">{l}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 overflow-y-auto p-7">
          {/* Client header */}
          <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
            <div>
              <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-2">Client Overview</span>
              <h1 className="font-['Barlow_Condensed'] text-4xl text-white tracking-tight">{activeClient.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[#555] text-sm">{activeClient.day} · {activeClient.goal} · {activeClient.weight}</span>
                <div className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest"
                  style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                  {activeClient.status}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/chat" className="btn-ghost text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                <Icon icon="solar:chat-round-dots-linear" className="text-base" /> Message
              </Link>
              <Link to="/booking" className="btn-primary text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 font-normal">
                <Icon icon="solar:video-frame-linear" className="text-base" /> Book Call
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Current Weight', val: activeClient.weight, labelColor: '#E63946' },
              { label: 'Weight Lost', val: '−2.8 kg', valColor: '#22c55e' },
              { label: 'Streak', val: '8 days' },
              { label: 'Avg Calories', val: '1,890' },
            ].map(s => (
              <div key={s.label} className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: s.labelColor || '#444' }}>{s.label}</div>
                <div className="font-['Bebas_Neue'] text-3xl" style={{ color: s.valColor || 'white' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Plan + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Plan */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6">
              <div className="text-[11px] text-[#E63946] uppercase tracking-[0.2em] mb-5">Update Plan</div>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-[10px] text-[#444] uppercase tracking-widest block mb-2">Workout Plan</label>
                  <select className="w-full bg-[#080304] border border-[#1A1A1A] focus:border-[#2a2a2a] rounded-xl px-4 py-3 text-[#888] text-sm outline-none cursor-pointer">
                    <option>Upper/Lower Split (Current)</option>
                    <option>Push/Pull/Legs</option>
                    <option>Full Body 3x/week</option>
                    <option>Custom Plan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#444] uppercase tracking-widest block mb-2">Calorie Target</label>
                  <div className="flex rounded-xl overflow-hidden border border-[#1A1A1A] bg-[#080304] focus-within:border-[#2a2a2a] transition-colors">
                    <input type="number" defaultValue="2400" className="bg-transparent text-white px-4 py-3 outline-none flex-1 text-sm" />
                    <span className="flex items-center px-3 text-[#333] text-sm border-l border-[#1A1A1A]">kcal</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#444] uppercase tracking-widest block mb-2">Protein Target</label>
                  <div className="flex rounded-xl overflow-hidden border border-[#1A1A1A] bg-[#080304] focus-within:border-[#2a2a2a] transition-colors">
                    <input type="number" defaultValue="150" className="bg-transparent text-white px-4 py-3 outline-none flex-1 text-sm" />
                    <span className="flex items-center px-3 text-[#333] text-sm border-l border-[#1A1A1A]">g</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#444] uppercase tracking-widest block mb-2">Today's Note</label>
                  <textarea className="w-full bg-[#080304] border border-[#1A1A1A] focus:border-[#2a2a2a] rounded-xl px-4 py-3 text-[#888] text-sm outline-none resize-none transition-colors"
                    rows={2} placeholder="Push for 4 sets today..." />
                </div>
              </div>
              <button onClick={pushUpdate} className="btn-primary w-full py-3.5 rounded-xl text-sm font-normal">
                {planUpdated ? '✓ Plan Updated' : 'Push Update'}
              </button>
            </div>

            {/* Activity feed */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-5">Activity Feed</div>
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '340px' }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: a.iconBg, border: `1px solid ${a.iconBorder}` }}>
                      <Icon icon={a.icon} className="text-sm" style={{ color: a.iconColor }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-[#ccc]">{a.text}</div>
                      <div className="text-[10px] text-[#333] mt-0.5">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-1">Weight Trend</div>
                <div className="font-['Barlow_Condensed'] text-2xl text-white tracking-tight">92 → {activeClient.weight}</div>
              </div>
              <Link to="/progress" className="text-xs text-[#555] hover:text-white transition-colors flex items-center gap-1.5">
                Full view <Icon icon="solar:arrow-right-linear" className="text-sm" />
              </Link>
            </div>
            <svg viewBox="0 0 600 80" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#E63946', stopOpacity: 0.12 }} />
                  <stop offset="100%" style={{ stopColor: '#E63946', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {[20, 50].map(y => <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#161616" strokeWidth="1" />)}
              <path d="M20,10 L100,20 L200,30 L300,44 L400,54 L500,64 L570,70 L570,80 L20,80 Z" fill="url(#mg)" />
              <path d="M20,10 L100,20 L200,30 L300,44 L400,54 L500,64 L570,70" fill="none" stroke="#E63946" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="570" cy="70" r="3.5" fill="#E63946" />
            </svg>
            <div className="flex justify-between text-[10px] text-[#333] mt-1.5 uppercase tracking-wider">
              <span>Day 1 · 92 kg</span><span className="text-[#E63946]">Today · {activeClient.weight}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
