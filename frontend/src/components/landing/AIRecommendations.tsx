'use client';

import { motion } from 'framer-motion';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';

export default function AIRecommendations() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0A1128]">
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Copy */}
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI-Powered Engine</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Smarter matches, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">better growth.</span>
            </h2>
            
            <p className="text-lg text-white/60 max-w-xl">
              Our advanced recommendation engine analyzes user behavior, niche affinities, and historical completion rates to instantly connect viewers with the most relevant creator campaigns.
            </p>
            
            <ul className="space-y-4">
              {[
                'Find trending campaigns specific to your niche',
                'Recommend creators with similar audiences',
                'Predict the highest converting task structures'
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-white/80 font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Right: Visual */}
          <div className="flex-1 relative w-full h-[500px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Central Brain/Core */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-[0_0_50px_rgba(139,92,246,0.3)] z-20">
                <div className="w-full h-full rounded-full bg-[#050B22] flex items-center justify-center">
                  <Brain className="w-12 h-12 text-white/90" />
                </div>
              </div>
              
              {/* Floating Orbiting Nodes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15 + (i * 2), repeat: Infinity, ease: "linear" }}
                  className="absolute w-full h-full rounded-full border border-white/[0.03]"
                  style={{ width: `${200 + (i * 60)}px`, height: `${200 + (i * 60)}px` }}
                >
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0A1128] border border-white/10 flex items-center justify-center shadow-lg"
                    style={{ transform: `rotate(-${i * 45}deg)` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary/50 to-secondary/50" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
