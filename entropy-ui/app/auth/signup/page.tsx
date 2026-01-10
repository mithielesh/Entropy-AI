"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// --- GitHub Icon SVG Component ---
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.03.66-3.72-1.455-3.72-1.455-.54-1.38-1.335-1.755-1.335-1.755-1.095-.75.09-.735.09-.735 1.2.09 1.83 1.245 1.83 1.245 1.08 1.83 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// --- Google Icon SVG Component ---
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Access form elements safely
    const target = e.target as typeof e.target & {
      0: { value: string }; // Username
      1: { value: string }; // Email
      2: { value: string }; // Password
    };
    
    const username = target[0].value;
    const email = target[1].value;
    const password = target[2].value;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Redirect to dashboard
        router.push('/auth/login');
      } else {
        // Show error message
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         {/* Green tint for "Creation" vibe */}
         <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[600px] h-[300px] bg-green-900/20 blur-[120px] rounded-full" />
      </div>

      <button 
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* --- SIGNUP CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-400">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">New Entity</h2>
          <p className="text-gray-500 text-sm mt-2">Create a secure profile to save your analysis.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded text-center">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
              <input 
                type="text" 
                required
                placeholder="Agent_007"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
              <input 
                type="email" 
                required
                placeholder="operative@entropy.ai"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
             <label className="text-xs text-gray-400 uppercase tracking-wider font-bold ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-400 transition-colors" />
              <input 
                type="password" 
                required
                placeholder="Create a strong key"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span>Register ID</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* --- ADDED SOCIAL SIGNUP SECTION --- */}
        
        {/* Divider */}
        <div className="relative my-8">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
           <div className="relative flex justify-center text-xs uppercase"><span className="bg-black/50 backdrop-blur-xl px-2 text-gray-500">Or register with</span></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
           {/* Google Button */}
           <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm">
             <GoogleIcon className="w-5 h-5" />
             <span className="font-bold">Google</span>
           </button>
           
           {/* GitHub Button */}
           <button className="flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm text-gray-300 hover:text-white">
             <GithubIcon className="w-5 h-5" /> 
             <span className="font-bold">GitHub</span>
           </button>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Already authorized?{' '}
          <Link href="/auth/login" className="text-green-400 hover:text-white transition-colors underline">
            Access Terminal
          </Link>
        </p>

      </motion.div>
    </div>
  );
}