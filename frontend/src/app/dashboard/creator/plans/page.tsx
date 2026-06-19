"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";

interface CMSCreatorPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  campaignLimit: number;
  viewerRewardCoins: number;
  features: string[];
  badgeText: string;
  buttonText: string;
  themeColor: string;
  order: number;
}

interface CreatorSubscription {
  status: string;
  campaignsUsed: number;
  expiresAt: string | null;
  plan: CMSCreatorPlan;
}

export default function CreatorPlansPage() {
  const [plans, setPlans] = useState<CMSCreatorPlan[]>([]);
  const [subscription, setSubscription] = useState<CreatorSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/admin/cms/creator-plans'),
        fetch('/api/subscriptions/me')
      ]);

      if (plansRes.ok) {
        setPlans(await plansRes.json());
      }
      if (subRes.ok) {
        setSubscription(await subRes.json());
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: CMSCreatorPlan) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initiate checkout');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "CreatorBoost Plans",
        description: `${plan.name} Plan Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/subscriptions/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          });
          if (verifyRes.ok) {
            toast.success("Subscription activated successfully!");
            fetchData();
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#3b82f6"
        }
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading plans...</div>;
  }

  return (
    <div className="space-y-12 pb-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Current Subscription Dashboard */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-black p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Zap size={120} className="text-blue-500 blur-xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-6">Your Subscription</h2>
          {subscription && subscription.status === 'ACTIVE' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-sm mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-${subscription.plan.themeColor.split('-')[1]}-500 shadow-[0_0_10px_currentColor]`} />
                  {subscription.plan.name}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-sm mb-1">Campaigns Used</p>
                <p className="text-2xl font-bold text-white">
                  {subscription.campaignsUsed} / {subscription.plan.campaignLimit}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-sm mb-1">Viewer Reward</p>
                <p className="text-2xl font-bold text-white">{subscription.plan.viewerRewardCoins} Coins</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm inline-block">
              <p className="text-gray-300">You are currently not on an active plan. Choose a plan below to start creating campaigns.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Campaign Plans
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose a plan and start promoting your content with real viewers and engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan.id === plan.id && subscription?.status === 'ACTIVE';
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-white/10 bg-black/40 backdrop-blur-xl ${plan.badgeText ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              {plan.badgeText && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  {plan.badgeText}
                </div>
              )}
              {/* Gradient glow effect inside card */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-${plan.themeColor.split('-')[1]}-500/20 rounded-full blur-3xl`} />
              
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px] mt-2 text-gray-400">{plan.description}</CardDescription>
                <div className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-extrabold tracking-tight text-white">₹{plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-400">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats row */}
                <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Campaigns</p>
                    <p className="font-bold text-white text-lg">{plan.campaignLimit}</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Viewer Reward</p>
                    <p className="font-bold text-white text-lg">{plan.viewerRewardCoins} 🪙</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-x-3">
                      <CheckCircle2 className={`h-5 w-5 flex-none text-${plan.themeColor.split('-')[1]}-400`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full h-12 text-lg font-bold bg-gradient-to-r ${plan.themeColor} hover:brightness-110 border-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                  disabled={isProcessing || isCurrentPlan}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
