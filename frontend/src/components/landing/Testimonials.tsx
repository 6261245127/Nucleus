'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image: string | null;
  review: string;
  rating: number;
}

interface TestimonialsProps {
  section?: {
    title: string | null;
    subtitle: string | null;
  } | null;
  testimonials?: TestimonialData[];
}

const defaultTestimonials: TestimonialData[] = [
  { 
    id: 't-default-1',
    review: "The Social Bite helped me jump from 10k to 50k subscribers in just two months. The engagement is completely real and my retention rates actually went up.",
    name: "Tech Reviewer Max",
    role: "YouTube Creator",
    company: null,
    rating: 5,
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
  },
  { 
    id: 't-default-2',
    review: "I earn about $50 a week just by watching videos in my niche during my commute. It's the most transparent reward platform I've ever used.",
    name: "Sarah Jenkins",
    role: "Viewer & Earner",
    company: null,
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  },
  { 
    id: 't-default-3',
    review: "As a brand, finding micro-influencers was a nightmare. Now we just launch a campaign and let the platform find the perfect audience for us.",
    name: "David Chen",
    role: "Marketing Director",
    company: null,
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  }
];

export default function Testimonials({ section, testimonials }: TestimonialsProps) {
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="py-24 bg-[#0A1128] border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {section?.title || 'Loved by Thousands'}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {section?.subtitle || "Don't just take our word for it. Hear from the creators and viewers who use The Social Bite daily."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayTestimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: Math.max(1, Math.min(5, t.rating || 5)) }).map((_, starIdx) => (
                    <Star key={starIdx} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-white/80 text-lg leading-relaxed mb-8">"{t.review}"</p>
              </div>
              
              <div className="flex items-center gap-4 mt-auto">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-white/50">
                    {t.role}{t.company ? ` @ ${t.company}` : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
