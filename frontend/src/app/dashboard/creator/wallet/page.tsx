'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CreatorWalletPage() {
  const { token, user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await fetch(`/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.user.wallet?.fiatBalance || 0);
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (token) {
      fetchWallet();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creator Wallet</h1>
        <p className="text-muted-foreground mt-1">
          Manage your campaign funds and deposit fiat currency.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fiat Balance</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="w-full" onClick={() => alert('Payment gateway integration pending')}>$50</Button>
              <Button variant="outline" className="w-full" onClick={() => alert('Payment gateway integration pending')}>$100</Button>
              <Button variant="outline" className="w-full" onClick={() => alert('Payment gateway integration pending')}>$500</Button>
            </div>
            <Button className="w-full group" onClick={() => alert('Payment gateway integration pending')}>
              <Plus className="w-4 h-4 mr-2" />
              Custom Amount
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
