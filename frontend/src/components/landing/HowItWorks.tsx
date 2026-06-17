'use client';

import { motion } from 'framer-motion';
import { UserPlus, Target, PlaySquare, Coins, Rocket } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in seconds and join the ecosystem as a creator or viewer.' },
  { icon: Target, title: 'Choose Your Niche', desc: 'Select your interests to get personalized task recommendations.' },
  { icon: PlaySquare, title: 'Complete Tasks', desc: 'Engage with content or launch your own growth campaigns.' },
  { icon: Coins, title: 'Earn Rewards', desc: 'Get paid in coins for every authentic engagement you provide.' },
  { icon: Rocket, title: 'Grow Faster', desc: 'Redeem coins for cash or reinvest them to explode your own audience.' },
];

export default function HowItWorks() {
  return (
    <section className="py-32 relative bg-[#050B22]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">The Social Bite</span> Works
          </motion.h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            A simple, transparent ecosystem designed to generate real growth and real rewards.
          </p>
        </div>

          <div className="relative max-w-5xl mx-auto pt-4">
            {/* Timeline Line */}
            <div className="absolute top-12 left-0 w-full h-1 bg-white/5 -translate-y-1/2 hidden md:block rounded-full overflow-hidden z-0">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-primary to-secondary"
              />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Icon Node */}
                  <div className="w-16 h-16 rounded-2xl bg-[#0A1128] border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 shadow-xl group-hover:shadow-primary/20">
                    <Icon className="w-8 h-8 text-white/70 group-hover:text-primary transition-colors" />
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold flex items-center justify-center border-2 border-[#050B22]">
                      {i + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
