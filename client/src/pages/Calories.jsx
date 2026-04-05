import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FOODS = {
  chicken: { name: 'Chicken Breast (150g)', cal: 200, p: 38, c: 0, f: 5 },
  rice: { name: 'Steamed Rice (1 cup)', cal: 206, p: 4, c: 45, f: 0 },
  dal: { name: 'Dal (1 bowl)', cal: 180, p: 12, c: 30, f: 2 },
  roti: { name: 'Wheat Roti (2 pcs)', cal: 160, p: 5, c: 33, f: 2 },
  egg: { name: 'Boiled Eggs (2)', cal: 156, p: 13, c: 1, f: 11 },
  oats: { name: 'Oats (70g)', cal: 250, p: 9, c: 45, f: 5 },
  banana: { name: 'Banana (1 medium)', cal: 105, p: 1, c: 27, f: 0 },
  protein: { name: 'Whey Protein Shake', cal: 150, p: 30, c: 5, f: 2 },
  tikka: { name: 'Chicken Tikka (200g)', cal: 336, p: 40, c: 10, f: 15 },
  almonds: { name: 'Almonds (30g)', cal: 174, p: 6, c: 6, f: 15 },
  toast: { name: 'Brown Toast (2 slices)', cal: 140, p: 5, c: 26, f: 2 },
  milk: { name: 'Milk (250ml)', cal: 150, p: 8, c: 12, f: 8 },
}

const INITIAL_MEALS = [
  { id: 1, icon: 'solar:sun-2-linear', name: 'Oats with milk + banana', label: 'Breakfast · 8:00 AM', cal: 420, p: 22 },
  { id: 2, icon: 'solar:clock-circle-linear', name: 'Chicken tikka 200g + roti × 2', label: 'Lunch · 1:30 PM', cal: 680, p: 46 },
  { id: 3, icon: 'solar:dumbbell-large-2-linear', name: 'Whey protein shake + almonds', label: 'Post-Workout · 4:00 PM', cal: 280, p: 28 },
]

