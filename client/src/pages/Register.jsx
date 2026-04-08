import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    profile: {
      firstName: '',
      lastName: '',
      fitnessLevel: 'beginner',
      fitnessGoals: []
    }
  });

  const [step, setStep] = useState(1);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) clearError();
  };

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        fitnessGoals: prev.profile.fitnessGoals.includes(goal)
          ? prev.profile.fitnessGoals.filter(g => g !== goal)
          : [...prev.profile.fitnessGoals, goal]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    const { confirmPassword, ...submitData } = formData;
    const result = await register(submitData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const fitnessGoals = ['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Consistency'];

  return (
    <div className="font-['DM_Sans'] bg-[#080304] text-[#F0F0F0] antialiased min-h-screen flex items-center justify-center pt-16">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-10 h-10 bg-[#E63946] rounded-md flex items-center justify-center">
            <Icon icon="solar:bolt-bold" className="text-white text-xl" />
          </div>
          <span className="font-['Bebas_Neue'] text-2xl tracking-wider text-white ml-2">UNIFIT</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2].map((i) => (
            <React.Fragment key={i}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= i ? 'bg-[#E63946] text-white' : 'bg-[#2a2a2a] text-[#555]'
              }`}>
                {i}
              </div>
              {i < 2 && (
                <div className={`w-12 h-0.5 mx-2 ${step > i ? 'bg-[#E63946]' : 'bg-[#2a2a2a]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Register Form */}
        <div className="bg-[#161616] rounded-xl p-8 border border-[#2a2a2a]">
          <h1 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-[#555] text-sm mb-6">Start your fitness transformation today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0B0C] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#E63946] transition-colors"
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0B0C] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#E63946] transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0B0C] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#E63946] transition-colors"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#0D0B0C] border rounded-lg text-white placeholder-[#555] focus:outline-none transition-colors ${
                      passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-[#2a2a2a] focus:border-[#E63946]'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-[#E63946] hover:bg-[#d62839] text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#888] text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="profile.firstName"
                      value={formData.profile.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0D0B0C] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#E63946] transition-colors"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888] text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="profile.lastName"
                      value={formData.profile.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0D0B0C] border border-[#2a2a2a] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#E63946] transition-colors"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Fitness Level</label>
                  <select
                    name="profile.fitnessLevel"
                    value={formData.profile.fitnessLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0D0B0C] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#E63946] transition-colors"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Fitness Goals</label>
                  <div className="space-y-2">
                    {fitnessGoals.map((goal) => (
                      <label key={goal} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.profile.fitnessGoals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                          className="mr-2 rounded border-[#2a2a2a] bg-[#0D0B0C] text-[#E63946] focus:ring-[#E63946]"
                        />
                        <span className="text-sm text-[#ccc]">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#E63946] hover:bg-[#d62839] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#555] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#E63946] hover:text-[#d62839] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
