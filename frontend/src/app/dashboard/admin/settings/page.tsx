'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Coins, Users, Percent, Shield, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    coinConversionRate: '100',   // 100 coins = ₹1
    referralBonus: '25',         // coins
    referralPercentage: '10',    // %
    dailyEarningLimit: '500',    // coins
    weeklyEarningLimit: '2500',  // coins
    platformFee: '5',            // %
    minWithdrawal: '100',        // coins
  });

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const sections = [
    {
      title: 'Coin Conversion',
      description: 'Configure how coins are converted to real currency.',
      icon: Coins,
      fields: [
        { key: 'coinConversionRate', label: 'Coins per ₹1', placeholder: '100', suffix: 'coins = ₹1' },
      ],
    },
    {
      title: 'Referral System',
      description: 'Configure referral bonuses and percentages.',
      icon: Users,
      fields: [
        { key: 'referralBonus', label: 'Signup Bonus (coins)', placeholder: '25' },
        { key: 'referralPercentage', label: 'Referral Earnings (%)', placeholder: '10' },
      ],
    },
    {
      title: 'Earning Limits',
      description: 'Set daily and weekly earning caps for anti-abuse protection.',
      icon: Shield,
      fields: [
        { key: 'dailyEarningLimit', label: 'Daily Limit (coins)', placeholder: '500' },
        { key: 'weeklyEarningLimit', label: 'Weekly Limit (coins)', placeholder: '2500' },
      ],
    },
    {
      title: 'Platform Fees & Withdrawals',
      description: 'Configure platform fees and withdrawal rules.',
      icon: CreditCard,
      fields: [
        { key: 'platformFee', label: 'Platform Fee (%)', placeholder: '5' },
        { key: 'minWithdrawal', label: 'Minimum Withdrawal (coins)', placeholder: '100' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform variables and rules.</p>
      </div>

      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={field.key}
                        type="number"
                        value={settings[field.key as keyof typeof settings]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                      {field.suffix && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{field.suffix}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Subscription Plans Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creator Subscription Plans</CardTitle>
          <CardDescription>Overview of available plans for creators.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: 'Starter', price: 'Free', campaigns: '3 campaigns', features: ['Basic analytics', 'Email support'] },
              { name: 'Professional', price: '₹999/mo', campaigns: '15 campaigns', features: ['Advanced analytics', 'Priority support', 'Custom branding'] },
              { name: 'Enterprise', price: '₹4,999/mo', campaigns: 'Unlimited', features: ['Premium support', 'API access', 'Dedicated manager', 'Custom integrations'] },
            ].map((plan, i) => (
              <div key={i} className={`p-4 rounded-lg border ${i === 1 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <p className="font-bold">{plan.name}</p>
                <p className="text-2xl font-bold mt-1">{plan.price}</p>
                <p className="text-sm text-muted-foreground mt-1">{plan.campaigns}</p>
                <ul className="mt-3 space-y-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Save className="w-4 h-4 mr-2" /> Save All Settings
        </Button>
      </div>
    </div>
  );
}
