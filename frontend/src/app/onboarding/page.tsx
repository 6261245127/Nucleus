'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const NICHES = [
  'Technology', 'Gaming', 'Finance', 'Crypto', 'Business', 
  'Entrepreneurship', 'Fitness', 'Health', 'Fashion', 'Beauty', 
  'Travel', 'Food', 'Education', 'AI & Software', 'Photography', 
  'Music', 'Entertainment', 'Sports', 'Lifestyle', 'Other'
];

export default function OnboardingPage() {
  const [selectedNiches, setSelectedNiches] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token, login } = useAuth();
  const router = useRouter();

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.onboardingCompleted) {
      if (user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (user.role === 'CREATOR') router.push('/dashboard/creator');
      else router.push('/dashboard/viewer');
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

      toast.success('Preferences saved successfully! Welcome to CreatorBoost.');
      
      if (user?.role === 'ADMIN') router.push('/dashboard/admin');
      else if (user?.role === 'CREATOR') router.push('/dashboard/creator');
      else router.push('/dashboard/viewer');
      
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Personalize Your Experience</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select up to 5 niches you're interested in. We'll use this to recommend the best campaigns and creators for you.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {NICHES.map((niche) => {
            const isSelected = selectedNiches.has(niche);
            return (
              <Card 
                key={niche}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => toggleNiche(niche)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{niche}</span>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col items-center pt-8 space-y-4">
          <Button 
            size="lg" 
            className="w-full max-w-md text-lg h-14" 
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
        </div>
      </div>
    </div>
  );
}
