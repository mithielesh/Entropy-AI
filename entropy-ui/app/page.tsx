"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import LandingPage from '../components/LandingPage';

export default function Home() {
  const router = useRouter();
  
  // 1. Define State for mounting and auth
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. Use Effect to check LocalStorage ONLY after browser load
  useEffect(() => {
    setMounted(true); // We are now in the browser
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user); // Set true if user exists
  }, []);

  const handleEnterLightning = () => {
    router.push('/lightning');
  };

  const handleEnterAuth = (type: 'login' | 'signup') => {
    // Smart Redirect: If logged in, clicking "Login" goes to Dashboard
    if (type === 'login' && isLoggedIn) {
      router.push('/dashboard');
      return;
    }
    router.push(`/auth/${type}`);
  };

  // 3. Pass the 'isLoggedIn' state to your component
  // Note: We use (mounted && isLoggedIn) to ensure it stays false during the very first render
  return (
    <LandingPage 
      onEnterLightning={handleEnterLightning}
      onEnterAuth={handleEnterAuth} 
      isLoggedIn={mounted && isLoggedIn}
    />
  );
}