'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { question: "How do Viewers make money?", answer: "Viewers earn coins by completing engagement tasks like watching YouTube videos, liking Instagram posts, or sharing content. Once you reach the minimum threshold, you can withdraw your coins for real cash via PayPal or Crypto." },
  { question: "Are the views and engagement real?", answer: "Yes. 100% real. We use advanced anti-cheat mechanisms, proprietary video players, and strict verification algorithms to ensure every task is completed by a real human being." },
  { question: "How much does it cost to launch a campaign?", answer: "You set your own budget! The cost per engagement varies depending on the platform and duration, but you can start a campaign with as little as $10." },
  { question: "Can I use my earned coins to fund my own campaigns?", answer: "Absolutely. Many creators start as viewers to earn coins, and then reinvest those coins to launch campaigns for their own content." },
  { question: "Is this safe for my YouTube/Instagram account?", answer: "Yes. Because all engagement comes from real humans interacting naturally through our platform, it complies with standard platform terms of service regarding genuine engagement." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-[#0A1128] border-y border-white/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <p className="text-white/60 text-lg">Everything you need to know about CreatorBoost.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-white/5 border-primary/30' : 'bg-transparent border-white/10 hover:border-white/20'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-white text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 ml-4 p-1 rounded-full ${isOpen ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/50'}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 pt-0 text-white/60 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
