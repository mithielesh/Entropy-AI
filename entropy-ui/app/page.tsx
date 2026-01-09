"use client"; // This is required for Next.js to use animations/state

import React, { useState } from 'react';
// Import your new components
import LandingPage from '../components/LandingPage';
import MainGenerator from '../components/MainGenerator'; 

export default function Home() {
  // View State: 'landing' | 'lightning' | 'login' | 'signup'
  const [view, setView] = useState('landing');

  // 1. Show Landing Page
  if (view === 'landing') {
    return (
      <LandingPage 
        onEnterLightning={() => setView('lightning')}
        onEnterAuth={(type: any) => setView(type)} 
      />
    );
  }

  // 2. Show Lightning Mode (Your Original Tool)
  if (view === 'lightning') {
    return (
      <div className="relative w-full min-h-screen bg-black">
         {/* Back Button */}
         <button 
           onClick={() => setView('landing')} 
           className="fixed top-4 left-4 z-50 text-gray-500 hover:text-white text-sm uppercase tracking-widest transition-colors"
         >
           ← Back
         </button>

         {/* Your Original App Component loads here */}
         <MainGenerator /> 
      </div>
    );
  }

  // 3. Login/Signup Placeholders
  if (view === 'login' || view === 'signup') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tighter">
            {view === 'login' ? 'ACCESS_REQUESTED' : 'NEW_ENTITY'}
          </h2>
          <p className="text-gray-500 text-sm">DATABASE_CONNECTION: PENDING...</p>
          <button 
            onClick={() => setView('landing')} 
            className="mt-8 text-xs text-gray-600 hover:text-white border-b border-gray-800 pb-1"
          >
            ABORT
          </button>
        </div>
      </div>
    );
  }

  return null;
}