'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  budget: number;
  status: string;
  _count?: { tasks: number };
}

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`/api/campaigns`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setCampaigns(Array.isArray(data) ? data : (data.campaigns || []));
        }
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCampaigns();
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'PAUSED': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage your content promotion campaigns.</p>
        </div>
        <Link href="/dashboard/creator/campaigns/new">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created any campaigns yet.</p>
              <Link href="/dashboard/creator/campaigns/new">
                <Button variant="outline">Create your first campaign</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Reward/Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.platform}</TableCell>
                    <TableCell>{campaign.rewardPerTask} Coins</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)} variant="outline">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign._count?.tasks || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Metrics</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
