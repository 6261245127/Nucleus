'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface LandingNavProps {
  settings?: {
    websiteName: string;
    logoUrl?: string | null;
  } | null;
  menuItems?: {
    title: string;
    url: string;
  }[];
  announcement?: {
    message: string;
    link: string | null;
  } | null;
}

export default function LandingNav({ settings, menuItems, announcement }: LandingNavProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const displayLogo = settings?.logoUrl ? (
    <img src={settings.logoUrl} alt={settings.websiteName} className="h-8 object-contain" />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <Zap className="w-5 h-5 text-white" />
    </div>
  );

  const displayLinks = menuItems && menuItems.length > 0 ? (
    menuItems.map((item, index) => (
      <Link 
        key={index} 
        href={item.url} 
        className="text-white/70 hover:text-white transition-colors text-sm font-medium"
      >
        {item.title}
      </Link>
    ))
  ) : (
    <>
      <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">How It Works</Link>
      <Link href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Features</Link>
      <Link href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
      <Link href="#faq" className="text-white/70 hover:text-white transition-colors text-sm font-medium">FAQ</Link>
    </>
  );

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-[#050B22]/80 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}
    >
      {announcement && (
        <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-1.5 relative z-50">
          <span>{announcement.message}</span>
          {announcement.link && (
            <Link href={announcement.link} className="underline hover:opacity-90 ml-1">
              Learn more →
            </Link>
          )}
        </div>
      )}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {displayLogo}
          <span className="text-xl font-bold text-white tracking-tight">
            {settings?.websiteName || 'The Social Bite'}
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {displayLinks}
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
