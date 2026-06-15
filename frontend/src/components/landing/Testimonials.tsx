'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  { 
    text: "CreatorBoost helped me jump from 10k to 50k subscribers in just two months. The engagement is completely real and my retention rates actually went up.",
    name: "Tech Reviewer Max",
    role: "YouTube Creator",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
  },
  { 
    text: "I earn about $50 a week just by watching videos in my niche during my commute. It's the most transparent reward platform I've ever used.",
    name: "Sarah Jenkins",
    role: "Viewer & Earner",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  },
  { 
    text: "As a brand, finding micro-influencers was a nightmare. Now we just launch a campaign and let the platform find the perfect audience for us.",
    name: "David Chen",
    role: "Marketing Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#0A1128] border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Loved by Thousands</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Hear from the creators and viewers who use CreatorBoost daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 relative"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-8">"{t.text}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <Image src={t.image} alt={t.name} width={48} height={48} className="rounded-full" />
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-white/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
