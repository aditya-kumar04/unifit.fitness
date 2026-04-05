import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'

// variant: "public" (landing) | "app" (inner pages) | "onboarding"
export default function Navbar({ variant = 'app' }) {
  const location = useLocation()
  const active = (path) => location.pathname === path

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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E63946] flex items-center justify-center">
                <Icon icon="solar:user-linear" className="text-white text-sm" />
              </div>
              <span className="text-sm text-[#888] hidden lg:block">Rahul M.</span>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
