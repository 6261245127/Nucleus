'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionData {
  id: string;
  amount: number;
  type: string;
  status: string;
  paymentMethod: string | null;
  orderId: string | null;
  gateway: string | null;
  description: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
}

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, error, isLoading } = useSWR(
    token ? ['/api/admin/transactions', token] : null,
    ([url, t]) => fetcher(url, t)
  );

  const transactions: TransactionData[] = data?.transactions || [];
  
  const filtered = transactions.filter(tx => {
    const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    return matchType && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'FAILED': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (['DEPOSIT', 'TASK_REWARD', 'BONUS_REWARD', 'REFERRAL_REWARD'].includes(type)) {
      return <ArrowDownRight className="w-4 h-4 text-green-500" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-red-500" />;
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Transactions</h1>
        <p className="text-muted-foreground mt-1">Monitor all system-wide deposits, withdrawals, and campaign spends.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Successful Deposits', amount: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0), color: 'text-green-500' },
          { label: 'Pending Deposits', amount: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0), color: 'text-yellow-500' },
          { label: 'Total Withdrawals', amount: transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0), color: 'text-blue-500' },
          { label: 'Failed Transactions', amount: transactions.filter(t => t.status === 'FAILED').length, color: 'text-red-500', isCount: true },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>
                {item.isCount ? item.amount : `₹${item.amount.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Filters */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="DEPOSIT">Deposits</SelectItem>
            <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
            <SelectItem value="CAMPAIGN_PAYMENT">Campaign Spends</SelectItem>
            <SelectItem value="TASK_REWARD">Task Rewards</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type & Desc</TableHead>
                <TableHead>Gateway / Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {tx.user ? (
                      <div>
                        <p className="text-sm font-medium">{tx.user.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      <div>
                        <p className="font-medium text-sm">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{tx.gateway || 'INTERNAL'}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.paymentMethod || 'N/A'}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{tx.amount.toFixed(2)}
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
