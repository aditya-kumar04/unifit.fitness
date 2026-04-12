import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin: authGoogleLogin, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await authGoogleLogin(credentialResponse.credential);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.log('Google login failed'),
  });

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

        {/* Login Form */}
        <div className="bg-[#161616] rounded-xl p-8 border border-[#2a2a2a]">
          <h1 className="font-['Barlow_Condensed'] text-3xl text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-[#555] text-sm mb-6">Sign in to continue your fitness journey</p>

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
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a2a2a]"></div>
            <span className="text-[#555] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#2a2a2a]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E63946] hover:bg-[#d62839] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#555] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#E63946] hover:text-[#d62839] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 text-center">
          <p className="text-[#444] text-xs mb-2">Demo Credentials:</p>
          <p className="text-[#555] text-xs">Email: demo@unifit.com | Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
