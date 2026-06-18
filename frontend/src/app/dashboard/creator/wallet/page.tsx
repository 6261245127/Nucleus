'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Wallet, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CreatorWalletPage() {
  const { token, user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Wallet
      const res = await fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.user.wallet?.fiatBalance || 0);
      }

      // Fetch Transactions
      const txRes = await fetch(`/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handlePayment = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 100) {
      toast.error('Minimum deposit amount is ₹100');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'dummy_key_id',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CreatorBoost',
        description: 'Wallet Deposit',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message);

            toast.success(`₹${amount} successfully added to your wallet`);
            setIsDepositModalOpen(false);
            setDepositAmount('');
            fetchData(); // Refresh balance and history
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#3b82f6', // primary blue
        }
      };

      // Handle fallback mode if dummy key is used
      if (options.key === 'dummy_key_id') {
         // Automatically simulate successful verification for testing
         toast.success('Test mode: Simulating successful payment');
         
         const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_dummy_${Date.now()}`,
              razorpay_signature: 'dummy_signature'
            })
          });

          if (verifyRes.ok) {
            setIsDepositModalOpen(false);
            setDepositAmount('');
            fetchData();
          }
         return;
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your connection.');
      }

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'FAILED': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creator Wallet</h1>
        <p className="text-muted-foreground mt-1">
          Manage your campaign funds securely.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-[#0A1128] to-primary/20 border-primary/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Fiat Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-white/60 mt-2">Available for funding campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
              <Button onClick={() => setIsDepositModalOpen(true)} className="w-full h-16 text-lg group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl transition-all hover:scale-[1.02]">
                <Plus className="w-5 h-5 mr-2" />
                Add Funds
              </Button>
              <DialogContent className="sm:max-w-md bg-[#0A1128] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add Funds</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Add money to your CreatorBoost wallet to fund campaigns.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 5000, 10000].map(amt => (
                      <Button
                        key={amt}
                        type="button"
                        variant={depositAmount === amt ? 'default' : 'outline'}
                        className={`w-full ${depositAmount === amt ? 'bg-primary text-white border-primary' : 'border-white/10 text-white hover:bg-white/10 hover:text-white'}`}
                        onClick={() => setDepositAmount(amt)}
                      >
                        ₹{amt}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">Custom Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount..."
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-lg h-12"
                    />
                  </div>
                  <div className="pt-2">
                    <Button 
                      className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white" 
                      onClick={handlePayment}
                      disabled={isProcessing || !depositAmount || Number(depositAmount) < 100}
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        `Pay ₹${depositAmount || '0'} Securely`
                      )}
                    </Button>
                    <p className="text-center text-[10px] text-white/40 mt-3 font-medium uppercase tracking-wider">
                      Secured by Razorpay • UPI, Cards, NetBanking Supported
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent deposits and campaign spends.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-white/50">
                    No transactions found. Add funds to get started.
                  </TableCell>
                </TableRow>
              ) : transactions.map((tx) => (
                <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-sm text-white/70">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{tx.description || 'Transaction'}</p>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">{tx.orderId || tx.id}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 text-white/70">{tx.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tx.status)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
