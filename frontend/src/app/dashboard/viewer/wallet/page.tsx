'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Gift, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export default function ViewerWalletPage() {
  const { token } = useAuth();

  const { data: walletData, error, isLoading } = useSWR(
    token ? ['/api/wallet', token] : null,
    ([url, t]) => fetcher(url, t),
    { refreshInterval: 5000 } // Auto-refresh every 5s for real-time feel
  );

  const transactions: Transaction[] = walletData?.transactions || [];
  const coinBalance = walletData?.balance || 0;
  const stats = walletData?.stats || { totalEarned: 0, totalRedeemed: 0 };

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
      default: return <Badge variant="outline">{type.replace('_', ' ')}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
            <p className="text-4xl font-bold text-green-500">{stats.totalEarned.toLocaleString()}</p>
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
            <p className="text-4xl font-bold text-orange-500">{stats.totalRedeemed.toLocaleString()}</p>
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
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No transactions yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Complete tasks to start earning coins!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getTypeIcon(tx.type, tx.amount)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.type.replace('_', ' ')}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getTypeBadge(tx.type)}
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount} 🪙
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
