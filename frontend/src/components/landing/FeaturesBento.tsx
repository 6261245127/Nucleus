'use client';

import { motion } from 'framer-motion';
import { Gift, Calendar, Share2, Trophy, Megaphone, TrendingUp, BarChart3, Target, Search, Eye, Sparkles } from 'lucide-react';

interface FeaturesBentoProps {
  section?: {
    title: string | null;
    subtitle: string | null;
    content: any;
  } | null;
}

export default function FeaturesBento({ section }: FeaturesBentoProps) {
  const dbFeatures = section?.content?.features;
  const hasDbFeatures = Array.isArray(dbFeatures) && dbFeatures.length > 0;

  return (
    <section className="py-24 bg-[#0A1128]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {section?.title || 'Built For Everyone'}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {section?.subtitle || 'Whether you want to earn money, grow your audience, or discover influencers, we have the tools you need.'}
          </p>
        </div>

        {hasDbFeatures ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {dbFeatures.map((feat: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 group relative"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feat.description}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* For Viewers Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 h-full">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="p-2 bg-primary/20 rounded-lg text-primary"><Gift size={24} /></span>
                  For Viewers
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Gift className="w-5 h-5 text-green-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Earn Rewards</h4>
                      <p className="text-sm text-white/50 mt-1">Get paid for authentic engagement.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Calendar className="w-5 h-5 text-blue-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Daily Tasks</h4>
                      <p className="text-sm text-white/50 mt-1">New tasks added every single day.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Share2 className="w-5 h-5 text-purple-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Referral Bonuses</h4>
                      <p className="text-sm text-white/50 mt-1">Earn a percentage of your friends' earnings.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Trophy className="w-5 h-5 text-yellow-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Achievement Levels</h4>
                      <p className="text-sm text-white/50 mt-1">Level up to unlock higher paying tasks.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* For Creators Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Megaphone size={120} /></div>
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                  <span className="p-2 bg-secondary/20 rounded-lg text-secondary"><Megaphone size={24} /></span>
                  For Creators
                </h3>
                <ul className="space-y-6 relative z-10">
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Megaphone className="w-5 h-5 text-secondary" /></div>
                    <div>
                      <h4 className="font-bold text-white">Campaign Creation</h4>
                      <p className="text-sm text-white/50 mt-1">Launch campaigns in under 60 seconds.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><TrendingUp className="w-5 h-5 text-secondary" /></div>
                    <div>
                      <h4 className="font-bold text-white">Audience Growth</h4>
                      <p className="text-sm text-white/50 mt-1">Gain real subscribers that actually care.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><BarChart3 className="w-5 h-5 text-secondary" /></div>
                    <div>
                      <h4 className="font-bold text-white">Real Analytics</h4>
                      <p className="text-sm text-white/50 mt-1">Track ROI with pixel-perfect accuracy.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Target className="w-5 h-5 text-secondary" /></div>
                    <div>
                      <h4 className="font-bold text-white">Niche Targeting</h4>
                      <p className="text-sm text-white/50 mt-1">Only pay for viewers in your specific niche.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* For Brands Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 h-full">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Search size={24} /></span>
                  For Brands
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Search className="w-5 h-5 text-orange-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Influencer Discovery</h4>
                      <p className="text-sm text-white/50 mt-1">Find the perfect creators for your product.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><BarChart3 className="w-5 h-5 text-orange-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Campaign Tracking</h4>
                      <p className="text-sm text-white/50 mt-1">Monitor all your sponsored campaigns centrally.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-white/5"><Eye className="w-5 h-5 text-orange-400" /></div>
                    <div>
                      <h4 className="font-bold text-white">Audience Engagement</h4>
                      <p className="text-sm text-white/50 mt-1">Ensure your ads are actually being watched.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </section>
  );
}
