'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const creators = [
  { name: 'Alex Johnson', niche: 'Tech Reviews', followers: '1.2M', engagement: '8.4%', performance: '+150%', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
  { name: 'Sarah Miller', niche: 'Finance', followers: '840K', engagement: '12.1%', performance: '+210%', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
  { name: 'David Chen', niche: 'Gaming', followers: '2.5M', engagement: '6.2%', performance: '+95%', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { name: 'Elena Rodriguez', niche: 'Lifestyle', followers: '500K', engagement: '15.4%', performance: '+300%', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop' },
];

export default function CreatorShowcase() {
  return (
    <section className="py-24 bg-[#050B22]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Top Performing Creators</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Join the ranks of top creators who use CreatorBoost to explode their growth and engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative rounded-3xl bg-[#0A1128] border border-white/10 overflow-hidden hover:border-primary/50 transition-colors duration-300"
            >
              {/* Creator Image & Overlay */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image 
                  src={creator.image} 
                  alt={creator.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-[#0A1128]/50 to-transparent" />
                
                {/* Niche Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                  {creator.niche}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 relative z-10 -mt-12">
                <h3 className="text-xl font-bold text-white mb-4">{creator.name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Followers</p>
                    <p className="text-white font-bold">{creator.followers}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Engagement</p>
                    <p className="text-primary font-bold">{creator.engagement}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                  <span className="text-white/60 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Growth</span>
                  <span className="text-green-400 font-bold">{creator.performance}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
