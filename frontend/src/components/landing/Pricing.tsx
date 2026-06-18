'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PlanData {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string | null;
  features: string[];
  badgeLabel: string | null;
  buttonText: string;
  isPopular: boolean;
}

interface PricingProps {
  section?: {
    title: string | null;
    subtitle: string | null;
  } | null;
  plans?: PlanData[];
}

const defaultPlans: PlanData[] = [
  {
    id: 'default-1',
    name: 'Creator',
    price: 0,
    currency: 'INR',
    period: '',
    features: ['Access to basic viewers', 'Standard analytics', 'Up to 3 active campaigns', 'Email support'],
    buttonText: 'Start For Free',
    isPopular: false,
    badgeLabel: null
  },
  {
    id: 'default-2',
    name: 'Pro Creator',
    price: 3999,
    currency: 'INR',
    period: '/mo',
    features: ['Access to Premium viewers', 'Real-time ROI dashboard', 'Unlimited active campaigns', 'Priority AI Recommendations', '24/7 Priority support'],
    buttonText: 'Get Pro',
    isPopular: true,
    badgeLabel: 'Most Popular'
  },
  {
    id: 'default-3',
    name: 'Agency',
    price: 24999,
    currency: 'INR',
    period: '/mo',
    features: ['Everything in Pro', 'White-labeled dashboard', 'Dedicated account manager', 'API Access', 'Custom viewer targeting'],
    buttonText: 'Contact Sales',
    isPopular: false,
    badgeLabel: null
  }
];

export default function Pricing({ section, plans }: PricingProps) {
  const displayPlans = plans && plans.length > 0 ? plans : defaultPlans;

  return (
    <section className="py-24 bg-[#050B22]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {section?.title || 'Simple, Transparent Pricing'}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {section?.subtitle || 'Viewers earn for free forever. Creators pay a simple flat rate or scale up for advanced features.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {displayPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-3xl border relative ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-[#0A1128] to-primary/10 border-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.15)] md:-mt-8 md:mb-8 scale-105' 
                  : 'bg-[#0A1128] border-white/10'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3" /> {plan.badgeLabel || 'Most Popular'}
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/50 text-sm mb-6 h-10">
                {plan.name === 'Creator' ? 'Perfect for new creators testing the waters.' : plan.name === 'Pro Creator' ? 'For serious creators who want explosive growth.' : 'For brands and agencies managing multiple accounts.'}
              </p>
              
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">
                  {plan.currency === 'INR' ? '₹' : plan.currency}{plan.price}
                </span>
                {plan.period && <span className="text-white/50 ml-1">{plan.period}</span>}
              </div>
              
              <ul className="space-y-4 mb-8 h-48 overflow-y-auto">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                    <div className={`p-1 rounded-full ${plan.isPopular ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href="/register">
                <Button 
                  className={`w-full h-12 rounded-xl text-md font-bold transition-all ${
                    plan.isPopular 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                  variant={plan.isPopular ? 'default' : 'outline'}
                >
                  {plan.buttonText || 'Get Started'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
