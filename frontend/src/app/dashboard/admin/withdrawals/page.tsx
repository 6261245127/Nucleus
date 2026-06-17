'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Banknote, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WithdrawalData {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export default function AdminWithdrawalsPage() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/api/admin/withdrawals', token] : null,
    ([url, t]) => fetcher(url, t)
  );

  const withdrawals: WithdrawalData[] = data?.data || [];
  const filtered = statusFilter === 'ALL' ? withdrawals : withdrawals.filter((w) => w.status === statusFilter);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        mutate();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'REVIEW': return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20" variant="outline">Under Review</Badge>;
      case 'APPROVED': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20" variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'PAID': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline"><Banknote className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'REJECTED': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'UPI': return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">UPI</Badge>;
      case 'BANK_TRANSFER': return <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">Bank</Badge>;
      case 'PAYPAL': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">PayPal</Badge>;
      default: return <Badge variant="outline">{method}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Management</h1>
        <p className="text-muted-foreground mt-1">Review and process user withdrawal requests.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending', count: withdrawals.filter(w => w.status === 'PENDING').length, amount: withdrawals.filter(w => w.status === 'PENDING').reduce((acc, w) => acc + w.amount, 0), color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Under Review', count: withdrawals.filter(w => w.status === 'REVIEW').length, amount: withdrawals.filter(w => w.status === 'REVIEW').reduce((acc, w) => acc + w.amount, 0), color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Approved', count: withdrawals.filter(w => w.status === 'APPROVED').length, amount: withdrawals.filter(w => w.status === 'APPROVED').reduce((acc, w) => acc + w.amount, 0), color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Paid', count: withdrawals.filter(w => w.status === 'PAID').length, amount: withdrawals.filter(w => w.status === 'PAID').reduce((acc, w) => acc + w.amount, 0), color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.amount.toLocaleString()} 🪙</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="REVIEW">Under Review</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No withdrawal requests found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{w.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{w.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{w.amount} 🪙</TableCell>
                  <TableCell>{getMethodBadge(w.method)}</TableCell>
                  <TableCell>{getStatusBadge(w.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {w.status === 'PENDING' && (
                        <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-500/10" onClick={() => updateStatus(w.id, 'REVIEW')}>
                          Review
                        </Button>
                      )}
                      {(w.status === 'PENDING' || w.status === 'REVIEW') && (
                        <>
                          <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10" onClick={() => updateStatus(w.id, 'APPROVED')}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={() => updateStatus(w.id, 'REJECTED')}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {w.status === 'APPROVED' && (
                        <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10" onClick={() => updateStatus(w.id, 'PAID')}>
                          <Banknote className="w-4 h-4 mr-1" /> Mark Paid
                        </Button>
                      )}
                    </div>
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
