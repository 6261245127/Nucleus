'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart3, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreatorDashboard() {
  const { user } = useAuth();
  
  // Mock data for initial phase. Real implementation will fetch from API
  const stats = [
    { title: 'Active Campaigns', value: '3', icon: Activity, change: '+1' },
    { title: 'Total Engagement', value: '12,543', icon: Users, change: '+15%' },
    { title: 'Avg. CTR', value: '4.2%', icon: BarChart3, change: '+0.5%' },
    { title: 'Wallet Balance', value: '500 Coins', icon: Wallet, change: '-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Here is what is happening with your campaigns today.</p>
        </div>
        <Link href="/dashboard/creator/campaigns/new">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  {' '}from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-border mt-4">
            <p className="text-muted-foreground">Chart will be rendered here in Phase 7</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Campaign "Summer Promo" reached 1k views</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
