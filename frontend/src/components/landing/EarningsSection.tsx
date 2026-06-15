'use client';

import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Coins, TrendingUp, Users } from 'lucide-react';

const data = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 450 },
  { name: 'Fri', revenue: 700 },
  { name: 'Sat', revenue: 650 },
  { name: 'Sun', revenue: 900 },
];

export default function EarningsSection() {
  return (
    <section className="py-24 bg-[#050B22]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Chart */}
          <div className="w-full lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-3xl bg-[#0A1128] border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                  <p className="text-white/50 text-sm font-medium mb-1">Total Creator Revenue</p>
                  <h3 className="text-3xl font-bold text-white">$142,050.00</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-sm font-bold rounded-full border border-green-500/20">
                  <TrendingUp className="w-4 h-4" /> +24%
                </div>
              </div>

              <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A1128', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#8B5CF6' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right: Copy */}
          <div className="w-full lg:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Turn your free time into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">real income.</span>
            </h2>
            <p className="text-lg text-white/60">
              CreatorBoost isn't just a growth platform—it's an economy. Viewers earn for their attention, and creators generate massive ROI on their campaigns.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
                  <Coins className="w-5 h-5 text-yellow-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Weekly Rewards</h4>
                <p className="text-sm text-white/50">Top users receive bonus payouts every single Friday.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Referral Income</h4>
                <p className="text-sm text-white/50">Earn a 5% lifetime commission on anyone you invite.</p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
