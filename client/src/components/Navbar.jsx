import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// variant: "public" (landing) | "app" (inner pages) | "onboarding"
export default function Navbar({ variant = 'app' }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const active = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
  }

  const getInitials = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
    }
    return user?.username?.[0]?.toUpperCase() || 'U'
  }

  const getUserName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`
    }
    return user?.username || 'User'
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#080304]/95 backdrop-blur-xl border-b border-[#161616]">
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-[#E63946] rounded-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Icon icon="solar:bolt-bold" className="text-white text-base" />
          </div>
          <span className="font-['Bebas_Neue'] text-xl tracking-wider text-white">UNIFIT</span>
        </Link>

        {/* Public nav links */}
        {variant === 'public' && (
          <>
            <div className="hidden md:flex items-center gap-8">
              <a href="#mentor" className="text-[#555] text-sm hover:text-[#ccc] transition-colors">Mentor</a>
              <a href="#how-it-works" className="text-[#555] text-sm hover:text-[#ccc] transition-colors">Process</a>
              <a href="#features" className="text-[#555] text-sm hover:text-[#ccc] transition-colors">Platform</a>
              <a href="#testimonials" className="text-[#555] text-sm hover:text-[#ccc] transition-colors">Results</a>
              <a href="#pricing" className="text-[#555] text-sm hover:text-[#ccc] transition-colors">Pricing</a>
              <div className="w-px h-4 bg-[#1e1e1e]" />
              <Link to="/dashboard" className="text-[#555] text-sm hover:text-[#ccc] transition-colors">Dashboard</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="hidden lg:block text-[#555] text-sm hover:text-white transition-colors px-3 py-2">Sign in</Link>
              <Link to="/onboarding" className="btn-primary text-sm px-5 py-2.5 rounded-lg font-normal">Join The Process</Link>
            </div>
          </>
        )}

        {/* Onboarding nav */}
        {variant === 'onboarding' && (
          <Link to="/" className="text-[#555] text-sm hover:text-white transition-colors flex items-center gap-1.5">
            <Icon icon="solar:arrow-left-linear" className="text-base" /> Back
          </Link>
        )}

        {/* App nav (inner pages) */}
        {variant === 'app' && (
          <>
            <div className="hidden md:flex items-center gap-6">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/chat', label: 'Chat' },
                { to: '/calories', label: 'Nutrition' },
                { to: '/progress', label: 'Progress' },
                { to: '/booking', label: 'Book' },
                { to: '/mentor', label: 'Mentor' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm transition-colors ${active(to) ? 'text-white border-b border-[#E63946] pb-0.5' : 'text-[#555] hover:text-[#ccc]'}`}
                >
                  {label}
                </Link>
              ))}
            </div>
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-[#E63946] flex items-center justify-center text-xs font-semibold text-white">
                  {getInitials()}
                </div>
                <span className="text-sm text-[#888] hidden lg:block">{getUserName()}</span>
                <Icon
                  icon="solar:chevron-down-linear"
                  className={`text-sm text-[#888] hidden lg:block transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#161616] border border-[#2a2a2a] rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-[#2a2a2a]">
                    <p className="text-sm font-medium text-white">{getUserName()}</p>
                    <p className="text-xs text-[#555]">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#ccc] hover:bg-[#1f1f1f] hover:text-white transition-colors"
                    >
                      <Icon icon="solar:home-linear" className="inline mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[#ccc] hover:bg-[#1f1f1f] hover:text-white transition-colors"
                    >
                      <Icon icon="solar:logout-linear" className="inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
