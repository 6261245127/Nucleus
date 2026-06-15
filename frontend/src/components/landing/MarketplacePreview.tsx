'use client';

import { motion } from 'framer-motion';
import { Play, Coins, Clock, Lock } from 'lucide-react';

const mockTasks = [
  { platform: 'YouTube', name: 'Watch: How to Build a SaaS in 2024', reward: 50, duration: '2 min', creator: 'DevMaster', active: true },
  { platform: 'Instagram', name: 'Like & Comment: Setup Tour', reward: 30, duration: '15 sec', creator: 'DesignPro', active: false },
  { platform: 'TikTok', name: 'Watch & Share: Viral Dance', reward: 20, duration: '30 sec', creator: 'TrendSetter', active: false },
  { platform: 'Twitter', name: 'Retweet: Thread on AI', reward: 40, duration: '10 sec', creator: 'AI_Insider', active: false },
];

export default function MarketplacePreview() {
  return (
    <section className="py-24 bg-[#0A1128] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Live Task Marketplace</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Get paid instantly for every task you complete. Real-time tasks dropping every minute.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border ${task.active ? 'bg-white/5 border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'bg-black/20 border-white/5'} overflow-hidden group hover:border-primary/50 transition-colors`}
              >
                {!task.active && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Lock className="w-6 h-6 text-white/50" />
                      <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Coming Soon</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/5">
                    {task.platform}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-bold text-sm border border-yellow-500/20">
                    <Coins className="w-4 h-4" /> +{task.reward}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{task.name}</h3>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-white">
                      {task.creator[0]}
                    </div>
                    {task.creator}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40 text-sm">
                    <Clock className="w-4 h-4" /> {task.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
