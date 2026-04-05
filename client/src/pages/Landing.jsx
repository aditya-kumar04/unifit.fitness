import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Landing() {
  const progressRef = useRef(null)

  useEffect(() => {
    // Scroll progress bar
    const bar = document.getElementById('progress-bar')
    const handleScroll = () => {
      if (!bar) return
      const scrollTop = window.scrollY
      const docHeight = document.body.scrollHeight - window.innerHeight
      bar.style.width = (scrollTop / docHeight * 100) + '%'
    }
    window.addEventListener('scroll', handleScroll)

    // Reveal on scroll
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
    els.forEach(el => observer.observe(el))

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="font-['DM_Sans'] bg-[#060203] text-[#F0F0F0] antialiased relative min-h-screen">
      <div id="progress-bar" />
      <Navbar variant="public" />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070"
            alt="Real Training"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.14) contrast(1.15)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #060203 45%, transparent 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #060203 15%, transparent 65%)' }} />
          <div className="absolute top-1/3 right-1/3 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col lg:flex-row items-center gap-20 py-28">
          <div className="max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 border border-[#1e1e1e] bg-[#0d0b0c] rounded-full px-4 py-1.5 mb-10">
              <div className="w-1.5 h-1.5 bg-[#E63946] rounded-full animate-pulse" />
              <span className="text-[11px] text-[#666] uppercase tracking-widest">Mentor-Led · 30-Day Program · Real Process</span>
            </div>

            <h1 className="font-['Anton'] text-[58px] md:text-[76px] lg:text-[86px] leading-[1.02] text-white mb-8 hero-quote">
              YOU DON'T NEED<br />
              MORE MOTIVATION.<br />
              <span className="text-[#E63946]">YOU NEED SOMEONE<br />WHO WON'T LET<br />YOU STOP.</span>
            </h1>

            <p className="text-[#555] text-base font-light leading-relaxed mb-10 max-w-lg">
              A structured system. A mentor who checks in every morning. Real biomechanics. 30 days that change how you see yourself.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/onboarding" id="hero-cta" className="btn-primary px-8 py-4 rounded-xl text-base font-normal inline-flex items-center gap-2.5">
                Join The Process <Icon icon="solar:arrow-right-bold" className="text-lg" />
              </Link>
              <a href="#mentor" className="btn-ghost px-8 py-4 rounded-xl text-base font-normal inline-flex items-center gap-2.5">
                Meet the Mentor
              </a>
            </div>

            <div className="flex items-center gap-8 mt-14 pt-10 border-t border-[#141414]">
              <div>
                <div className="font-['Anton'] text-4xl text-white">120<span className="text-[#E63946]">+</span></div>
                <div className="text-[#444] text-xs uppercase tracking-widest mt-0.5">Transformations</div>
              </div>
              <div className="w-px h-10 bg-[#181818]" />
              <div>
                <div className="font-['Anton'] text-4xl text-white">98<span className="text-[#E63946]">%</span></div>
                <div className="text-[#444] text-xs uppercase tracking-widest mt-0.5">Completion Rate</div>
              </div>
              <div className="w-px h-10 bg-[#181818]" />
              <div>
                <div className="font-['Anton'] text-4xl text-white">3<span className="text-[#E63946]">×</span></div>
                <div className="text-[#444] text-xs uppercase tracking-widest mt-0.5">National Awards</div>
              </div>
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <div className="bg-[#0c0a0b] border border-[#1a1a1a] rounded-2xl p-6 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#161616]">
                <div className="w-10 h-10 rounded-full bg-[#E63946] flex items-center justify-center text-white font-['Bebas_Neue'] text-lg flex-shrink-0">M</div>
                <div>
                  <div className="text-sm text-white font-normal">Your Mentor</div>
                  <div className="text-[#E63946] text-[10px] uppercase tracking-widest">Online now · Watching</div>
                </div>
                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              </div>
              <div className="bg-[#080405] border border-[#161616] rounded-xl p-4 mb-4">
                <p className="text-[#777] text-xs font-light leading-relaxed">"Wake up. Drink water. Tell me you're ready. I'll be watching your log today."</p>
                <div className="text-[#444] text-[10px] mt-2 text-right">Mentor · 6:01 AM</div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { done: true, label: 'Morning weigh-in', tag: 'Done' },
                  { done: false, label: 'Upper Body · 40 min', tag: 'Today' },
                  { done: false, label: 'Log dinner', tag: '6 PM' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${item.done ? 'bg-[#E63946] border-[#E63946]' : 'border-[#333]'}`}>
                        {item.done && <Icon icon="solar:check-read-linear" className="text-white text-[8px]" />}
                      </div>
                      <span className={`text-sm ${item.done ? 'text-[#555] line-through' : 'text-white'}`}>{item.label}</span>
                    </div>
                    <span className={`text-[10px] ${item.done ? 'text-[#E63946]' : 'text-[#555]'}`}>{item.tag}</span>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-[#444] uppercase tracking-widest mb-2">
                  <span>Day 14 of 30</span><span className="text-[#E63946]">47%</span>
                </div>
                <div className="h-1 w-full bg-[#181818] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E63946] rounded-full" style={{ width: '47%' }} />
                </div>
              </div>
              <Link to="/dashboard" className="w-full btn-primary py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                Open Dashboard <Icon icon="solar:arrow-right-linear" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="border-y border-[#111] bg-[#080405] py-4 overflow-hidden ticker-wrap">
        <div className="ticker-inner flex items-center gap-12 whitespace-nowrap" style={{ width: 'max-content' }}>
          {['120+ Real Transformations','National Award Winner','Biomechanics Expert','Daily Mentor Check-ins','No Polished Lies','Just The Process',
            '120+ Real Transformations','National Award Winner','Biomechanics Expert','Daily Mentor Check-ins','No Polished Lies','Just The Process'].map((t, i) => (
            <span key={i} className={i % 2 === 1 ? 'text-[#E63946] text-sm' : 'text-[#2a2a2a] text-xs uppercase tracking-[0.3em]'}>{i % 2 === 1 ? '·' : t}</span>
          ))}
        </div>
      </div>

      {/* MENTOR */}
      <section id="mentor" className="bg-[#060203] py-28 border-b border-[#111] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 reveal">
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-4">Behind the System</span>
            <h2 className="font-['Anton'] text-[54px] md:text-[70px] text-white leading-[1.0]">THE MENTOR.<br /><span className="text-[#222]">THE PROOF.</span></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="reveal-left space-y-4">
              <div className="relative bg-[#0d0b0c] border border-dashed border-[#222] rounded-2xl overflow-hidden flex flex-col items-center justify-center" style={{ minHeight: '420px' }}>
                <div className="flex flex-col items-center gap-3">
                  <Icon icon="solar:user-circle-bold" className="text-[#1e1e1e] text-[80px]" />
                  <div className="text-[#2a2a2a] text-xs uppercase tracking-widest">Mentor photo</div>
                </div>
                <div className="absolute top-0 left-0 w-14 h-14 pointer-events-none" style={{ background: 'linear-gradient(135deg,#E63946 0%,transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-[#060203] to-transparent pointer-events-none">
                  <div className="text-[#333] text-[10px] uppercase tracking-widest">Head Mentor · Biomechanics · Strength · Nutrition</div>
                </div>
              </div>
              <div className="bg-[#0d0b0c] border border-[#1a1a1a] rounded-xl px-6 py-5">
                <div className="border-l-2 border-[#E63946] pl-4">
                  <p className="text-[#666] text-sm font-light leading-relaxed">"I don't sell hope. I sell a process. Show up for 30 days and you will be different."</p>
                  <div className="text-[#333] text-[10px] uppercase tracking-widest mt-3">— Head Mentor, UNIFIT</div>
                </div>
              </div>
            </div>
            <div className="reveal-right space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[{ v: '120', l: 'People who\ntransformed' }, { v: '3+', l: 'National\nawards' }].map((s, i) => (
                  <div key={i} className="bg-[#0d0b0c] border border-[#1a1a1a] rounded-xl p-5">
                    <div className="font-['Anton'] text-4xl text-white">{s.v}<span className="text-[#E63946]">{i === 0 ? '+' : ''}</span></div>
                    <div className="text-[#444] text-xs uppercase tracking-widest mt-1 leading-relaxed whitespace-pre-line">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[#666] font-light leading-relaxed text-base">Real training is ugly. It's sweaty. It's hard. I got tired of seeing polished influencers lie about how they got their results.</p>
                <p className="text-[#444] font-light leading-relaxed text-sm">This system is built on biomechanics, not trends. Every workout is engineered. Every check-in is intentional. Every person who committed — changed.</p>
                <p className="text-[#E63946]/70 font-light text-sm italic">I don't sell hope. I sell a process.</p>
              </div>
              <Link to="/onboarding" className="btn-primary px-7 py-4 rounded-xl text-sm font-normal inline-flex items-center gap-2.5">
                Join The Process <Icon icon="solar:arrow-right-bold" className="text-base" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-[#060203] py-28 border-b border-[#111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center max-w-4xl mx-auto mb-24">
            <div className="quote-decor leading-none mb-0 text-left">"</div>
            <h2 className="font-['Barlow_Condensed'] text-[64px] md:text-[80px] text-white tracking-tight leading-[0.93] -mt-8">
              Motivation is a feeling.<br />
              <span className="text-[#E63946]">Systems are the truth.</span>
            </h2>
            <p className="text-[#555] font-light leading-relaxed text-lg mt-8 max-w-2xl mx-auto">
              UNIFIT is built around a single belief: a structured process, combined with a real human who checks in daily, is the only thing that produces lasting change.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: 'solar:target-bold', title: 'Goal-driven', desc: 'Every action is tied to your target. Nothing generic, nothing wasted.' },
              { icon: 'solar:user-speak-bold', title: 'Human-led', desc: 'A real mentor reviews your progress every single day. Not an algorithm.' },
              { icon: 'solar:shield-bold', title: 'Accountable', desc: "You can't ghost a mentor who messages you every morning asking for logs." },
              { icon: 'solar:graph-up-bold', title: 'Measurable', desc: 'Weight logs, photos, streaks — your progress is impossible to ignore.' },
            ].map((p, i) => (
              <div key={i} className="reveal bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-6 card" style={{ transitionDelay: `${i * 0.1}s` }}>
                <Icon icon={p.icon} className="text-[#E63946] text-2xl mb-5 block" />
                <div className="text-white mb-2 font-['Barlow_Condensed'] tracking-tight text-2xl">{p.title}</div>
                <div className="text-[#444] text-xs font-light leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#060203] py-28 border-b border-[#111]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16 reveal">
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-5">The Process</span>
            <h2 className="font-['Barlow_Condensed'] text-6xl text-white tracking-tight leading-none">Three steps.<br /><span className="text-[#333]">No excuses.</span></h2>
          </div>
          <div className="space-y-3">
            {[
              { n: '01', title: 'Join & get assessed', desc: "Complete a 3-minute onboarding. Goals, weight, schedule, history. We build from truth — not what you wish was true." },
              { n: '02', title: 'Meet Parth', desc: "Parth reviews your profile, schedules your first call, and builds your personal 30-day system. Not a template — a plan that fits your body, your schedule, your blocks." },
              { n: '03', title: 'Execute daily', desc: "Log meals. Tick workouts. Talk to Parth. Every day the graph moves. Every day your body follows. By day 30, you will be different." },
            ].map((s, i) => (
              <div key={i} className="reveal bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-8 md:p-10 flex gap-10 items-start card">
                <span className="font-['Bebas_Neue'] text-7xl text-[#1a1a1a] leading-none flex-shrink-0">{s.n}</span>
                <div>
                  <h3 className="font-['Barlow_Condensed'] text-4xl text-white tracking-tight mb-3">{s.title}</h3>
                  <p className="text-[#555] font-light leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-[#060203] py-28 border-b border-[#111]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16 reveal">
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-5">Platform</span>
            <h2 className="font-['Barlow_Condensed'] text-6xl text-white tracking-tight leading-none">Everything you need.<br /><span className="text-[#333]">Nothing you don't.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="reveal md:col-span-2 bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-8 card">
              <Icon icon="solar:chat-round-line-linear" className="text-[#E63946] text-2xl mb-5 block" />
              <h4 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight mb-3">Mentor Chat with Parth</h4>
              <p className="text-[#555] text-sm font-light leading-relaxed mb-6">Direct line to Parth. Voice notes. Quick replies. Every check-in is logged, reviewed, and remembered.</p>
              <div className="bg-[#080405] border border-[#161616] rounded-xl p-4">
                <div className="flex gap-3 justify-end mb-3">
                  <div className="bg-[#E63946] text-white text-xs px-3 py-2 rounded-xl rounded-tr-none max-w-[180px]">Done. Felt strong today.</div>
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-6 h-6 bg-[#E63946] rounded-full flex-shrink-0 flex items-center justify-center text-[9px] text-white font-bold">PP</div>
                  <div className="bg-[#161616] text-[#999] text-xs px-3 py-2 rounded-xl rounded-tl-none max-w-[210px]">Good. Hydrate and hit your protein. Video call tomorrow at 10?</div>
                </div>
              </div>
            </div>
            <div className="reveal bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-8 card">
              <Icon icon="solar:health-linear" className="text-[#E63946] text-2xl mb-5 block" />
              <h4 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight mb-3">AI Calorie Tracker</h4>
              <p className="text-[#555] text-sm font-light leading-relaxed mb-6">Type what you ate. Calories and macros appear instantly. No apps. No scanning.</p>
              <div className="bg-[#080405] border border-[#161616] rounded-xl p-4 text-center">
                <div className="font-['Bebas_Neue'] text-5xl text-white mb-1">1820</div>
                <div className="text-[10px] text-[#444] uppercase tracking-widest mb-1">Kcal logged</div>
                <div className="text-xs text-[#E63946]">89g protein · on track</div>
              </div>
            </div>
            <div className="reveal bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-8 card">
              <Icon icon="solar:chart-square-linear" className="text-[#E63946] text-2xl mb-5 block" />
              <h4 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight mb-3">Progress Tracking</h4>
              <p className="text-[#555] text-sm font-light leading-relaxed">Weight graph + weekly photos. Progress lives on screen. Denial doesn't survive data.</p>
            </div>
            <div className="reveal md:col-span-2 bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-8 card">
              <Icon icon="solar:calendar-date-linear" className="text-[#E63946] text-2xl mb-5 block" />
              <h4 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight mb-3">Weekly Strategy Calls</h4>
              <p className="text-[#555] text-sm font-light leading-relaxed mb-6">Book video sessions with Parth directly from the app. One click. No email back-and-forth.</p>
              <div className="flex gap-2 flex-wrap">
                <div className="border border-[#E63946] bg-[#E63946]/10 text-[#E63946] text-xs px-4 py-2 rounded-lg">Apr 4 · 11:00 AM — Confirmed</div>
                <div className="border border-[#1a1a1a] text-[#444] text-xs px-4 py-2 rounded-lg">Apr 11 · Book Now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-[#060203] py-28 border-b border-[#111]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16 reveal">
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-5">Results</span>
            <h2 className="font-['Barlow_Condensed'] text-6xl text-white tracking-tight">Real people.<br /><span className="text-[#333]">Real outcomes.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { initials: 'MT', name: 'Marcus T.', quote: '"The daily texts from Parth kept me going. I\'ve tried 10 different apps — having a human actually check if I did my workout is a different universe. Down 6kg in 30 days."' },
              { initials: 'SL', name: 'Sarah L.', quote: '"Lost 5kg. The AI tracker is stupid simple — I just type \'chicken and rice\' and it does the math. The weekly calls fixed my entire deadlift form. Zero fluff."' },
              { initials: 'DC', name: 'David C.', quote: '"Dashboard is zero clutter. I wake up, see my plan, execute. When someone is watching your progress graph every day, quitting becomes harder than just doing the work."' },
            ].map((t, i) => (
              <div key={i} className="reveal bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl p-8 card flex flex-col" style={{ transitionDelay: `${i * 0.1}s` }}>
                <p className="text-[#777] font-light leading-relaxed text-sm flex-grow mb-8">{t.quote}</p>
                <div className="flex items-center gap-3 pt-6 border-t border-[#161616]">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-xs text-[#555]">{t.initials}</div>
                  <div>
                    <div className="text-xs text-white">{t.name}</div>
                    <div className="text-[#E63946] text-[10px] uppercase tracking-widest">Completed 30 Days</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-[#060203] py-28 border-b border-[#111]">
        <div className="max-w-lg mx-auto px-6">
          <div className="mb-12 text-center reveal">
            <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-5">Pricing</span>
            <h2 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight">One plan. Clear price.<br /><span className="text-[#333]">No hidden anything.</span></h2>
          </div>
          <div className="reveal bg-[#0d0b0c] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
            <div className="px-8 pt-8 pb-6 border-b border-[#161616]">
              <div className="text-sm text-[#555] mb-3">30-Day Full Mentorship Access</div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Bebas_Neue'] text-6xl text-white tracking-tight">₹4999</span>
                <span className="text-[#444] text-sm">/ 30 days</span>
              </div>
              <p className="text-[#444] text-xs mt-3 font-light">Parth Pandey's personal mentorship + full platform. No hidden fees.</p>
            </div>
            <div className="px-8 py-6">
              <ul className="space-y-4 mb-8">
                {['Direct access to Parth Pandey','Daily chat accountability check-ins','AI calorie & macro tracker','4 weekly video strategy calls','Progress photo & weight dashboard','Custom workout + nutrition plan'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#777]">
                    <Icon icon="solar:check-circle-linear" className="text-[#E63946] text-base flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" id="pricing-cta" className="btn-primary w-full py-4 rounded-xl text-base flex items-center justify-center gap-2.5">
                Join The Process — ₹4999 <Icon icon="solar:arrow-right-linear" className="text-base" />
              </Link>
              <p className="text-[#333] text-xs text-center mt-4">Cancel anytime. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-[#080405] py-28 border-b border-[#111] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(230,57,70,0.05) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto px-6 text-center reveal relative z-10">
          <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-6">The Last Signup Screen You'll Need</span>
          <h2 className="font-['Barlow_Condensed'] text-[64px] md:text-[80px] text-white tracking-tight leading-[0.93] mb-6">
            Stop scrolling.<br /><span className="text-[#E63946]">Start the process.</span>
          </h2>
          <p className="text-[#555] font-light mb-12 text-lg max-w-xl mx-auto">
            The only thing between you and the version of yourself you actually respect is 30 committed days and a mentor who won't let you stop.
          </p>
          <Link to="/onboarding" id="final-cta" className="btn-primary px-12 py-5 rounded-xl text-base inline-flex items-center gap-3">
            Join The Process <Icon icon="solar:arrow-right-bold" className="text-lg" />
          </Link>
          <div className="text-[#333] text-xs uppercase tracking-widest mt-6">30 days · ₹4999 · Parth watches</div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
