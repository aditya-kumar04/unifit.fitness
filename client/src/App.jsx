import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Calories from './pages/Calories'
import Progress from './pages/Progress'
import Booking from './pages/Booking'
import MentorPanel from './pages/MentorPanel'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/calories" element={<Calories />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/mentor" element={<MentorPanel />} />
    </Routes>
  )
}
