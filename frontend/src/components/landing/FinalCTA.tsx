'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass } from 'lucide-react';

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-[#050B22] border-t border-white/5 py-32"
    >
      {/* Dynamic Glow Gradients */}
      <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-secondary/10 blur-[120px] rounded-full mix-blend-screen z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Floating Particles */}
      {[
        { x: "10vw", y: "-20vh", yAnim: -150, duration: 6, delay: 1 },
        { x: "-30vw", y: "40vh", yAnim: -200, duration: 8, delay: 2 },
        { x: "40vw", y: "-10vh", yAnim: -100, duration: 5, delay: 3 },
        { x: "-10vw", y: "-30vh", yAnim: -250, duration: 7, delay: 0 },
        { x: "20vw", y: "30vh", yAnim: -120, duration: 9, delay: 4 },
        { x: "-40vw", y: "10vh", yAnim: -180, duration: 6, delay: 2 }
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/20 blur-[1px] z-0"
          initial={{ x: p.x, y: p.y }}
          animate={{ 
            y: [null, p.yAnim],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay
          }}
        />
      ))}

      {/* Massive Parallax Background Text */}
      <motion.div 
        style={{ y: yBackground }}
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0 w-full"
      >
        <span 
          className="text-[12vw] md:text-[10vw] lg:text-[11vw] whitespace-nowrap leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[1px] tracking-tighter w-full text-center"
        >
          THE SOCIAL BITE
        </span>
      </motion.div>

      {/* Foreground Content */}
      <motion.div 
        style={{ y: yContent, opacity: opacityText }}
        className="container mx-auto px-4 relative z-10 text-center max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Small Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-white/80 uppercase tracking-widest">
              Join Thousands of Creators & Viewers
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Grow Faster. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Earn More.
            </span> <br />
            Build Your Community.
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            The Social Bite helps creators gain engagement while rewarding viewers for meaningful interactions. Start your journey today.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white text-[#050B22] hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] rounded-2xl group">
                Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/dashboard/viewer/tasks">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-[#0A1128]/50 text-white hover:bg-white/10 border-white/10 transition-all backdrop-blur-md rounded-2xl group">
                <Compass className="mr-2 w-5 h-5 text-secondary group-hover:rotate-45 transition-transform" /> Explore Campaigns
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
