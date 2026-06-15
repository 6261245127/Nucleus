'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function LandingNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-[#050B22]/80 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">CreatorBoost</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">How It Works</Link>
          <Link href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Features</Link>
          <Link href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
          <Link href="#faq" className="text-white/70 hover:text-white transition-colors text-sm font-medium">FAQ</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-white/70 hover:text-white transition-colors text-sm font-medium">
            Log In
          </Link>
          <Link href="/register">
            <Button className="bg-white text-[#050B22] hover:bg-white/90 rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