export default function Calories() {
  const [foodInput, setFoodInput] = useState('')
  const [meals, setMeals] = useState(INITIAL_MEALS)
  const [totals, setTotals] = useState({ cal: 1820, p: 89, c: 210, f: 52 })
  const [water, setWater] = useState(new Set([1, 2, 3, 4, 5, 6]))
  const [mentorNote, setMentorNote] = useState("You're 61g short on protein today. Add chicken or cottage cheese at dinner. Calories look good.")

  const logFood = () => {
    const text = foodInput.trim().toLowerCase()
    if (!text) return
    let match = null
    for (const k in FOODS) { if (text.includes(k)) { match = FOODS[k]; break } }
    if (!match) match = {
      name: foodInput.charAt(0).toUpperCase() + foodInput.slice(1),
      cal: Math.floor(Math.random() * 300 + 150),
      p: Math.floor(Math.random() * 25 + 5),
      c: Math.floor(Math.random() * 40 + 10),
      f: Math.floor(Math.random() * 15 + 3),
    }
    const newTotals = { cal: totals.cal + match.cal, p: totals.p + match.p, c: totals.c + match.c, f: totals.f + match.f }
    setTotals(newTotals)
    setMeals(prev => [{ id: Date.now(), icon: 'solar:star-linear', name: match.name, label: 'Just added', cal: match.cal, p: match.p }, ...prev])
    const rem = 150 - newTotals.p
    setMentorNote(rem > 0 ? `You're ${rem}g short on protein. Add lean meat or cottage cheese to your next meal.` : 'Protein target hit! Great work. Focus on hydration for the rest of the day.')
    setFoodInput('')
  }

  const toggleWater = (n) => {
    setWater(prev => { const next = new Set(prev); next.has(n) ? next.delete(n) : next.add(n); return next })
  }

  const calPct = Math.min(Math.round(totals.cal / 24), 100)

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased min-h-screen selection:bg-[#E63946] selection:text-white">
      <Navbar variant="app" />
      <main className="pt-24 pb-16 px-6 max-w-6xl mx-auto relative z-10">
        <div className="mb-10">
          <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] block mb-3">AI Nutrition</span>
          <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight">Calorie Tracker</h1>
          <p className="text-[#555] font-light mt-1.5 text-sm">Just type what you ate. We handle the rest.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            {/* Summary bar */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl overflow-hidden">
              <div className="border-b border-[#161616] px-6 py-4">
                <div className="text-[11px] text-[#444] uppercase tracking-[0.2em]">Today's Summary</div>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#161616]">
                {[
                  { val: totals.cal, label: 'Kcal', sub: 'of 2400', red: true },
                  { val: totals.p, label: 'Protein g', sub: 'of 150' },
                  { val: totals.c, label: 'Carbs g', sub: 'of 280' },
                  { val: totals.f, label: 'Fat g', sub: 'of 70' },
                ].map(({ val, label, sub, red }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <div className="font-['Bebas_Neue'] text-4xl text-white">{val}</div>
                    <div className={`text-[10px] uppercase tracking-widest mt-0.5 ${red ? 'text-[#E63946]' : 'text-[#555]'}`}>{label}</div>
                    <div className="text-[10px] text-[#333] mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4">
                <div className="flex justify-between text-xs text-[#555] mb-2">
                  <span>Calorie goal</span><span>{calPct}%</span>
                </div>
                <div className="w-full h-1 bg-[#161616] rounded-full">
                  <div className="h-full bg-[#E63946] rounded-full transition-all duration-700" style={{ width: `${calPct}%` }} />
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5 focus-within:border-[#2a2a2a] transition-colors">
              <label className="text-[11px] text-[#444] uppercase tracking-[0.2em] block mb-3">What did you eat?</label>
              <div className="flex gap-3">
                <input id="food-input" type="text" value={foodInput} onChange={e => setFoodInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && logFood()}
                  placeholder="e.g. 2 rotis with dal and salad, or chicken rice..."
                  className="flex-1 bg-[#080304] border border-[#1A1A1A] focus:border-[#2a2a2a] rounded-xl px-4 py-3 text-[#ccc] text-sm outline-none placeholder-[#2a2a2a] transition-colors" />
                <button onClick={logFood} className="btn-primary px-5 py-3 rounded-xl text-sm flex items-center gap-2 whitespace-nowrap font-normal">
                  <Icon icon="solar:magic-stick-3-linear" className="text-base" /> Analyze
                </button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[
                  ['Chicken + Rice', 'Chicken tikka with rice'],
                  ['Protein Shake', 'Protein shake with banana'],
                  ['Eggs + Toast', '2 boiled eggs and brown toast'],
                  ['Dal Rice', 'Dal rice and salad'],
                ].map(([label, val]) => (
                  <button key={label} onClick={() => setFoodInput(val)}
                    className="border border-[#1A1A1A] hover:border-[#333] text-[#555] hover:text-[#888] text-[11px] px-3 py-1.5 rounded-full transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal log */}
            <div>
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-3">Today's Log</div>
              <div id="meal-log" className="space-y-2">
                {meals.map(meal => (
                  <div key={meal.id} className="meal-card bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-[#222] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                        <Icon icon={meal.icon} className="text-[#E63946] text-base" />
                      </div>
                      <div>
                        <div className="text-sm text-white">{meal.name}</div>
                        <div className="text-[10px] text-[#444] mt-0.5 uppercase tracking-widest">{meal.label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-['Bebas_Neue'] text-2xl text-white">{meal.cal}</div>
                      <div className="text-[10px] text-[#555]">kcal · {meal.p}g P</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Mentor note */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl overflow-hidden">
              <div className="border-b border-[#161616] px-5 py-3.5 flex items-center gap-3">
                <div className="w-6 h-6 bg-[#E63946] rounded-full flex items-center justify-center text-[10px] text-white">A</div>
                <div>
                  <div className="text-xs text-white">Coach's Note</div>
                  <div className="text-[10px] text-[#E63946] uppercase tracking-widest">Today</div>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-[#777] text-sm font-light leading-relaxed">{mentorNote}</p>
              </div>
            </div>

            {/* Macro split */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-4">Macro Split</div>
              <div className="space-y-4">
                {[
                  { label: 'Protein', val: totals.p, max: 150, color: '#E63946' },
                  { label: 'Carbohydrates', val: totals.c, max: 280, color: '#4A90D9' },
                  { label: 'Fat', val: totals.f, max: 70, color: '#F59E0B' },
                ].map(({ label, val, max, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#888]">{label}</span>
                      <span className="text-[#555]">{val}g / {max}g</span>
                    </div>
                    <div className="w-full h-1 bg-[#161616] rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(Math.round(val / max * 100), 100)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water tracker */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5">
              <div className="text-[11px] text-[#444] uppercase tracking-[0.2em] mb-4">Water Intake</div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="font-['Bebas_Neue'] text-4xl text-white">{water.size}</span>
                <span className="text-[#555] text-sm">/ 10 glasses · 3L goal</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                  const filled = water.has(n)
                  return (
                    <div key={n} onClick={() => toggleWater(n)}
                      className="h-9 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                      style={{
                        background: filled ? 'rgba(74,144,217,0.2)' : '',
                        border: filled ? '1px solid rgba(74,144,217,0.5)' : '1px solid #1A1A1A',
                      }}>
                      <Icon icon="solar:drop-linear" className="text-sm" style={{ color: filled ? '#4A90D9' : '#333' }} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer minimal />
    </div>
  )
}
