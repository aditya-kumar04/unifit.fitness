import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { workoutAPI, userAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [workoutsResponse, streakResponse] = await Promise.all([
        workoutAPI.getDailyWorkouts(),
        userAPI.getStreak()
      ])
      
      setWorkouts(workoutsResponse.data.workouts || [])
      setStreak(streakResponse.data.currentStreak || 0)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (workoutId, exerciseIndex, currentDone) => {
    try {
      await workoutAPI.completeExercise(workoutId, exerciseIndex, !currentDone)
      
      // Update local state
      setWorkouts(prev => prev.map(workout => {
        if (workout.id === workoutId) {
          const updatedExercises = [...workout.exercises]
          updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            done: !currentDone
          }
          return { ...workout, exercises: updatedExercises }
        }
        return workout
      }))
    } catch (error) {
      console.error('Error updating exercise:', error)
      setError('Failed to update exercise')
    }
  }

  const markComplete = () => {
    setCompleted(true)
    setTimeout(() => setCompleted(false), 3000)
  }

  // Transform workouts to task format
  const tasks = workouts.flatMap(workout => 
    workout.exercises.map((exercise, index) => ({
      id: `${workout.id}-${index}`,
      workoutId: workout.id,
      exerciseIndex: index,
      label: exercise.label,
      tag: exercise.tag,
      done: exercise.done
    }))
  )

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased min-h-screen selection:bg-[#E63946] selection:text-white">
      <Navbar variant="app" />

      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4 fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#E63946] text-[11px] uppercase tracking-[0.2em]">Day 12 of 30</span>
              <div className="w-px h-3 bg-[#333]" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                <span className="text-[11px] text-[#555]">Coach Arjun is online</span>
              </div>
            </div>
            <h1 className="font-['Barlow_Condensed'] text-5xl text-white tracking-tight">Good morning, {user?.profile?.firstName || user?.username}.</h1>
            <p className="text-[#555] font-light mt-1.5 text-sm">Your mentor left a note. Stay focused today.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#E63946] rounded-full self-center mt-1" />
            <span className="text-xs text-[#444] self-center font-light">{streak} day streak</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* TODAY'S FOCUS */}
          <div className="lg:col-span-2 bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="border-b border-[#161616] px-7 py-5 flex items-center justify-between">
              <div>
                <div className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] mb-1">Today's Focus</div>
                <h2 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight">Upper Body Hypertrophy</h2>
              </div>
              <div className="border border-[#1A1A1A] rounded-lg px-3 py-1.5 text-xs text-[#666]">45 min</div>
            </div>

            {/* Mentor note */}
            <div className="px-7 py-4 border-b border-[#161616]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#E63946] rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 mt-0.5">A</div>
                <div>
                  <div className="text-[10px] text-[#E63946] uppercase tracking-widest mb-1">Coach Arjun</div>
                  <p className="text-[#888] text-sm font-light leading-relaxed">Hit 4 sets of bench today. Rest 60s between sets. You're stronger than last week — push the last set.</p>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="divide-y divide-[#0F0D0E]">
              {tasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task.workoutId, task.exerciseIndex, task.done)} className="task-row px-7 py-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div style={{
                      background: task.done ? '#E63946' : '',
                      borderColor: task.done ? '#E63946' : '#2a2a2a',
                    }} className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200">
                      {task.done && <Icon icon="solar:check-read-linear" className="text-white text-[9px]" />}
                    </div>
                    <span className={`text-sm ${task.done ? 'text-[#444] line-through' : 'text-white'}`}>{task.label}</span>
                  </div>
                  <span style={{ color: task.done ? '#E63946' : '#444' }} className="text-xs">
                    {task.done ? 'Done' : task.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-7 py-5">
              <button onClick={markComplete}
                style={{ background: completed ? '#16a34a' : '' }}
                className="btn-primary w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2.5 font-normal">
                {completed
                  ? <><Icon icon="solar:check-circle-bold" className="text-base" /> Session Complete — Great work!</>
                  : <><span>Mark session as complete</span> <Icon icon="solar:check-circle-linear" className="text-base" /></>
                }
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-5">
            {/* Progress ring */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6 flex flex-col items-center fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] mb-4 self-start">Day Progress</div>
              <div className="relative w-36 h-36 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="#161616" strokeWidth="10" />
                  <circle cx="80" cy="80" r="68" fill="none" stroke="#E63946" strokeWidth="10" strokeLinecap="round"
                    style={{ strokeDasharray: 427, strokeDashoffset: 107 }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-['Bebas_Neue'] text-4xl text-white">75%</div>
                  <div className="text-[10px] text-[#555] uppercase tracking-widest">Complete</div>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-3">
                {[['1820', 'Kcal'], ['89g', 'Protein']].map(([v, l]) => (
                  <div key={l} className="bg-[#080304] border border-[#161616] rounded-xl p-3 text-center">
                    <div className="font-['Bebas_Neue'] text-2xl text-white">{v}</div>
                    <div className="text-[10px] text-[#555] uppercase tracking-widest">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl divide-y divide-[#161616] fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="px-5 py-3.5">
                <div className="text-[11px] text-[#444] uppercase tracking-[0.2em]">Quick Actions</div>
              </div>
              {[
                { to: '/calories', icon: 'solar:health-linear', label: 'Log Food' },
                { to: '/chat', icon: 'solar:chat-round-dots-linear', label: 'Message Mentor', badge: 2 },
                { to: '/booking', icon: 'solar:calendar-date-linear', label: 'Book Session' },
                { to: '/progress', icon: 'solar:chart-square-linear', label: 'View Progress' },
              ].map(({ to, icon, label, badge }) => (
                <Link key={to} to={to} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <Icon icon={icon} className="text-[#E63946] text-base" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#888] group-hover:text-white transition-colors">{label}</span>
                      {badge && <div className="w-4 h-4 bg-[#E63946] rounded-full text-[9px] text-white flex items-center justify-center">{badge}</div>}
                    </div>
                  </div>
                  <Icon icon="solar:arrow-right-linear" className="text-[#333] text-sm group-hover:text-[#666] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Streak */}
          <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6 fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] mb-4">Current Streak</div>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="font-['Bebas_Neue'] text-5xl text-white">8</span>
              <span className="text-[#555] text-sm">days in a row</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="w-7 h-7 rounded-md"
                  style={{ background: i < 8 ? '#E63946' : '#161616', border: i >= 8 ? '1px solid #222' : 'none' }} />
              ))}
            </div>
          </div>

          {/* Weight trend */}
          <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6 fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] mb-4">Weight This Week</div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-['Bebas_Neue'] text-5xl text-white">89.2</span>
              <span className="text-[#555] text-sm">kg</span>
              <span className="text-[#22c55e] text-xs flex items-center gap-0.5 ml-1">
                <Icon icon="solar:arrow-down-linear" className="text-xs" />−0.8 this week
              </span>
            </div>
            <div className="h-10 flex items-end gap-1">
              {[80, 72, 65, 58, 52, 46, 44].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 5 ? '#E63946' : i === 6 ? 'transparent' : i >= 3 ? '#3a2020' : '#1A1A1A',
                    border: i === 6 ? '1px dashed #222' : 'none',
                  }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#333] uppercase tracking-wider mt-1.5">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                <span key={d} style={{ color: i === 5 ? '#E63946' : '#333' }}>{d}</span>
              ))}
            </div>
          </div>

          {/* Diet note */}
          <div className="bg-[#0D0B0C] border border-[#1A1A1A] rounded-2xl p-6 fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-[#E63946] text-[11px] uppercase tracking-[0.2em] mb-4">Today's Diet Note</div>
            <div className="bg-[#080304] border border-[#161616] rounded-xl p-4 mb-4">
              <p className="text-[#777] text-sm font-light leading-relaxed">"High protein today. 150g minimum. Skip sugar post-workout. Drink 3L of water."</p>
              <div className="text-[10px] text-[#E63946] uppercase tracking-widest mt-3">— Coach Arjun</div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#555]">Protein</span>
                <span className="text-[#888]">89g / 150g</span>
              </div>
              <div className="w-full h-1 bg-[#161616] rounded-full">
                <div className="h-full bg-[#E63946] rounded-full" style={{ width: '59%' }} />
              </div>
              <div className="text-right text-[10px] text-[#444] mt-1.5">61g left to go</div>
            </div>
          </div>
        </div>
      </main>

      <Footer minimal />
    </div>
  )
}
