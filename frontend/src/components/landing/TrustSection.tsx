'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const stats = [
  { label: 'Total Users', value: 120500, prefix: '', suffix: '+' },
  { label: 'Active Creators', value: 4500, prefix: '', suffix: '+' },
  { label: 'Tasks Completed', value: 2400000, prefix: '', suffix: '+' },
  { label: 'Earnings Paid', value: 850000, prefix: '$', suffix: '+' },
];

function Counter({ value, prefix, suffix }: { value: number, prefix: string, suffix: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  const formatted = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(count);
  
  return (
    <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-2">
      {prefix}{formatted}{suffix}
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="py-20 border-y border-white/5 bg-[#0A1128]/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase">Trusted by thousands worldwide</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
            >
              <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <div className="text-white/50 font-medium text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
