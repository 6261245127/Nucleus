'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Gift } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

export default function ViewerWalletPage() {
  const { token } = useAuth();

  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setCoinBalance(data.user.wallet?.coinBalance || 0);
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    if (token) fetchWallet();
  }, [token]);

  // Mock stats for dev mode
  const walletData = {
    stats: {
      totalEarned: 2100,
      totalRedeemed: 850,
    },
  };

  const transactions: Transaction[] = [
    { id: '1', amount: 10, type: 'TASK_REWARD', description: 'Watched "Tech Review" on YouTube', createdAt: new Date().toISOString() },
    { id: '2', amount: 25, type: 'REFERRAL_REWARD', description: 'Referral bonus from @john', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', amount: 5, type: 'TASK_REWARD', description: 'Watched "Summer Promo" reel on Instagram', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', amount: 2, type: 'BONUS_REWARD', description: 'Daily login reward', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '5', amount: -100, type: 'WITHDRAWAL', description: 'Withdrawal to UPI', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: '6', amount: 15, type: 'TASK_REWARD', description: 'Subscribed to "CodeAcademy" on YouTube', createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: '7', amount: 8, type: 'TASK_REWARD', description: 'Followed @NewsDaily on Threads', createdAt: new Date(Date.now() - 345600000).toISOString() },
  ];

  const getTypeIcon = (type: string, amount: number) => {
    if (amount < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    if (type === 'REFERRAL_REWARD') return <Gift className="w-4 h-4 text-blue-500" />;
    return <ArrowUpRight className="w-4 h-4 text-green-500" />;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'TASK_REWARD': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Task</Badge>;
      case 'REFERRAL_REWARD': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Referral</Badge>;
      case 'BONUS_REWARD': return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Bonus</Badge>;
      case 'WITHDRAWAL': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Withdrawal</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground mt-1">Track your earnings, view transactions, and request withdrawals.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <CardContent className="relative pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Coins className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground">Coin Balance</p>
            </div>
            <p className="text-4xl font-bold">{coinBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Available coins</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <p className="text-4xl font-bold text-green-500">{walletData.stats.totalEarned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Wallet className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">Redeemed</p>
            </div>
            <p className="text-4xl font-bold text-orange-500">{walletData.stats.totalRedeemed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total withdrawn</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          Request Withdrawal
        </Button>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {getTypeIcon(tx.type, tx.amount)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getTypeBadge(tx.type)}
                      <span className="text-xs text-muted-foreground">{formatTime(tx.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount} 🪙
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
