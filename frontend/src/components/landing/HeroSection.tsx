'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Background Gradients */}
      <div className="absolute inset-0 w-full h-full bg-[#050B22]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[150px] mix-blend-screen animate-pulse delay-1000" />
      
      <div className="container relative z-10 mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Copy */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm font-medium text-white/80">CreatorBoost 2.0 is Live</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 tracking-tight leading-[1.1] mb-6">
            Grow Your Audience Faster With Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Engagement</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-xl">
            Connect creators and viewers through rewarded engagement tasks that drive real growth, authentic watch-time, and massive ROI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] border-0 text-white rounded-xl">
                Start Growing <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/tasks">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-md text-white rounded-xl">
                Explore Tasks <Play className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-6 text-sm text-white/40 font-medium">
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-secondary" /> Instant Payouts</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Real Humans</div>
          </div>
        </motion.div>

        {/* Right Visuals */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative lg:h-[600px] w-full hidden lg:block"
        >
          {/* Main Dashboard Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] rounded-2xl bg-[#0A1128]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <p className="text-white/50 text-sm font-medium">Total Engagement</p>
                <h3 className="text-4xl font-bold text-white mt-1">2.4M</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="text-primary w-6 h-6" />
              </div>
            </div>
            
            {/* Fake Chart */}
            <div className="h-32 flex items-end gap-2 mb-6">
              {[40, 25, 60, 45, 80, 55, 90, 70, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                  className="flex-1 bg-gradient-to-t from-primary/20 to-primary/80 rounded-t-sm"
                />
              ))}
            </div>
            
            {/* Fake Recent Tasks */}
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Play className="w-4 h-4 text-secondary ml-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-white/20 rounded-md mb-2" />
                    <div className="h-3 w-16 bg-white/10 rounded-md" />
                  </div>
                  <div className="text-green-400 font-bold text-sm">+50 Coins</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Floating Decorator Card 1 */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-12 top-24 bg-[#0A1128]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium">New Subscribers</p>
              <p className="text-white font-bold text-xl">+1,204</p>
            </div>
          </motion.div>
          
          {/* Floating Decorator Card 2 */}
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-8 bottom-32 bg-[#0A1128]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium">Tasks Completed</p>
              <p className="text-white font-bold text-xl">45,892</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
