import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin: authGoogleLogin, loading, error, clearError } = useAuth();
  
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
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'username' || !name) {
      const username = value || formData.username;
      if (!username.trim()) {
        errors.username = 'Username is required';
      } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (username.length > 30) {
        errors.username = 'Username must not exceed 30 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
      }
    }
    
    if (name === 'email' || !name) {
      const email = value || formData.email;
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email';
      }
    }
    
    if (name === 'password' || !name) {
      const password = value || formData.password;
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    return errors;
  };

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
    
    // Clear field error for this field when user starts typing
    if (name in fieldErrors) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
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

  const handleNextStep = () => {
    const errors = validateField();
    if (Object.keys(errors).length === 0) {
      setStep(2);
      setFieldErrors({});
    } else {
      setFieldErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateField();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await authGoogleLogin(credentialResponse.credential);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.log('Google login failed'),
  });

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

          {/* Google Sign-In Button */}
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full mb-4 px-4 py-3 bg-white text-[#080304] font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="logos:google-icon" className="text-lg" />
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a2a2a]"></div>
            <span className="text-[#555] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#2a2a2a]"></div>
          </div>

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
                    className={`w-full px-4 py-3 bg-[#0D0B0C] border rounded-lg text-white placeholder-[#555] focus:outline-none transition-colors ${
                      fieldErrors.username ? 'border-red-500/50 focus:border-red-500' : 'border-[#2a2a2a] focus:border-[#E63946]'
                    }`}
                    placeholder="Choose a username"
                  />
                  {fieldErrors.username && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#0D0B0C] border rounded-lg text-white placeholder-[#555] focus:outline-none transition-colors ${
                      fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#2a2a2a] focus:border-[#E63946]'
                    }`}
                    placeholder="Enter your email"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#0D0B0C] border rounded-lg text-white placeholder-[#555] focus:outline-none transition-colors ${
                      fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : 'border-[#2a2a2a] focus:border-[#E63946]'
                    }`}
                    placeholder="Create a password"
                  />
                  {fieldErrors.password && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.password}</p>
                  )}
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
                  />
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
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
