'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Trophy, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ViewerDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Coins', value: '1,250', icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Tasks Completed', value: '47', icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Referral Earnings', value: '320', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'This Week', value: '+185', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hey, {user?.name} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete tasks, earn coins, and redeem rewards.
          </p>
        </div>
        <Link href="/dashboard/viewer/tasks">
          <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
            Browse Tasks
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
              {/* Decorative gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-accent/50" />
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Tasks Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Tasks</span>
              <Link href="/dashboard/viewer/tasks">
                <Button variant="ghost" size="sm" className="text-primary">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Watch Instagram Reel', platform: 'Instagram', reward: 5 },
              { name: 'Like YouTube Video', platform: 'YouTube', reward: 10 },
              { name: 'View Facebook Post', platform: 'Facebook', reward: 3 },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium">{task.name}</p>
                  <p className="text-xs text-muted-foreground">{task.platform}</p>
                </div>
                <span className="text-sm font-bold text-yellow-500">+{task.reward} 🪙</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Earnings</span>
              <Link href="/dashboard/viewer/wallet">
                <Button variant="ghost" size="sm" className="text-primary">View Wallet</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { desc: 'Watched "Summer Promo" reel', coins: 5, time: '2 min ago' },
              { desc: 'Referral bonus from @john', coins: 25, time: '1 hour ago' },
              { desc: 'Liked "Tech Review" video', coins: 10, time: '3 hours ago' },
              { desc: 'Daily login reward', coins: 2, time: 'Today' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{item.desc}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <span className="text-sm font-bold text-green-500">+{item.coins}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
