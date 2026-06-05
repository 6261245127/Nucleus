'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Pause, Trash2, Loader2, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CampaignData {
  id: string;
  name: string;
  platform: string;
  budget: number;
  spent: number;
  status: string;
  durationDays: number;
  niche: string;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
  _count: {
    tasks: number;
  };
}

export default function AdminCampaignsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [rewardInput, setRewardInput] = useState('');
  const [adminStartDate, setAdminStartDate] = useState('');
  const [adminEndDate, setAdminEndDate] = useState('');

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/admin/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : (data.campaigns || []));
      }
    } catch (e) {
      console.error('Failed to fetch campaigns', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCampaigns();
  }, [token]);

  const updateStatus = async (id: string, newStatus: string, budget?: number, rewardPerTask?: number, startDate?: string, endDate?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (budget) payload.budget = budget;
      if (rewardPerTask) payload.rewardPerTask = rewardPerTask;
      if (startDate) payload.adminStartDate = new Date(startDate).toISOString();
      if (endDate) payload.adminEndDate = new Date(endDate).toISOString();

      const res = await fetch(`/api/admin/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
        return;
      }
      
      if (res.ok) {
        fetchCampaigns();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const openApproveModal = (campaign: CampaignData) => {
    setSelectedCampaignId(campaign.id);
    setBudgetInput('');
    setRewardInput('');
    setAdminStartDate(new Date().toISOString().split('T')[0]);
    
    // Default the end date based on creator's requested duration
    const endDate = new Date(Date.now() + (campaign.durationDays || 7) * 24 * 60 * 60 * 1000);
    setAdminEndDate(endDate.toISOString().split('T')[0]);
    
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = () => {
    if (!selectedCampaignId) return;
    if (!budgetInput || !rewardInput || !adminStartDate || !adminEndDate) return alert("Please fill all required fields");
    
    updateStatus(selectedCampaignId, 'ACTIVE', parseFloat(budgetInput), parseFloat(rewardInput), adminStartDate, adminEndDate);
    setApproveModalOpen(false);
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCampaigns();
      }
    } catch (e) {
      console.error('Failed to delete campaign', e);
    }
  };

  const filtered = statusFilter === 'ALL' ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">Active</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" variant="outline">Pending</Badge>;
      case 'PAUSED': return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20" variant="outline">Paused</Badge>;
      case 'COMPLETED': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20" variant="outline">Completed</Badge>;
      case 'REJECTED': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM': return 'text-pink-500';
      case 'YOUTUBE': return 'text-red-500';
      case 'FACEBOOK': return 'text-blue-500';
      case 'THREADS': return 'text-foreground';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
        <p className="text-muted-foreground mt-1">Review, approve, reject, pause, or delete campaigns.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPlatformColor(campaign.platform)}`}>
                      {campaign.platform}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{campaign.creator?.name || 'Unknown'}</TableCell>
                  <TableCell><Badge variant="outline">{campaign.niche || 'General'}</Badge></TableCell>
                  <TableCell>{campaign.durationDays || 7} Days</TableCell>
                  <TableCell>{campaign.budget?.toLocaleString() || 0} 🪙</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span>{(campaign.spent || 0).toLocaleString()}</span>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary rounded-full h-1.5 transition-all"
                          style={{ width: `${Math.min(((campaign.spent || 0) / campaign.budget) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{campaign._count?.tasks || 0}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {campaign.status === 'PENDING' && (
                        <>
                          <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10" onClick={() => openApproveModal(campaign)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={() => updateStatus(campaign.id, 'REJECTED')}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {campaign.status === 'ACTIVE' && (
                        <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-500/10" onClick={() => updateStatus(campaign.id, 'PAUSED')}>
                          <Pause className="w-4 h-4 mr-1" /> Pause
                        </Button>
                      )}
                      {campaign.status === 'PAUSED' && (
                        <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10" onClick={() => updateStatus(campaign.id, 'ACTIVE')}>
                          <Play className="w-4 h-4 mr-1" /> Resume
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteCampaign(campaign.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget (Coins)</Label>
                <Input type="number" placeholder="e.g. 1000" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Reward Per Viewer (Coins)</Label>
                <Input type="number" placeholder="e.g. 5" step="0.1" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={adminStartDate} onChange={(e) => setAdminStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={adminEndDate} onChange={(e) => setAdminEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleApproveSubmit}>Confirm & Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
