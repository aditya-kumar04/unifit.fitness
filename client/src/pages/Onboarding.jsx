import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [activeDays, setActiveDays] = useState(new Set(['Wed', 'Fri']))
  const [level, setLevel] = useState('Beginner')

  const toggleDay = (day) => {
    setActiveDays(prev => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })
  }

  const goals = [
    { id: 'fat-loss', icon: 'solar:fire-linear', title: 'Fat Loss', desc: 'Burn fat. Get lean. Feel lighter every week.' },
    { id: 'muscle-gain', icon: 'solar:dumbell-large-minimalistic-linear', title: 'Muscle Gain', desc: 'Build strength. Add size. Earn it daily.' },
    { id: 'consistency', icon: 'solar:calendar-check-linear', title: 'Consistency', desc: 'Start small. Keep showing up. Change follows.' },
  ]

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased min-h-screen selection:bg-[#E63946] selection:text-white">
      <Navbar variant="onboarding" />

      <main className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6 relative z-10">
        <div className="w-full max-w-xl">
          {/* Progress bars */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 h-px transition-all duration-500"
                style={{ background: i <= step ? '#E63946' : '#222' }} />
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between mb-12 text-[10px] uppercase tracking-[0.2em]">
            {['Goal', 'Profile', 'Mentor'].map((l, i) => (
              <span key={l} style={{ color: i + 1 <= step ? '#E63946' : '#444' }}>{l}</span>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="step-panel active">
              <div className="mb-10">
                <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-4">Step 1 of 3</span>
                <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight mb-3">What's your primary goal?</h1>
                <p className="text-[#555] font-light text-sm">Your mentor will build your entire plan around this. Be honest.</p>
              </div>
              <div className="space-y-3 mb-8">
                {goals.map(g => {
                  const sel = selectedGoal === g.id
                  return (
                    <div key={g.id} onClick={() => setSelectedGoal(g.id)} style={{ borderColor: sel ? '#E63946' : '#1A1A1A', background: sel ? '#1a0809' : '#0D0B0C' }}
                      className="rounded-2xl p-6 flex items-center gap-5 cursor-pointer border transition-all duration-200 hover:-translate-y-px">
                      <div style={{ background: sel ? '#E63946' : '#161616', borderColor: sel ? '#E63946' : '#222' }}
                        className="w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-200">
                        <Icon icon={g.icon} className={`text-xl ${sel ? 'text-white' : 'text-[#E63946]'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-base font-normal mb-0.5">{g.title}</div>
                        <div className="text-[#555] text-sm font-light">{g.desc}</div>
                      </div>
                      <div style={{ background: sel ? '#E63946' : '', borderColor: sel ? '#E63946' : '#333' }}
                        className="w-5 h-5 rounded-full border flex-shrink-0 transition-all duration-200 flex items-center justify-center">
                        {sel && <Icon icon="solar:check-read-linear" className="text-white text-[8px]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2.5 font-normal">
                Continue <Icon icon="solar:arrow-right-linear" className="text-base" />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="step-panel active">
              <div className="mb-10">
                <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-4">Step 2 of 3</span>
                <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight mb-3">Tell us about yourself.</h1>
                <p className="text-[#555] font-light text-sm">Your mentor needs this to build your exact protocol.</p>
              </div>
              <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl divide-y divide-[#161616] mb-6">
                {[
                  { label: 'Current weight', placeholder: '75', unit: 'KG' },
                  { label: 'Target weight', placeholder: '68', unit: 'KG' },
                  { label: 'Height', placeholder: '175', unit: 'CM' },
                ].map(f => (
                  <div key={f.label} className="p-5">
                    <label className="text-[11px] text-[#555] uppercase tracking-[0.2em] block mb-3">{f.label}</label>
                    <div className="flex rounded-xl overflow-hidden border border-[#1A1A1A] bg-[#080304] focus-within:border-[#E63946] transition-colors">
                      <input type="number" placeholder={f.placeholder} className="bg-transparent text-white font-['Bebas_Neue'] text-4xl px-5 py-3 outline-none w-full placeholder-[#222]" />
                      <span className="flex items-center px-4 text-[#444] text-sm border-l border-[#161616]">{f.unit}</span>
                    </div>
                  </div>
                ))}
                <div className="p-5">
                  <label className="text-[11px] text-[#555] uppercase tracking-[0.2em] block mb-3">Training days per week</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS.map(day => {
                      const active = activeDays.has(day)
                      return (
                        <button key={day} onClick={() => toggleDay(day)}
                          style={{
                            borderColor: active ? '#E63946' : '#1A1A1A',
                            background: active ? 'rgba(230,57,70,0.1)' : '#080304',
                            color: active ? '#E63946' : '#555',
                          }}
                          className="day-btn h-10 rounded-lg border text-xs transition-all hover:border-[#333] hover:text-[#888]">
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="p-5">
                  <label className="text-[11px] text-[#555] uppercase tracking-[0.2em] block mb-3">Experience level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(l => {
                      const sel = level === l
                      return (
                        <button key={l} onClick={() => setLevel(l)}
                          style={{
                            borderColor: sel ? '#E63946' : '#1A1A1A',
                            background: sel ? 'rgba(230,57,70,0.1)' : '',
                            color: sel ? '#E63946' : '#555',
                          }}
                          className="level-btn h-10 rounded-lg border text-xs transition-all hover:border-[#333] hover:text-[#888]">
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                  <Icon icon="solar:arrow-left-linear" /> Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-[3] py-4 rounded-xl text-sm flex items-center justify-center gap-2.5 font-normal">
                  Continue <Icon icon="solar:arrow-right-linear" className="text-base" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="step-panel active">
              <div className="mb-10">
                <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-4">Step 3 of 3</span>
                <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight mb-3">You've been assigned.</h1>
                <p className="text-[#555] font-light text-sm">Your mentor is waiting. Your 30 days begin now.</p>
              </div>
              <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl overflow-hidden mb-6">
                <div className="border-b border-[#161616] px-6 py-5 flex items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#E63946] flex items-center justify-center">
                      <Icon icon="solar:user-linear" className="text-white text-2xl" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#22c55e] rounded-full border-2 border-[#0D0B0C]" />
                  </div>
                  <div>
                    <div className="text-white font-normal">Coach Arjun Singh</div>
                    <div className="text-[#E63946] text-[11px] uppercase tracking-[0.15em] mt-0.5">Your Personal Mentor</div>
                    <div className="text-[#555] text-xs font-light mt-1">5 years · 200+ transformations · NASM Certified</div>
                  </div>
                </div>
                <div className="px-6 py-5 border-b border-[#161616]">
                  <div className="bg-[#080304] border border-[#161616] rounded-xl p-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-[#E63946] rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0">A</div>
                      <div className="bg-[#161616] text-[#ccc] text-sm px-4 py-3 rounded-xl rounded-tl-none leading-relaxed">
                        Hey! I've reviewed your goal. Let's do a quick call tomorrow to build your custom plan. You won't do this alone.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-[#161616]">
                  {[['30', 'Days'], ['Daily', 'Check-ins'], ['4×', 'Calls/Month']].map(([v, l]) => (
                    <div key={l} className="px-5 py-4 text-center">
                      <div className="font-['Bebas_Neue'] text-3xl text-white mb-0.5">{v}</div>
                      <div className="text-[10px] text-[#555] uppercase tracking-widest">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2.5 font-normal">
                Enter my dashboard <Icon icon="solar:arrow-right-linear" className="text-base" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
