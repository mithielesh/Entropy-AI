"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; 
import LandingPage from '../components/LandingPage';

export default function Home() {
  const router = useRouter();

  const handleEnterLightning = () => {
    // This command forces Next.js to load your new 'lightning' folder
    router.push('/lightning');
  };

  const handleEnterAuth = (type: 'login' | 'signup') => {
    router.push(`/auth/${type}`);
  };

  return (
    <LandingPage 
      onEnterLightning={handleEnterLightning}
      onEnterAuth={handleEnterAuth} 
    />
  );
}