import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'

export default function Footer({ minimal = false }) {
  if (minimal) {
    return (
      <footer className="bg-[#050102] border-t border-[#111] pt-8 pb-6 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#E63946] rounded-md flex items-center justify-center">
              <Icon icon="solar:bolt-bold" className="text-white text-sm" />
            </div>
            <span className="font-['Bebas_Neue'] text-lg tracking-wider text-white">UNIFIT</span>
          </Link>
          <div className="flex gap-6">
            {[
              { to: '/chat', label: 'Chat' },
              { to: '/calories', label: 'Nutrition' },
              { to: '/progress', label: 'Progress' },
              { to: '/booking', label: 'Book' },
              { to: '/mentor', label: 'Mentor Panel' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="text-[#444] text-xs uppercase tracking-widest hover:text-white transition-colors">{label}</Link>
            ))}
          </div>
          <p className="text-[#333] text-xs uppercase tracking-widest">© 2024 UNIFIT</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-[#030102] border-t border-[#0e0e0e] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12 pb-12 border-b border-[#0e0e0e]">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-[#E63946] rounded-md flex items-center justify-center">
                <Icon icon="solar:bolt-bold" className="text-white text-base" />
              </div>
              <span className="font-['Bebas_Neue'] text-xl tracking-wider text-white">UNIFIT</span>
            </Link>
            <p className="text-[#333] text-sm font-light max-w-xs">Parth Pandey's private coaching system for people who want the truth.</p>
          </div>
          <div className="flex gap-16">
            <div>
              <div className="text-[#333] text-[10px] uppercase tracking-widest mb-4">Platform</div>
              <div className="space-y-3">
                {[{to:'/dashboard',label:'Dashboard'},{to:'/chat',label:'Mentor Chat'},{to:'/calories',label:'Nutrition'},{to:'/progress',label:'Progress'}].map(({ to, label }) => (
                  <Link key={to} to={to} className="block text-[#444] text-sm hover:text-white transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[#333] text-[10px] uppercase tracking-widest mb-4">More</div>
              <div className="space-y-3">
                {[{to:'/booking',label:'Book Session'},{to:'/onboarding',label:'Get Started'},{to:'/mentor',label:'Mentor Panel'}].map(({ to, label }) => (
                  <Link key={to} to={to} className="block text-[#444] text-sm hover:text-white transition-colors">{label}</Link>
                ))}
                <a href="#pricing" className="block text-[#444] text-sm hover:text-white transition-colors">Pricing</a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#222] text-xs uppercase tracking-widest">© 2024 UNIFIT · Parth Pandey Mentorship Program</p>
          <div className="flex gap-4">
            <a href="#" className="text-[#222] hover:text-[#666] transition-colors text-xs uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[#222] hover:text-[#666] transition-colors text-xs uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
