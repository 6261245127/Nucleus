'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Image from 'next/image';

const NICHES = [
  { id: 'Technology', label: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop' },
  { id: 'Gaming', label: 'Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop' },
  { id: 'Finance', label: 'Finance', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop' },
  { id: 'Crypto', label: 'Crypto', image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop' },
  { id: 'Business', label: 'Business', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop' },
  { id: 'Entrepreneurship', label: 'Entrepreneurship', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=400&auto=format&fit=crop' },
  { id: 'Fitness', label: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
  { id: 'Health', label: 'Health', image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=400&auto=format&fit=crop' },
  { id: 'Fashion', label: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400&auto=format&fit=crop' },
  { id: 'Beauty', label: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=400&auto=format&fit=crop' },
  { id: 'Travel', label: 'Travel', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop' },
  { id: 'Food', label: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop' },
  { id: 'Education', label: 'Education', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop' },
  { id: 'AI & Software', label: 'AI & Software', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop' },
  { id: 'Photography', label: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop' },
  { id: 'Music', label: 'Music', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop' },
  { id: 'Entertainment', label: 'Entertainment', image: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?q=80&w=400&auto=format&fit=crop' },
  { id: 'Sports', label: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop' },
  { id: 'Lifestyle', label: 'Lifestyle', image: 'https://images.unsplash.com/photo-1502301103665-0b95cc738daf?q=80&w=400&auto=format&fit=crop' },
  { id: 'Other', label: 'Other', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=400&auto=format&fit=crop' }
];

export default function OnboardingPage() {
  const [selectedNiches, setSelectedNiches] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token, login } = useAuth();
  const router = useRouter();

  // Redirect if already onboarded or if not a viewer
  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      router.push('/dashboard/admin');
      return;
    }
    if (user.role === 'CREATOR') {
      router.push('/dashboard/creator');
      return;
    }
    if (user.onboardingCompleted) {
      router.push('/dashboard/viewer');
    }
  }, [user, router]);

  const toggleNiche = (niche: string) => {
    const newSet = new Set(selectedNiches);
    if (newSet.has(niche)) {
      newSet.delete(niche);
    } else {
      if (newSet.size >= 5) {
        toast.error('You can select up to 5 niches');
        return;
      }
      newSet.add(niche);
    }
    setSelectedNiches(newSet);
  };

  const handleSubmit = async () => {
    if (selectedNiches.size === 0) {
      toast.error('Please select at least one niche to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niches: Array.from(selectedNiches)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save preferences');
      }
      
      // Update local user context
      if (user && token) {
        login(token, { ...user, onboardingCompleted: true, niches: data.user.niches });
      }

      toast.success('Preferences saved successfully! Welcome to The Social Bite.');
      
      if (user?.role === 'ADMIN') router.push('/dashboard/admin');
      else if (user?.role === 'CREATOR') router.push('/dashboard/creator');
      else router.push('/dashboard/viewer');
      
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-5xl w-full space-y-10">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Personalize Your Experience
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Select up to 5 topics you're interested in. We'll use this to curate the best campaigns and creators just for you.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
          {NICHES.map((niche, i) => {
            const isSelected = selectedNiches.has(niche.id);
            return (
              <motion.div
                key={niche.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative aspect-square"
              >
                <Card 
                  className={`relative w-full h-full overflow-hidden cursor-pointer transition-all duration-300 border-2 ${isSelected ? 'border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]' : 'border-transparent hover:border-primary/50'}`}
                  onClick={() => toggleNiche(niche.id)}
                >
                  <div className={`absolute inset-0 transition-transform duration-700 ${isSelected ? 'scale-110' : 'scale-100'}`}>
                    <Image 
                      src={niche.image} 
                      alt={niche.label} 
                      fill 
                      sizes="(max-width: 768px) 50vw, 20vw"
                      priority={i < 10}
                      className="object-cover"
                    />
                  </div>
                  {/* Dark gradient overlay so text is readable */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-gradient-to-t from-primary/80 via-background/60 to-background/20' : 'bg-gradient-to-t from-black/90 via-black/40 to-transparent hover:from-black/70'}`} />
                  
                  <div className="absolute inset-0 p-4 flex flex-col items-center justify-end text-center z-10">
                    <span className="font-bold text-white text-sm tracking-wide drop-shadow-md">{niche.label}</span>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1 shadow-lg z-20"
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center pt-8 space-y-4"
        >
          <Button 
            size="lg" 
            className={`w-full max-w-md text-lg h-14 transition-all duration-300 ${selectedNiches.size > 0 ? 'animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.4)]' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting || selectedNiches.size === 0}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
            ) : (
              `Continue (${selectedNiches.size}/5 Selected)`
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            You can always update these later in your profile settings.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
