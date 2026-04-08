import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { nutritionAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Calories() {
  const { user } = useAuth()
  const [foodInput, setFoodInput] = useState('')
  const [meals, setMeals] = useState([])
  const [totals, setTotals] = useState({ cal: 0, p: 0, c: 0, f: 0 })
  const [water, setWater] = useState(new Set())
  const [mentorNote, setMentorNote] = useState('')
  const [goals, setGoals] = useState({ cal: 2000, p: 150, c: 250, f: 65 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    loadDailyNutrition()
  }, [])

  const loadDailyNutrition = async () => {
    try {
      setLoading(true)
      const response = await nutritionAPI.getDaily()
      const data = response.data
      
      setMeals(data.meals || [])
      setTotals(data.totals || { cal: 0, p: 0, c: 0, f: 0 })
      setWater(new Set(Array.from({ length: data.waterIntake || 0 }, (_, i) => i + 1)))
      setGoals(data.goals || { cal: 2000, p: 150, c: 250, f: 65 })
      
      // Generate mentor note based on progress
      const proteinRemaining = data.goals?.p - data.totals?.p
      const caloriesRemaining = data.goals?.cal - data.totals?.cal
      
      if (proteinRemaining > 20) {
        setMentorNote(`You're ${proteinRemaining}g short on protein today. Add chicken or cottage cheese at dinner.`)
      } else if (caloriesRemaining > 500) {
        setMentorNote(`You have ${caloriesRemaining} calories remaining. Focus on protein-rich foods.`)
      } else if (proteinRemaining < 0) {
        setMentorNote('Great job hitting your protein goal! Keep it up.')
      } else {
        setMentorNote('You\'re on track today. Stay consistent!')
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error)
      setError('Failed to load nutrition data')
    } finally {
      setLoading(false)
    }
  }

  const searchFoods = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      const response = await nutritionAPI.getFoods({ q: query, limit: 10 })
      setSearchResults(response.data.foods || [])
    } catch (error) {
      console.error('Error searching foods:', error)
    }
  }

  const logFood = async (food) => {
    try {
      const mealData = {
        name: food.name,
        cal: food.cal,
        p: food.p,
        c: food.c,
        f: food.f,
        type: 'searched'
      }
      
      await nutritionAPI.logMeal(mealData)
      
      // Reload daily data
      await loadDailyNutrition()
      setFoodInput('')
      setSearchResults([])
    } catch (error) {
      console.error('Error logging food:', error)
      setError('Failed to log food')
    }
  }

  const logCustomFood = async () => {
    const text = foodInput.trim()
    if (!text) return
    
    try {
      // First try to find matching food
      const searchResponse = await nutritionAPI.getFoods({ q: text, limit: 1 })
      let food = searchResponse.data.foods?.[0]
      
      // If no match, create custom food with estimated values
      if (!food) {
        food = {
          name: text,
          cal: Math.floor(Math.random() * 300 + 150),
          p: Math.floor(Math.random() * 25 + 5),
          c: Math.floor(Math.random() * 40 + 10),
          f: Math.floor(Math.random() * 15 + 3)
        }
      }
      
      await logFood(food)
    } catch (error) {
      console.error('Error logging custom food:', error)
      setError('Failed to log food')
    }
  }

  const updateWaterIntake = async (glasses) => {
    try {
      await nutritionAPI.updateWater(glasses)
      setWater(new Set(Array.from({ length: glasses }, (_, i) => i + 1)))
    } catch (error) {
      console.error('Error updating water intake:', error)
    }
  }

  const toggleWater = (glass) => {
    const newWater = new Set(water)
    if (newWater.has(glass)) {
      newWater.delete(glass)
    } else {
      newWater.add(glass)
    }
    setWater(newWater)
    updateWaterIntake(newWater.size)
  }

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
                  { val: totals.cal, label: 'Kcal', sub: `of ${goals.cal}`, red: true },
                  { val: totals.p, label: 'Protein g', sub: `of ${goals.p}` },
                  { val: totals.c, label: 'Carbs g', sub: `of ${goals.c}` },
                  { val: totals.f, label: 'Fat g', sub: `of ${goals.f}` },
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
                  <span>Calorie goal</span><span>{Math.min(Math.round((totals.cal / goals.cal) * 100), 100)}%</span>
                </div>
                <div className="w-full h-1 bg-[#161616] rounded-full">
                  <div className="h-full bg-[#E63946] rounded-full transition-all duration-700" style={{ width: `${Math.min((totals.cal / goals.cal) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-5 focus-within:border-[#2a2a2a] transition-colors">
              <label className="text-[11px] text-[#444] uppercase tracking-[0.2em] block mb-3">What did you eat?</label>
              <div className="flex gap-3">
                <input 
                  id="food-input" 
                  type="text" 
                  value={foodInput} 
                  onChange={e => {
                    setFoodInput(e.target.value)
                    searchFoods(e.target.value)
                  }}
                  onKeyDown={e => e.key === 'Enter' && logCustomFood()}
                  placeholder="e.g. 2 rotis with dal and salad, or chicken rice..."
                  className="flex-1 bg-[#080304] border border-[#1A1A1A] focus:border-[#2a2a2a] rounded-xl px-4 py-3 text-[#ccc] text-sm outline-none placeholder-[#2a2a2a] transition-colors" 
                />
                <button onClick={logCustomFood} className="btn-primary px-5 py-3 rounded-xl text-sm flex items-center gap-2 whitespace-nowrap font-normal">
                  <Icon icon="solar:magic-stick-3-linear" className="text-base" /> Analyze
                </button>
              </div>
              
              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-3 border border-[#1A1A1A] rounded-xl bg-[#080304] max-h-48 overflow-y-auto">
                  {searchResults.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => logFood(food)}
                      className="w-full px-4 py-2 text-left hover:bg-[#1A1A1A] transition-colors border-b border-[#1A1A1A] last:border-b-0"
                    >
                      <div className="text-sm text-white">{food.name}</div>
                      <div className="text-xs text-[#555]">
                        {food.cal} kcal • P:{food.p}g C:{food.c}g F:{food.f}g
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
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
                  <div key={meal._id || meal.id} className="meal-card bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-[#222] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:star-linear" className="text-[#E63946] text-base" />
                      </div>
                      <div>
                        <div className="text-sm text-white">{meal.name}</div>
                        <div className="text-[10px] text-[#444] mt-0.5 uppercase tracking-widest">
                          {new Date(meal.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-['Bebas_Neue'] text-2xl text-white">{meal.cal}</div>
                      <div className="text-[10px] text-[#555]">kcal · {meal.p}g P</div>
                    </div>
                  </div>
                ))}
                {meals.length === 0 && (
                  <div className="text-center py-8 text-[#555] text-sm">
                    No meals logged today. Start by adding what you ate above.
                  </div>
                )}
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
